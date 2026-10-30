"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { formatVND } from '@/lib/supabase-public';
import { Loader2, ArrowRight, BookOpen, ShieldCheck, ShoppingBag, Receipt, LogOut } from 'lucide-react';

type Notice = { type: 'success' | 'error'; text: string } | null;

const STATUS_LABEL: Record<string, string> = { success: 'Thành công', pending: 'Đang chờ', failed: 'Thất bại' };

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState<'idle' | 'enrolling' | 'verifying'>('idle');
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }
      setUser(user);

      const [{ data: enrollmentData }, { data: paymentData }, { data: mfaData }] = await Promise.all([
        supabase.from('enrollments').select('course_id, status, enrolled_at, courses ( id, title, description )').eq('user_id', user.id),
        supabase.from('payments').select('id, order_id, amount, status, created_at, courses ( title )').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.auth.mfa.listFactors(),
      ]);

      setEnrollments(enrollmentData || []);
      setPayments(paymentData || []);
      setMfaEnabled(!!mfaData?.all.find((f) => f.status === 'verified'));

      await supabase.from('users').update({ last_active_at: new Date().toISOString() }).eq('id', user.id);
      setLoading(false);
    }
    load();
  }, [router]);

  const enrollMfa = async () => {
    setNotice(null);
    setMfaStep('enrolling');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) {
      setNotice({ type: 'error', text: error.message });
      setMfaStep('idle');
      return;
    }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
    setMfaStep('verifying');
  };

  const verifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: verificationCode });
    if (error) {
      setNotice({ type: 'error', text: 'Mã không chính xác, vui lòng thử lại.' });
      return;
    }
    setMfaEnabled(true);
    setMfaStep('idle');
    setQrCode(null);
    setVerificationCode('');
    setNotice({ type: 'success', text: 'Đã bật bảo mật 2 lớp.' });
  };

  const unenrollMfa = async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.all.find((f) => f.status === 'verified');
    if (verifiedFactor) {
      await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
      setMfaEnabled(false);
      setNotice({ type: 'success', text: 'Đã tắt bảo mật 2 lớp.' });
    }
  };

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

      {notice && (
        <p role={notice.type === 'error' ? 'alert' : 'status'} className={`mt-6 p-4 rounded-md text-sm ${notice.type === 'error' ? 'bg-red-50 text-danger' : 'bg-gold-soft text-ink'}`}>{notice.text}</p>
      )}

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

          <section className="card p-6" aria-labelledby="security-title">
            <div className="flex items-center gap-3">
              <ShieldCheck size={22} className={mfaEnabled ? 'text-success' : 'text-gold'} aria-hidden="true" />
              <h2 id="security-title" className="text-2xl">Bảo mật 2 lớp</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {mfaEnabled ? 'Đang bật. Tài khoản của bạn được bảo vệ bằng ứng dụng xác thực.' : 'Bảo vệ tài khoản bằng Google Authenticator hoặc ứng dụng tương tự.'}
            </p>

            {mfaStep === 'verifying' && qrCode ? (
              <form onSubmit={verifyMfa} className="mt-5 space-y-4">
                <p className="text-sm">Quét mã QR bằng ứng dụng xác thực, sau đó nhập mã 6 số.</p>
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URI from Supabase */}
                <img src={qrCode} alt="Mã QR bảo mật 2 lớp" className="w-44 h-44 mx-auto rounded-md border border-line bg-white p-2" />
                <label htmlFor="otp" className="field-label">Mã xác thực</label>
                <input id="otp" className="input text-center tracking-[0.4em] font-semibold" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                       value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} />
                <button type="submit" disabled={verificationCode.length !== 6} className="btn btn-gold w-full">Xác nhận</button>
              </form>
            ) : mfaEnabled ? (
              <button onClick={unenrollMfa} className="btn btn-outline w-full mt-5">Tắt bảo mật 2 lớp</button>
            ) : (
              <button onClick={enrollMfa} disabled={mfaStep === 'enrolling'} className="btn btn-dark w-full mt-5">
                {mfaStep === 'enrolling' && <Loader2 size={16} className="animate-spin" aria-hidden="true" />} Bật bảo mật 2 lớp
              </button>
            )}
          </section>

          <div className="card p-6 flex items-center gap-4">
            <Receipt size={20} className="text-gold shrink-0" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Cần hoá đơn hoặc hỗ trợ hoàn tiền? Bấm nút <strong className="text-ink">Hỗ trợ</strong> ở góc phải.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
