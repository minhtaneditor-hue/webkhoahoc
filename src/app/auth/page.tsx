"use client";

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { PASSWORD_RULE } from '@/lib/password';
import { supabase } from '@/utils/supabase';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

type Mode = 'login' | 'signup' | 'reset';


// Translate the most common Supabase auth errors into Vietnamese
function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email hoặc mật khẩu không đúng.';
  if (m.includes('email not confirmed')) return 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.';
  if (m.includes('already registered')) return 'Email này đã có tài khoản. Hãy đăng nhập.';
  if (m.includes('rate limit')) return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.';
  return message;
}

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRedirect = searchParams?.get('redirect') || '/dashboard';
  // Only allow same-site paths so ?redirect=https://evil.com can't be abused
  const redirectTo = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/dashboard';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // ?error=link: an email link was expired, already used, or opened in a different browser
  const [error, setError] = useState<string | null>(
    searchParams?.get('error') === 'link' ? 'Link trong email đã hết hạn hoặc đã được dùng. Vui lòng gửi lại link mới.' : null
  );
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (m: Mode) => { setMode(m); setError(null); setNotice(null); };

  const passwordInvalid = mode === 'signup' && password.length > 0 && !PASSWORD_RULE.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
        });
        if (error) throw error;
        setNotice('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư (cả mục Spam).');
        return;
      }

      if (mode === 'signup') {
        if (!PASSWORD_RULE.test(password)) {
          throw new Error('Mật khẩu cần tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.');
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
        });
        if (error) throw error;
        if (!data.session) {
          setNotice('Tạo tài khoản thành công! Hãy mở email xác nhận để kích hoạt, sau đó đăng nhập.');
          setMode('login');
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(friendlyError(err.message || 'Đã có lỗi xảy ra.'));
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, { title: string; sub: string; cta: string }> = {
    login: { title: 'Chào mừng trở lại', sub: 'Đăng nhập để tiếp tục khóa học của bạn.', cta: 'Đăng nhập' },
    signup: { title: 'Tạo tài khoản', sub: 'Miễn phí, học thử ngay.', cta: 'Tạo tài khoản' },
    reset: { title: 'Quên mật khẩu', sub: 'Nhập email, chúng tôi sẽ gửi link đặt lại mật khẩu.', cta: 'Gửi link đặt lại' },
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="text-4xl md:text-5xl">{titles[mode].title}</h1>
      <p className="mt-2 text-muted-foreground">{titles[mode].sub}</p>

      {notice && (
        <p role="status" className="mt-6 flex gap-3 p-4 rounded-md bg-gold-soft text-ink text-sm">
          <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" aria-hidden="true" /> {notice}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="field-label">Email</label>
          <input id="email" type="email" required autoComplete="email" inputMode="email" className="input"
                 value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ban@email.com" />
        </div>

        {mode !== 'reset' && (
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="field-label">Mật khẩu</label>
              {mode === 'login' && (
                <button type="button" onClick={() => switchMode('reset')} className="text-sm text-gold font-semibold hover:underline underline-offset-4 mb-1.5">Quên mật khẩu?</button>
              )}
            </div>
            <div className="relative">
              <input id="password" type={showPassword ? 'text' : 'password'} required
                     autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                     className="input pr-12" value={password} onChange={(e) => setPassword(e.target.value)}
                     aria-invalid={passwordInvalid} aria-describedby={mode === 'signup' ? 'password-help' : undefined} />
              <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-muted-foreground hover:text-ink">
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p id="password-help" className={`mt-2 text-sm ${passwordInvalid ? 'text-danger' : 'text-muted-foreground'}`}>
                Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.
              </p>
            )}
          </div>
        )}

        {error && <p role="alert" className="p-4 rounded-md bg-red-50 text-danger text-sm">{error}</p>}

        <button type="submit" disabled={loading || !email} className="btn btn-gold w-full">
          {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {titles[mode].cta}
        </button>
      </form>

      <p className="mt-8 text-center text-muted-foreground">
        {mode === 'login' ? (
          <>Chưa có tài khoản? <button onClick={() => switchMode('signup')} className="font-semibold text-gold hover:underline underline-offset-4 min-h-[44px]">Đăng ký miễn phí</button></>
        ) : (
          <>Đã có tài khoản? <button onClick={() => switchMode('login')} className="font-semibold text-gold hover:underline underline-offset-4 min-h-[44px]">Đăng nhập</button></>
        )}
      </p>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Bằng việc tiếp tục, bạn đồng ý với <Link href="/terms" className="underline">Điều khoản</Link> và <Link href="/privacy" className="underline">Chính sách bảo mật</Link>.
      </p>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="grid lg:grid-cols-2 min-h-[calc(100vh-112px)]">
      <div className="flex items-center justify-center px-5 py-12 md:px-12">
        <Suspense fallback={<Loader2 className="animate-spin text-gold" aria-label="Đang tải" />}>
          <AuthForm />
        </Suspense>
      </div>
      <div className="hidden lg:block relative surface-dark">
        <Image src="/asset/avatar/hero_expert.jpg" alt="" fill sizes="50vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" aria-hidden="true" />
        <blockquote className="absolute bottom-12 left-12 right-12">
          <p className="font-display text-4xl leading-tight text-white">“Mỗi video bạn làm ra đều có thể trở thành một tài sản.”</p>
          <footer className="mt-4 text-gold-light font-semibold">— Minh Tấn, TẤN VA</footer>
        </blockquote>
      </div>
    </main>
  );
}
