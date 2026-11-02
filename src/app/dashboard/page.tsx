"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { isAdmin } from '@/lib/admin';
import { Loader2, ArrowRight, BookOpen, ShoppingBag, Receipt, LogOut } from 'lucide-react';


const STATUS_LABEL: Record<string, string> = { success: 'Thành công', pending: 'Đang chờ', failed: 'Thất bại' };

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }
      setUser(user);

      const [{ data: enrollmentData }, { data: paymentData }] = await Promise.all([
        supabase.from('enrollments').select('course_id, status, enrolled_at, courses ( id, title, description )').eq('user_id', user.id),
        supabase.from('payments').select('id, order_id, amount, status, created_at, courses ( title )').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
      ]);

      // Admin accounts own every course: list all of them as active enrolments
      if (isAdmin(user.email)) {
        const { data: courses } = await supabase.from('courses').select('id, title, description, created_at').order('created_at');
        const own = new Set((enrollmentData || []).map((e) => e.course_id));
        setEnrollments([
          ...(enrollmentData || []),
          ...(courses || []).filter((c) => !own.has(c.id)).map((c) => ({ course_id: c.id, status: 'active', enrolled_at: c.created_at, courses: c })),
        ]);
      } else {
        setEnrollments(enrollmentData || []);
      }
      setPayments(paymentData || []);

      await supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id);
      setLoading(false);
    }
    load();
  }, [router]);

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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0];

  return (
    <main className="container-lux py-10 md:py-14">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line">
        <div>
          <h1 className="text-4xl md:text-5xl">Xin chào, {displayName}</h1>
          <p className="mt-2 text-muted-foreground">{user?.email}</p>
        </div>
        <button onClick={handleSignOut} className="btn btn-outline self-start md:self-auto"><LogOut size={16} aria-hidden="true" /> Đăng xuất</button>
      </header>


      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-12 min-w-0">
          {/* Courses */}
          <section aria-labelledby="my-courses">
            <h2 id="my-courses" className="text-3xl">Khóa học của tôi</h2>
            {enrollments.length === 0 ? (
              <div className="mt-6 card p-8 text-center">
                <BookOpen size={28} className="mx-auto text-gold" aria-hidden="true" />
                <p className="mt-4 font-display text-2xl">Bạn chưa đăng ký khóa học nào</p>
                <p className="mt-2 text-muted-foreground">Bắt đầu với bài học thử miễn phí trong mỗi khóa.</p>
                <Link href="/courses" className="btn btn-gold mt-6">Khám phá khóa học</Link>
              </div>
            ) : (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {enrollments.map((en) => (
                  <li key={en.course_id} className="card card-hover p-6 flex flex-col">
                    <span className={`badge self-start ${en.status !== 'active' ? '!bg-muted !text-muted-foreground' : ''}`}>{en.status === 'active' ? 'Đang học' : 'Hết hạn'}</span>
                    <h3 className="mt-4 text-2xl">{en.courses?.title}</h3>
                    {en.courses?.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{en.courses.description}</p>}
                    <Link href={`/courses/${en.course_id}`} className="btn btn-dark mt-6 self-start !min-h-[44px] text-sm">Vào học <ArrowRight size={16} aria-hidden="true" /></Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

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
                        <td className="p-4">{p.courses?.title || 'Ebook / Preset'}</td>
                        <td className="p-4 text-right whitespace-nowrap font-semibold">{formatVND(p.amount)}</td>
                        <td className="p-4"><span className={`badge ${p.status === 'success' ? '!bg-green-50 !text-success' : p.status === 'failed' ? '!bg-red-50 !text-danger' : ''}`}>{STATUS_LABEL[p.status] || p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <Link href="/shop" className="card card-hover p-6 flex items-center gap-4">
            <span className="w-11 h-11 rounded-md bg-onyx text-gold-light flex items-center justify-center shrink-0"><ShoppingBag size={20} aria-hidden="true" /></span>
            <span><span className="block font-semibold">Ebook & Preset</span><span className="block text-sm text-muted-foreground">Tải lại sản phẩm đã mua</span></span>
          </Link>

          <div className="card p-6 flex items-center gap-4">
            <Receipt size={20} className="text-gold shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Cần hoá đơn hoặc hỗ trợ hoàn tiền? Bấm nút <strong className="text-ink">Hỗ trợ</strong> ở góc phải.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
