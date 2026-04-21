"use client";

import { Suspense, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Loader2, 
  ArrowRight, 
  ChevronLeft,
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';
import Link from 'next/link';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams?.get('redirect') || '/dashboard';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!isLogin) {
        // Elite Password Policy Enforcement
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("Mật khẩu phải tối thiểu 8 ký tự, bao gồm số, chữ thường và ít nhất 1 chữ hoa.");
        }

        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          }
        });
        if (error) throw error;
        alert('Đăng ký thành công! Bạn có thể đăng nhập ngay với mật khẩu vừa tạo.');
        setIsLogin(true);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError("Vui lòng nhập Email để nhận Magic Link");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        }
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 group">
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Terminal
      </Link>

      <div className="auth-card">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold mb-4">
            <Terminal size={14} />
            MISSION CONTROL AUTH
          </div>
          <h1 className="text-3xl font-black mb-2">
            {isLogin ? (success ? 'Xác thực Email' : 'Đăng nhập') : 'Khởi tạo Admin'}
          </h1>
          <p className="text-text-muted text-sm">
            {isLogin ? 'Truy cập trung tâm điều hành của bạn.' : 'Thiết lập mật khẩu quản trị tối cao.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Email Command</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="email" 
                placeholder="name@example.com"
                className="glass-input pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="glass-input pl-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium py-5 rounded-full flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              {isLogin ? 'Đăng nhập hệ thống' : 'Khởi tạo tài khoản Admin'}
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-center text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent-secondary py-2 transition-colors"
            >
              {isLogin ? "Bạn muốn thiết lập mật khẩu mới? Chọn Đăng ký" : "Quay lại Đăng nhập"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-text-muted leading-relaxed">
          Chúng tôi sẽ gửi một đường link đăng nhập an toàn vào Email của bạn. <br />
          Không cần mật khẩu. Không cần ghi nhớ.
        </p>

        <div className="mt-10 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-[10px] text-text-muted">
            <ShieldCheck size={14} className="text-green-500" />
            End-to-end Encrypted
          </div>
          <div className="flex items-center gap-2 text-[10px] text-text-muted justify-end">
            <Zap size={14} className="text-accent-secondary" />
            Instant Activation
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0c] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-secondary/10 blur-[120px] rounded-full" />
      
      <Suspense fallback={<Loader2 className="animate-spin text-accent-secondary" />}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
