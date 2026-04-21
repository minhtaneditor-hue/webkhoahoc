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
  LayoutDashboard,
  Target,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { isAdmin } from '@/lib/admin';
import Navbar from '@/components/Navbar';

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

      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      const activeFactor = mfaData?.all.find(f => f.status === 'verified');
      setMfaEnabled(!!activeFactor);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-accent-secondary" size={48} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-slate-100 bg-white p-8 flex flex-col gap-12 relative z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent-secondary rounded-2xl flex items-center justify-center font-black text-white shadow-lg shaodw-accent-secondary/20 italic">T</div>
          <span className="font-black tracking-tighter text-2xl text-slate-900 italic">TANLAB</span>
        </div>

        <nav className="space-y-3 flex-grow">
          <Link href="/dashboard" className="flex items-center gap-4 p-5 rounded-2xl bg-accent-primary/5 text-accent-primary border border-accent-primary/10 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm">
            <LayoutDashboard size={18} />
            HỆ THỐNG CHÍNH
          </Link>
          <button className="w-full flex items-center gap-4 p-5 rounded-2xl text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all text-left font-black uppercase text-[10px] tracking-widest">
            <Video size={18} />
            PHÒNG HỌC TẬP
          </button>
          <button className="w-full flex items-center gap-4 p-5 rounded-2xl text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all text-left font-black uppercase text-[10px] tracking-widest">
            <Award size={18} />
            CHỨNG NHẬN
          </button>
          <button className="w-full flex items-center gap-4 p-5 rounded-2xl text-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all text-left font-black uppercase text-[10px] tracking-widest">
            <CreditCard size={18} />
            THANH TOÁN
          </button>
          
          {isAdmin(user?.email) && (
            <Link href="/admin" className="flex items-center gap-4 p-5 rounded-2xl bg-accent-secondary/5 text-accent-secondary border border-accent-secondary/10 mt-6 transition-all font-black uppercase text-[10px] tracking-widest shadow-sm">
              <ShieldCheck size={18} />
              QUẢN TRỊ VIÊN
            </Link>
          )}
        </nav>

        <button 
          onClick={handleSignOut}
          className="flex items-center gap-4 p-5 rounded-2xl text-slate-300 hover:text-accent-secondary transition-all font-black uppercase text-[10px] tracking-widest mt-auto border border-slate-50"
        >
          <LogOut size={18} />
          THOÁT HỆ THỐNG
        </button>
      </aside>

      {/* Main Content */}
      <section className="flex-grow p-8 md:p-16 overflow-y-auto relative z-10">
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent-secondary/5 blur-[120px] rounded-full -z-10" />
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 italic tracking-tighter uppercase text-slate-900 leading-none">
              CHÀO <span className="text-slate-300">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-slate-400 font-bold italic uppercase tracking-tight text-sm">Chào mừng bạn quay lại trung tâm điều hành tài sản.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-xl flex items-center justify-center text-accent-secondary">
              <User size={24} />
            </div>
          </div>
        </header>

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">KHÓA HỌC SỞ HỮU</span>
              <Target size={20} className="text-accent-secondary" />
            </div>
            <div className="text-5xl font-black text-slate-900 italic tracking-tighter">{enrollments.length}</div>
          </div>
          <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-2xl flex flex-col justify-center md:col-span-3">
             <div className="flex items-center gap-3 text-accent-secondary mb-4">
                <Zap size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Trạng thái hệ thống</span>
             </div>
             <p className="text-slate-500 font-bold italic tracking-tight uppercase">Mọi hệ thống đang hoạt động tối ưu. Hãy tiếp tục lộ trình kiến tạo tài sản của bạn.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Security Hub */}
          <div className="lg:col-span-1 space-y-8">
             <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
               <ShieldCheck className="text-accent-secondary" size={20} />
               TRUNG TÂM BẢO MẬT
             </h2>
             
             <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">TRẠNG THÁI 2FA</div>
                   <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${mfaEnabled ? 'bg-green-500 text-white shadow-lg' : 'bg-accent-secondary text-white shadow-lg'}`}>
                      {mfaEnabled ? 'ĐÃ KÍCH HOẠT' : 'CHƯA BẢO VỆ'}
                   </div>
                </div>
                <h3 className="text-lg font-black mb-4 uppercase italic">BẢO MẬT 2 LỚP</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 italic">Yêu cầu mã xác thực từ điện thoại để ngăn chặn truy cập trái phép vào tài khoản của bạn.</p>
                
                {mfaStep === 'idle' ? (
                  <button 
                    onClick={mfaEnabled ? unenrollMfa : enrollMfa}
                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${mfaEnabled ? 'bg-slate-50 text-slate-300 hover:text-red-500' : 'bg-slate-900 text-white shadow-xl hover:bg-accent-secondary'}`}
                  >
                    {mfaEnabled ? 'TẮT BẢO VỆ' : 'KÍCH HOẠT BẢO MẬT'}
                  </button>
                ) : (
                  <div className="space-y-6 animate-fade-in text-center">
                     {qrCode && (
                       <div className="bg-slate-50 p-6 rounded-[2rem] inline-block shadow-inner">
                          <img src={qrCode} alt="QR Code" className="w-32 h-32 opacity-80" />
                       </div>
                     )}
                     <div className="space-y-4">
                        <input 
                          type="text" 
                          maxLength={6}
                          placeholder="MÃ XÁC THỰC"
                          className="glass-input text-center text-xl tracking-[0.5em] font-black"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <button 
                          onClick={verifyMfa}
                          className="w-full py-5 rounded-2xl bg-accent-secondary text-white font-black text-[10px] uppercase tracking-widest shadow-xl"
                        >
                          XÁC NHẬN KÍCH HOẠT
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </div>

          {/* Tactical Operations (Course List) */}
          <div className="lg:col-span-2 space-y-8">
             <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
               <Video className="text-accent-secondary" size={20} />
               CÁC KHÓA HỌC ĐANG HỌC
             </h2>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {enrollments.map((enrollment: any) => (
                 <Link 
                   key={enrollment.courses.id} 
                   href={`/courses/${enrollment.courses.id}`}
                   className="group p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl hover:border-accent-secondary/30 transition-all relative overflow-hidden"
                 >
                   <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                     <ExternalLink size={20} className="text-accent-secondary" />
                   </div>
                   
                   <h3 className="text-xl font-black mb-3 group-hover:text-accent-secondary transition-colors uppercase italic text-slate-900 leading-tight">
                     {enrollment.courses.title}
                   </h3>
                   <p className="text-slate-400 text-xs font-medium line-clamp-2 mb-10 italic leading-relaxed">
                     {enrollment.courses.description}
                   </p>
                   
                   <div className="flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest pt-6 border-t border-slate-50">
                     <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-secondary animate-pulse" />
                        TRẠNG THÁI: {enrollment.status === 'active' ? 'ĐANG HỌC' : enrollment.status}
                     </span>
                     <ChevronRight size={16} />
                   </div>
                 </Link>
               ))}

               {enrollments.length === 0 && (
                 <div className="col-span-full p-20 rounded-[4rem] border-2 border-dashed border-slate-100 bg-white/50 flex flex-col items-center text-center shadow-inner">
                   <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center text-slate-200 mb-6 border border-slate-50">
                     <Video size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-3">CHƯA CÓ DỮ LIỆU</h3>
                   <p className="text-slate-400 font-medium italic mb-10 max-w-sm">Hãy khám phá danh mục để bắt đầu lộ trình kiến tạo tài sản của bạn.</p>
                   <Link href="/courses" className="btn-premium px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                     XEM DANH MỤC KHÓA HỌC
                   </Link>
                 </div>
               )}
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}
