"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { 
  Folder, 
  Video, 
  CreditCard, 
  User, 
  LogOut, 
  Loader2,
  ChevronRight,
  ExternalLink,
  Zap,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [mfaStep, setMfaStep] = useState<'idle' | 'enrolling' | 'verifying'>('idle');
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth?redirect=/dashboard');
        return;
      }
      setUser(user);
      
      // Fetch enrollments
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          status,
          courses (
            id,
            title,
            description
          )
        `)
        .eq('user_id', user.id);
        
      setEnrollments(enrollmentData || []);

      // Check MFA status
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      const activeFactor = mfaData?.all.find(f => f.status === 'verified');
      setMfaEnabled(!!activeFactor);

      // Update last active status for Retention CRM
      await supabase
        .from('users')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', user.id);

      setLoading(false);
    }
    checkUser();
  }, [router]);

  const enrollMfa = async () => {
    setMfaStep('enrolling');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) {
      alert(error.message);
      setMfaStep('idle');
      return;
    }
    setQrCode(data.totp.qr_code);
    setFactorId(data.id);
    setMfaStep('verifying');
  };

  const verifyMfa = async () => {
    if (!factorId) return;
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: verificationCode
    });
    if (error) {
      alert('Mã không chính xác, vui lòng thử lại.');
      return;
    }
    setMfaEnabled(true);
    setMfaStep('idle');
    setQrCode(null);
    alert('Bảo mật 2 lớp đã được kích hoạt thành công!');
  };

  const unenrollMfa = async () => {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.all.find(f => f.status === 'verified');
    if (verifiedFactor) {
      await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
      setMfaEnabled(false);
      alert('Đã tắt bảo mật 2 lớp.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const updatePassword = async () => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: 'admin2026@' });
    if (error) {
      alert('Lỗi: ' + error.message);
    } else {
      alert('Mật khẩu admin2026@ đã được kích hoạt thành công! Bạn có thể dùng mật khẩu này để đăng nhập từ giờ.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="animate-spin text-accent-secondary" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0c] flex">
      {/* Sidebar */}
      <aside className="w-80 border-r border-white/5 bg-[#050507] p-8 hidden md:flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-secondary rounded-2xl flex items-center justify-center font-black rotate-[-10deg]">M</div>
          <span className="font-black tracking-tighter text-xl">MISSION CTRL</span>
        </div>

        <nav className="space-y-2 flex-grow">
          <Link href="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            <LayoutDashboard size={20} />
            <span className="font-bold text-sm">Overview</span>
          </Link>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-text-muted hover:bg-white/5 hover:text-white transition-all text-left">
            <Video size={20} />
            <span className="font-bold text-sm">Learning Lab</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-text-muted hover:bg-white/5 hover:text-white transition-all text-left">
            <CreditCard size={20} />
            <span className="font-bold text-sm">Invoices</span>
          </button>
          {isAdmin(user?.email) && (
            <Link href="/admin" className="flex items-center gap-4 p-4 rounded-2xl bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/20 mt-4">
              <ShieldCheck size={20} />
              <span className="font-bold text-sm uppercase tracking-widest">CRM Portal</span>
            </Link>
          )}
        </nav>

        {isAdmin(user?.email) && (
          <div className="p-6 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 mb-6">
            <div className="flex items-center gap-2 text-xs font-black text-accent-primary mb-4 uppercase tracking-widest">
              <Zap size={14} />
              Admin Override
            </div>
            <p className="text-[10px] text-text-muted mb-6 leading-relaxed">Nếu bạn không đăng nhập được bằng mật khẩu, hãy nhấn nút dưới đây để ép hệ thống nhận mật khẩu mới.</p>
            <button 
               onClick={updatePassword}
               className="w-full py-3 rounded-xl bg-accent-primary text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
            >
               Đặt MK admin2026@
            </button>
          </div>
        )}

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-4 p-4 rounded-2xl text-text-muted hover:text-red-500 transition-all font-bold text-sm mt-auto"
        >
          <LogOut size={20} />
          Abort Session
        </button>
      </aside>

      {/* Main Content */}
      <section className="flex-grow p-6 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-black mb-2">Hello, {user?.email?.split('@')[0]}</h1>
            <p className="text-text-muted">Access your tactical knowledge assets.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-accent-secondary">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-2xl glass-effect">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-muted uppercase">Active Courses</span>
              <Zap size={18} className="text-accent-secondary" />
            </div>
            <div className="text-3xl font-black">{enrollments.length}</div>
          </div>
          {/* Add more stats here if needed */}
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <ShieldCheck className="text-accent-secondary" />
          Security Hub
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
           <div className="p-8 rounded-[2.5rem] glass-effect border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">MFA / 2FA Status</div>
                   <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${mfaEnabled ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {mfaEnabled ? 'Protected' : 'Vulnerable'}
                   </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Two-Factor Authentication</h3>
                <p className="text-text-muted text-sm leading-relaxed mb-8">Tăng cường bảo mật bằng mã xác thực 6 số mỗi khi bạn đăng nhập vào đài chỉ huy.</p>
              </div>

              {mfaStep === 'idle' ? (
                <button 
                  onClick={mfaEnabled ? unenrollMfa : enrollMfa}
                  className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${mfaEnabled ? 'bg-white/5 border border-white/10 text-white/40 hover:text-red-500 hover:border-red-500/30' : 'bg-accent-secondary text-black hover:scale-105'}`}
                >
                  {mfaEnabled ? 'Disable Protection' : 'Enable 2FA Protection'}
                </button>
              ) : (
                <div className="space-y-6 animate-fade-in">
                   {qrCode && (
                     <div className="bg-white p-4 rounded-3xl inline-block mx-auto">
                        <img src={qrCode} alt="QR Code" className="w-32 h-32" />
                     </div>
                   )}
                   <div className="space-y-4 text-center">
                      <p className="text-[10px] font-black text-accent-secondary uppercase tracking-widest">Verify Code</p>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="000000"
                        className="glass-input text-center text-xl tracking-[0.5em] font-black"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                      <button 
                        onClick={verifyMfa}
                        className="w-full py-4 rounded-2xl bg-accent-primary text-black font-black text-[10px] uppercase tracking-widest"
                      >
                        Finalize Protection
                      </button>
                   </div>
                </div>
              )}
           </div>

           <div className="p-8 rounded-[2.5rem] glass-effect border-white/5">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">Identity Key</div>
              <h3 className="text-xl font-bold mb-3">Password Management</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-8">Chúng tôi khuyên bạn nên đổi mật khẩu mặc định 21day12345 để đảm bảo an toàn tuyệt đối cho tài sản khóa học.</p>
              <button 
                onClick={() => alert('Chức năng đổi mật khẩu đang được tối ưu hóa. Vui lòng liên hệ Admin nếu cần hỗ trợ gấp.')}
                className="w-full py-4 rounded-2xl border border-white/10 text-white/60 font-black text-[10px] uppercase tracking-widest hover:bg-white/5"
              >
                Change Access Key
              </button>
           </div>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <Video className="text-accent-primary" />
          Tactical Operations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment: any) => (
            <Link 
              key={enrollment.courses.id} 
              href={`/courses/${enrollment.courses.id}`}
              className="group p-6 rounded-3xl border border-white/5 bg-white/[0.02] hover:border-accent-secondary/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                <ExternalLink size={24} className="text-accent-secondary" />
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-accent-secondary transition-colors">
                {enrollment.courses.title}
              </h3>
              <p className="text-text-muted text-sm line-clamp-2 mb-6">
                {enrollment.courses.description}
              </p>
              
              <div className="flex items-center justify-between text-xs font-bold text-accent-primary uppercase tracking-widest">
                <span>Status: {enrollment.status}</span>
                <ChevronRight size={16} />
              </div>
            </Link>
          ))}

          {enrollments.length === 0 && (
            <div className="col-span-1 md:col-span-2 p-12 rounded-3xl border border-dashed border-white/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-text-muted mb-4 border border-white/10">
                <Video size={32} />
              </div>
              <h3 className="text-lg font-bold mb-2">No Active Courses</h3>
              <p className="text-text-muted mb-6">Explore the catalog to deploy your first learning mission.</p>
              <Link href="/" className="btn-premium py-3 px-8 rounded-full text-xs">
                Browse Catalog
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
