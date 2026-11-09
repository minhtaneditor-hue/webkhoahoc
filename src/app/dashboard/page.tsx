"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { isAdmin } from '@/lib/admin';
import { lessonsInOrder } from '@/lib/curriculum';
import { contactFrom } from '@/lib/site-settings';
import { useSiteSettings } from '@/components/SiteContext';
import ConsultBox from '@/components/ConsultBox';
import ProfileForm, { type Profile } from '@/components/dashboard/ProfileForm';
import { planOf, MEMBER_DISCOUNT_PERCENT } from '@/lib/membership';
import { Loader2, ArrowRight, Award, BookOpen, Crown, Download, Gift, MessageCircle, ShoppingBag, LogOut, UserRound, Users } from 'lucide-react';

type CourseStat = { total: number; done: number; next: { id: string; title: string } | null; first: string | null };

const STATUS_LABEL: Record<string, string> = { success: 'Thành công', pending: 'Đang chờ', failed: 'Thất bại' };

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [adminCourses, setAdminCourses] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Record<string, CourseStat>>({});
  const [assets, setAssets] = useState<any[]>([]);
  const [downloading, setDownloading] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [memberUntil, setMemberUntil] = useState<string | null>(null);
  const contact = contactFrom(useSiteSettings());

  useEffect(() => {
    async function load() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }
      setUser(user);

      const [{ data: enrollmentData }, { data: paymentData }, { data: profileData }, { data: paidAssets }, { data: membershipData }] = await Promise.all([
        supabase.from('enrollments').select('course_id, status, enrolled_at, courses ( id, title, description )').eq('user_id', user.id),
        supabase.from('payments').select('id, order_id, amount, status, created_at, membership_plan, courses ( title )').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('users').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('payments').select('asset_id').eq('user_id', user.id).eq('status', 'success').not('asset_id', 'is', null),
        supabase.from('memberships').select('expires_at').eq('user_id', user.id).maybeSingle(),
      ]);
      setProfile(profileData || {});
      setMemberUntil(membershipData?.expires_at ?? null);

      // Progress per enrolled course, in study order (same count the certificate checks)
      const courseIds = (enrollmentData || []).map((e) => e.course_id);
      if (courseIds.length) {
        const [{ data: outline }, { data: chapters }] = await Promise.all([
          supabase.from('lesson_outline').select('id, course_id, title, order_index, chapter_id').in('course_id', courseIds).order('order_index'),
          supabase.from('chapters').select('id, course_id, title, order_index').in('course_id', courseIds).order('order_index'),
        ]);
        const ids = (outline || []).map((l) => l.id);
        const { data: progress } = ids.length
          ? await supabase.from('student_progress').select('lesson_id').eq('user_id', user.id).eq('is_completed', true).in('lesson_id', ids)
          : { data: [] };
        const finished = new Set((progress || []).map((p) => p.lesson_id));
        setStats(Object.fromEntries(courseIds.map((id) => {
          const list = lessonsInOrder((chapters || []).filter((c) => c.course_id === id), (outline || []).filter((l) => l.course_id === id));
          return [id, {
            total: list.length,
            done: list.filter((l) => finished.has(l.id)).length,
            next: list.find((l) => !finished.has(l.id)) ?? null,
            first: list[0]?.id ?? null,
          }];
        })));
      }

      const assetIds = [...new Set((paidAssets || []).map((p) => p.asset_id))];
      if (assetIds.length) {
        const { data: owned } = await supabase.from('digital_assets_public').select('id, title, thumbnail_url').in('id', assetIds);
        setAssets(owned || []);
      }

      setEnrollments(enrollmentData || []);
      // Admins can open every course, but that is not an enrolment: listed apart so this page never reads as "granted"
      if (isAdmin(user.email)) {
        const { data: courses } = await supabase.from('courses').select('id, title, description, created_at').order('created_at');
        const own = new Set((enrollmentData || []).map((e) => e.course_id));
        setAdminCourses((courses || []).filter((c) => !own.has(c.id)));
      }
      setPayments(paymentData || []);

      await supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id);
      setLoading(false);
    }
    load();
  }, [router]);

  async function download(id: string) {
    setDownloading(id);
    setDownloadError('');
    try {
      const res = await fetch(`/api/shop/download?assetId=${id}`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank', 'noopener');
      else setDownloadError(data.error || 'Không lấy được link tải.');
    } catch {
      setDownloadError('Không kết nối được máy chủ. Kiểm tra mạng và thử lại.');
    } finally {
      setDownloading('');
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <main className="container-lux py-24 flex items-center justify-center gap-3 text-muted-foreground" aria-busy="true">
        <Loader2 className="animate-spin" size={20} aria-hidden="true" /> Đang tải khu học tập…
      </main>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0];
  const studying = enrollments.some((en) => en.status === 'active');

  // Membership card: only for people who have (or had) a membership
  const membershipCard = (className: string) => {
    if (!memberUntil) return null;
    const daysLeft = Math.ceil((Date.parse(memberUntil) - Date.now()) / 864e5);
    const active = daysLeft > 0;
    const until = new Date(memberUntil).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    return (
      <div className={`rounded-[var(--radius-card)] p-6 ${active ? 'surface-dark' : 'card'} ${className}`}>
        <p className={`flex items-center gap-2 text-sm font-semibold ${active ? 'text-gold-light' : 'text-muted-foreground'}`}>
          <Crown size={16} aria-hidden="true" /> {active ? 'Hội viên TẤN VA' : 'Hội viên đã hết hạn'}
        </p>
        <p className={`mt-2 text-xl font-bold ${active ? 'text-white' : 'text-ink'}`}>
          {active ? `Đến hết ngày ${until}` : `Hết hạn ngày ${until}`}
        </p>
        <p className={`mt-1 text-sm ${active ? 'text-stone-300' : 'text-muted-foreground'}`}>
          {active
            ? `Còn ${daysLeft} ngày · giảm ${MEMBER_DISCOUNT_PERCENT.course}% khoá học, ${MEMBER_DISCOUNT_PERCENT.asset}% Shop`
            : 'Gia hạn để dùng tiếp template, live và giá hội viên.'}
        </p>
        <Link href="/hoi-vien#bang-gia" className={`btn w-full mt-5 ${active && daysLeft > 7 ? 'btn-outline-light' : 'btn-gold'}`}>
          {active ? 'Gia hạn thêm' : 'Gia hạn ngay'} <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  };

  return (
    <main className="container-lux py-10 md:py-14">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line">
        <div className="flex items-center gap-4 min-w-0">
          <span className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- the student's own uploaded photo
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover !rounded-none" />
            ) : <UserRound size={28} className="text-muted-foreground" aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <h1 className="text-4xl md:text-5xl break-words">Xin chào, {displayName}</h1>
            <p className="mt-2 text-muted-foreground break-all">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2 self-start md:self-auto">
          <a href="#ho-so" className="btn btn-outline whitespace-nowrap"><UserRound size={16} aria-hidden="true" /> Hồ sơ</a>
          <button onClick={handleSignOut} className="btn btn-outline whitespace-nowrap"><LogOut size={16} aria-hidden="true" /> Đăng xuất</button>
        </div>
      </header>

      {!profile?.full_name && (
        <p className="mt-6 rounded-md bg-gold-soft p-4 text-sm">
          Bạn chưa có họ tên trong hồ sơ. <a href="#ho-so" className="font-semibold text-gold hover:text-gold-hover">Bổ sung ngay</a> để chứng chỉ in đúng tên của bạn.
        </p>
      )}

      {membershipCard('mt-8 lg:hidden')}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12 min-w-0">
          {/* Courses */}
          <section aria-labelledby="my-courses">
            <h2 id="my-courses" className="text-3xl">Khóa học của tôi</h2>
            {enrollments.length === 0 && adminCourses.length > 0 ? (
              <p className="mt-4 text-muted-foreground">Tài khoản này chưa được ghi danh khóa nào.</p>
            ) : enrollments.length === 0 ? (
              <div className="mt-6 card p-8 text-center">
                <BookOpen size={28} className="mx-auto text-gold" aria-hidden="true" />
                <p className="mt-4 font-display text-2xl">Bạn chưa đăng ký khóa học nào</p>
                <p className="mt-2 text-muted-foreground">Bắt đầu với bài học thử miễn phí trong mỗi khóa.</p>
                <Link href="/courses" className="btn btn-gold mt-6">Khám phá khóa học</Link>
              </div>
            ) : (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {enrollments.map((en) => {
                  const stat = stats[en.course_id];
                  const active = en.status === 'active';
                  const percent = stat?.total ? Math.round((stat.done / stat.total) * 100) : 0;
                  const finished = !!stat?.total && stat.done === stat.total;
                  return (
                    <li key={en.course_id} className="card p-6 flex flex-col">
                      <span className={`badge self-start ${!active ? '!bg-muted !text-muted-foreground' : ''}`}>{!active ? 'Hết hạn' : finished ? 'Đã hoàn thành' : 'Đang học'}</span>
                      <h3 className="mt-4 text-2xl">{en.courses?.title}</h3>

                      {active && !!stat?.total && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-muted-foreground"><span>{stat.done}/{stat.total} bài</span><span className="font-semibold text-ink">{percent}%</span></div>
                          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${en.courses?.title}`}>
                            <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                          </div>
                          {stat.next && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">Bài tiếp theo: <span className="text-ink font-semibold">{stat.next.title}</span></p>}
                        </div>
                      )}

                      <div className="mt-auto pt-6 flex flex-wrap gap-2">
                        {!active || !stat?.first ? (
                          <Link href={`/courses/${en.course_id}`} className="btn btn-dark !min-h-[44px] text-sm">Xem khóa học <ArrowRight size={16} aria-hidden="true" /></Link>
                        ) : (
                          <Link href={`/learn/${en.course_id}/${stat.next?.id ?? stat.first}`} className={`btn !min-h-[44px] text-sm ${finished ? 'btn-outline' : 'btn-dark'}`}>
                            {finished ? 'Xem lại' : stat.done ? 'Học tiếp' : 'Bắt đầu học'} <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        )}
                        {active && finished && <Link href={`/certificate/${en.course_id}`} className="btn btn-gold !min-h-[44px] text-sm"><Award size={16} aria-hidden="true" /> Nhận chứng chỉ</Link>}
                      </div>

                      {active && finished && (
                        <div className="mt-5 rounded-md bg-gold-soft p-4">
                          <p className="font-semibold flex items-center gap-2"><Gift size={16} className="text-gold shrink-0" aria-hidden="true" /> Quà hoàn thành: Audit 1 tiếng 1-1</p>
                          <p className="mt-1 mb-3 text-sm text-muted-foreground">Minh Tấn xem lại các video bạn làm trong khóa và định hướng bước tiếp theo.</p>
                          <ConsultBox kind="audit" product={`Audit 1 tiếng · ${en.courses?.title}`} label="Đặt lịch Audit 1 tiếng" variant="dark"
                            defaults={{ name: profile?.full_name || '', email: user?.email || '', phone: profile?.phone || '' }} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {adminCourses.length > 0 && (
            <section aria-labelledby="admin-courses">
              <h2 id="admin-courses" className="text-3xl">Mở bằng quyền admin</h2>
              <p className="mt-2 text-muted-foreground">Chỉ tài khoản admin mới thấy mục này. Học viên chỉ thấy đúng khóa được cấp hoặc đã mua. Xem khóa của từng học viên ở <Link href="/admin/students" className="text-gold font-semibold hover:text-gold-hover">Admin → Học viên</Link>.</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {adminCourses.map((c) => (
                  <li key={c.id} className="card card-hover p-6 flex flex-col">
                    <span className="badge self-start !bg-muted !text-muted-foreground">Quyền admin</span>
                    <h3 className="mt-4 text-2xl">{c.title}</h3>
                    {c.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                    <Link href={`/courses/${c.id}`} className="btn btn-outline mt-6 self-start !min-h-[44px] text-sm">Mở khóa học <ArrowRight size={16} aria-hidden="true" /></Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {assets.length > 0 && (
            <section aria-labelledby="my-products">
              <h2 id="my-products" className="text-3xl">Sản phẩm đã mua</h2>
              {downloadError && <p role="alert" className="mt-3 text-sm text-danger">{downloadError}</p>}
              <ul className="mt-6 space-y-3">
                {assets.map((a) => (
                  <li key={a.id} className="card p-4 flex items-center gap-4">
                    {a.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element -- small cover of a purchased product
                      <img src={a.thumbnail_url} alt="" className="w-20 h-16 shrink-0 object-cover" />
                    )}
                    <p className="flex-1 min-w-0 font-semibold">{a.title}</p>
                    <button type="button" onClick={() => download(a.id)} disabled={downloading === a.id} className="btn btn-dark !min-h-[44px] text-sm shrink-0">
                      {downloading === a.id ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />} Tải về
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Payments */}
          <section aria-labelledby="payments-title">
            <h2 id="payments-title" className="text-3xl flex items-center gap-3">Lịch sử thanh toán</h2>
            {payments.length === 0 ? (
              <p className="mt-4 text-muted-foreground">Chưa có giao dịch nào.</p>
            ) : (
              <div className="mt-6 card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground border-b border-line">
                    <tr><th className="p-4 font-semibold">Ngày</th><th className="p-4 font-semibold">Sản phẩm</th><th className="p-4 font-semibold text-right">Số tiền</th><th className="p-4 font-semibold">Trạng thái</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="p-4 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">{planOf(p.membership_plan)?.title || p.courses?.title || 'Ebook / Preset'}</td>
                        <td className="p-4 text-right whitespace-nowrap font-semibold">{formatVND(p.amount)}</td>
                        <td className="p-4"><span className={`badge ${p.status === 'success' ? '!bg-green-50 !text-success' : p.status === 'failed' ? '!bg-red-50 !text-danger' : ''}`}>{STATUS_LABEL[p.status] || p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Profile */}
          <section id="ho-so" aria-labelledby="profile-title" className="scroll-mt-28">
            <h2 id="profile-title" className="text-3xl">Hồ sơ</h2>
            {profile && user && (
              <ProfileForm userId={user.id} email={user.email} profile={profile} onSaved={(patch) => setProfile((cur) => ({ ...cur, ...patch }))} />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          {/* Membership on wide screens; phones get the same card at the top of the page */}
          {membershipCard('hidden lg:block')}
          {studying && (
            <a href={contact.zaloGroupHref} target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex items-center gap-4">
              <span className="w-11 h-11 rounded-md bg-onyx text-gold-light flex items-center justify-center shrink-0"><Users size={20} aria-hidden="true" /></span>
              <span><span className="block font-semibold">Nhóm Zalo học viên</span><span className="block text-sm text-muted-foreground">Nộp bài tập, hỏi đáp cùng Minh Tấn</span></span>
            </a>
          )}
          <a href={contact.zaloHref} target="_blank" rel="noopener noreferrer" className="card card-hover p-6 flex items-center gap-4">
            <span className="w-11 h-11 rounded-md bg-onyx text-gold-light flex items-center justify-center shrink-0"><MessageCircle size={20} aria-hidden="true" /></span>
            <span><span className="block font-semibold">Nhắn Zalo hỗ trợ</span><span className="block text-sm text-muted-foreground">Cần hóa đơn hoặc gặp vấn đề khi học</span></span>
          </a>
          <Link href="/shop" className="card card-hover p-6 flex items-center gap-4">
            <span className="w-11 h-11 rounded-md bg-onyx text-gold-light flex items-center justify-center shrink-0"><ShoppingBag size={20} aria-hidden="true" /></span>
            <span><span className="block font-semibold">Sản phẩm khác</span><span className="block text-sm text-muted-foreground">Tải lại sản phẩm đã mua</span></span>
          </Link>

        </aside>
      </div>
    </main>
  );
}
