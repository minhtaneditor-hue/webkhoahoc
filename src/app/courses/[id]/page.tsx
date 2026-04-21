'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { 
  Play, 
  ChevronLeft, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Loader2,
  CheckCircle2,
  Tag,
  Lock,
  ArrowRight,
  Video
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CourseDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', id).single();
      const { data: lessonsData } = await supabase.from('lessons').select('*').eq('course_id', id).order('order', { ascending: true });

      setCourse(courseData);
      setLessons(lessonsData || []);

      if (currentUser) {
        const { data: enrollmentData } = await supabase.from('enrollments').select('*').eq('user_id', currentUser.id).eq('course_id', id).single();
        setEnrolled(!!enrollmentData);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const handleApplyPromo = () => {
    if (!course) return;
    const code = promoCode.toUpperCase();
    let discount = 0;
    if (code === 'TANLAB') discount = 500000;
    else if (code === 'GIAM10') discount = course.price * 0.1;
    else if (code === 'CHALLENGE') discount = 1000000;

    setAppliedDiscount(discount);
    if (discount > 0) alert(`Mã hợp lệ! Giảm ${new Intl.NumberFormat('vi-VN').format(discount)}đ`);
    else alert('Mã không hợp lệ');
  };

  const handlePayment = async () => {
    if (!course) return;
    if (!user) {
      router.push(`/auth?redirect=/courses/${course.id}`);
      return;
    }
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
          courseTitle: course.title,
          promoCode: appliedDiscount > 0 ? promoCode : undefined,
          userId: user.id
        })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert('Lỗi: ' + data.error);
    } catch (err) {
      alert('Lỗi kết nối server');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse uppercase tracking-[0.3em]">Gathering Elite Data...</div>;
  if (!course) return <div className="min-h-screen bg-black flex items-center justify-center">Course not found.</div>;

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Cinematic Hero Section */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(227,38,54,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-8 border border-primary/20">
                Academy Exclusive // Elite Training
             </div>
             <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 italic italic-glow">
                {course.title}
             </h1>
             <p className="text-xl text-text-muted mb-12 max-w-xl leading-relaxed font-medium">
                {course.description || "Hành trình thực chiến chuyển hóa chiếc smartphone của bạn thành cỗ máy in tiền tự động."}
             </p>
             
             <div className="flex flex-col sm:flex-row gap-6">
                {enrolled ? (
                   <Link href={`/learn/${course.id}/${lessons[0]?.id || ''}`} className="btn-premium px-12 py-5 rounded-full font-black text-xs tracking-widest flex items-center justify-center gap-4">
                      TIẾP TỤC HỌC TẬP <ArrowRight size={18} />
                   </Link>
                ) : (
                   <button 
                     onClick={handlePayment}
                     className="btn-premium px-12 py-5 rounded-full font-black text-xs tracking-widest flex items-center justify-center gap-4 shadow-[0_0_50px_rgba(227,38,54,0.3)]"
                   >
                     GIA NHẬP ELITE ACADEMY &rarr;
                   </button>
                )}
             </div>
          </motion.div>

          <div className="relative group">
             <div className="aspect-video lux-border-gold overflow-hidden rounded-[3rem] shadow-2xl">
                <img 
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1200"} 
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-[3000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary border border-primary/40 group-hover:scale-110 transition-transform">
                      <Play size={40} fill="currentColor" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Main Content: Elite Layout */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-24">
          {/* Outcome Section */}
          <section>
             <h2 className="text-3xl font-black mb-12 italic underline-accent">BẠN SẼ <span className="text-primary">NHẬN ĐƯỢC GÌ?</span></h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  { t: "Tiêu chuẩn Cinematic", d: "Quy trình quay dựng đạt chuẩn điện ảnh chỉ với Mobile." },
                  { t: "Chiến lược Viral", d: "Giải mã thuật toán tiếp cận triệu khách hàng tự nhiên." },
                  { t: "Hệ thống Phễu", d: "Tự động hóa toàn bộ quy trình chăm sóc và chốt đơn." },
                  { t: "Thương hiệu Cá nhân", d: "Định vị vị thế mentor trong ngách thị trường của bạn." }
                ].map((item, i) => (
                  <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
                     <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={24} />
                     </div>
                     <h4 className="font-black text-lg mb-2 uppercase tracking-tight">{item.t}</h4>
                     <p className="text-sm text-text-muted leading-relaxed font-medium">{item.d}</p>
                  </div>
                ))}
             </div>
          </section>

          {/* Curriculum Section */}
          <section id="curriculum">
            <h2 className="text-3xl font-black mb-12 italic underline-accent">LỘ TRÌNH <span className="text-secondary">CHIẾN THUẬT</span></h2>
            <div className="space-y-4">
              {lessons.map((lesson, idx) => (
                <div 
                  key={lesson.id} 
                  className={`p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all ${lesson.is_free ? 'border-primary/20' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-4xl font-black opacity-10 group-hover:opacity-40 transition-opacity">0{idx + 1}</span>
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{lesson.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                         <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Module Stream</p>
                         {lesson.is_free && <span className="px-3 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Học thử</span>}
                      </div>
                    </div>
                  </div>
                  
                  {lesson.is_free ? (
                    <button 
                      onClick={() => setSelectedLesson(lesson)}
                      className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                    >
                      <Play size={18} fill="currentColor" />
                    </button>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                      <Lock size={18} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Premium Pricing Card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-32 p-10 rounded-[3rem] bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 shadow-3xl text-center">
             <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto mb-8 shadow-[0_0_30px_rgba(227,38,54,0.2)]">
                <ShieldCheck size={32} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">Lifetime Access</p>
             <h3 className="text-5xl font-black tracking-tighter mb-8 italic">ELITE <span className="text-white/40">PLAN</span></h3>
             
             <div className="text-4xl font-black tracking-tighter mb-10 pb-8 border-b border-white/5">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price - appliedDiscount)}
             </div>

             <div className="space-y-4 mb-8">
                <div className="flex gap-2">
                   <div className="relative flex-grow">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
                      <input 
                        type="text" 
                        placeholder="PROMO" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:border-primary text-xs outline-none uppercase font-black" 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                   </div>
                   <button onClick={handleApplyPromo} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Apply</button>
                </div>
             </div>

             <button 
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl uppercase flex items-center justify-center gap-3"
             >
                {paymentLoading ? <Loader2 className="animate-spin" size={18} /> : <>MISSION START <ArrowRight size={16} /></>}
             </button>
             
             <p className="mt-8 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">Protected by Secure Protocol</p>
          </div>
        </aside>
      </div>

      {/* Video Player Modal (Free Preview) */}
      {selectedLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setSelectedLesson(null)} />
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-5xl aspect-video bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl">
            <button onClick={() => setSelectedLesson(null)} className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-primary transition-all">
              <X size={24} />
            </button>
            <iframe 
              src={selectedLesson.video_url.includes('youtube') ? selectedLesson.video_url.replace('watch?v=', 'embed/') : selectedLesson.video_url}
              className="w-full h-full"
              allowFullScreen
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
