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
  Zap,
  Fingerprint
} from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
        // Tanlab Password Policy Enforcement
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

  return (
    <div className="w-full max-w-md relative z-10 pt-20">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-10 group px-2 font-black uppercase text-[10px] tracking-widest">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        QUAY LẠI CỔNG CHÍNH
      </Link>

      <div className="auth-card">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/5 text-accent-secondary text-[10px] font-black mb-6 uppercase tracking-widest border border-accent-secondary/10">
            <Fingerprint size={14} />
            TRÌNH XÁC THỰC TANLAB
          </div>
          <h1 className="text-4xl font-black mb-3 italic tracking-tighter uppercase text-slate-900 leading-none">
            {isLogin ? 'ĐĂNG NHẬP' : 'KHỞI TẠO'}
          </h1>
          <p className="text-slate-400 text-sm font-medium italic">
            {isLogin ? 'Truy cập trung tâm điều hành của bạn.' : 'Thiết lập mật khẩu truy cập hệ thống.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">ĐỊA CHỈ EMAIL</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="email" 
                placeholder="partner@tanlab.com"
                className="glass-input pl-14"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">MẬT MÃ TRUY CẬP</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="glass-input pl-14"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-5 rounded-2xl bg-accent-secondary/5 border border-accent-secondary/10 text-accent-secondary text-[11px] text-center font-black uppercase tracking-widest leading-relaxed">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-premium py-6 rounded-3xl flex items-center justify-center gap-4 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              <span className="tracking-[0.2em]">{isLogin ? 'TIẾN VÀO HỆ THỐNG' : 'HOÀN TẤT THIẾT LẬP'}</span>
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-center text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-accent-secondary py-4 transition-colors"
            >
              {isLogin ? "BẠN LÀ THÀNH VIÊN MỚI? ĐĂNG KÝ NGAY" : "ĐÃ CÓ TÀI KHOẢN? QUAY LẠI ĐĂNG NHẬP"}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-200 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-accent-secondary" />
            ENCRYPTED
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-200 justify-end uppercase tracking-widest">
            <Zap size={14} className="text-accent-primary" />
            V21.0 CORE
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-white relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-primary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-secondary/5 blur-[120px] rounded-full" />
      
      <Suspense fallback={<Loader2 className="animate-spin text-accent-secondary" />}>
        <AuthForm />
      </Suspense>
    </main>
  );
}
