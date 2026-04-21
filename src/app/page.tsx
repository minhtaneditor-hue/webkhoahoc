"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import BentoCard from '@/components/BentoCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SaaSDRMHero from '@/components/SaaSDRMHero';

import { 
  ArrowRight,
  Users,
  Terminal,
  Play,
  Award,
  Video,
  ChevronRight,
  CheckCircle2,
  Layers,
  HelpCircle,
  ShieldCheck,
  Zap,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingContent, setLoadingContent] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [
          { data: { user: currentUser } },
          { data: coursesData },
          { data: settingsData }
        ] = await Promise.all([
          supabase.auth.getUser(),
          supabase.from('courses').select('*').order('created_at', { ascending: false }),
          supabase.from('site_settings').select('*')
        ]);

        if (currentUser) setUser(currentUser);
        if (coursesData) setCourses(coursesData);

        const settingsMap: Record<string, string> = {};
        settingsData?.forEach(s => { settingsMap[s.key] = s.value; });
        setSettings(settingsMap);
      } catch (error) {
        console.error("Loading error:", error);
      } finally {
        setLoadingContent(false);
      }
    }
    
    // Safety timeout to prevent infinite loading if Supabase hangs
    const timer = setTimeout(() => {
      setLoadingContent(false);
    }, 5000);

    init();
    return () => clearTimeout(timer);
  }, []);

  if (loadingContent) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 via-white to-accent-secondary/5 -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent-secondary/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-primary/5 blur-[120px] rounded-full" />
      
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-accent-secondary flex items-center justify-center text-white shadow-2xl animate-bounce italic font-black text-2xl">T</div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-accent-secondary animate-pulse">TANLAB SYSTEMS</div>
          <div className="text-slate-400 font-bold italic uppercase tracking-widest text-xs">Deploying Knowledge Assets...</div>
        </div>
      </div>
    </div>
  );

  const featuredCourse = courses.find(c => c.id === 'd290f1ee-6c54-4b01-90e6-d701748f0851') || courses[0];

  const handlePayment = async (courseId: string, amount: number, title: string) => {
    if (!user) {
      window.location.href = `/auth?redirect=/courses/${courseId}`;
      return;
    }
    setLoadingContent(true);
    try {
      const response = await fetch('/api/payment/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          amount,
          courseTitle: title,
          userId: user.id
        })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert('Lỗi kết nối server');
    } finally {
      setLoadingContent(false);
    }
  };

  const partners = [
    { name: "Phú Long", logo: "/asset/doi tac/logo-phu-long.jpg.webp" },
    { name: "Viglacera", logo: "/asset/doi tac/viglacera-edited-1748248760146.webp" },
    { name: "Suntory Pepsico", logo: "/asset/doi tac/logo.png" },
    { name: "HTV", logo: "/asset/doi tac/unnamed.png" },
    { name: "Vietjet", logo: "/asset/doi tac/channels4_profile.jpg" }
  ];

  const projects = [
    { title: "2 Ngày 1 Đêm", category: "TV Show Integration", image: "/asset/du an tieu bieu/544ea4rx_1920x1080-2n1d3d4949a0757e8a42510797a7441b3256_1267_712.webp" },
    { title: "Anh Trai Say Hi Movie", category: "Cinematic Production", image: "/asset/du an tieu bieu/AnhTraiSayHiOpening.jpg" },
    { title: "Anh Trai Say Hi - Las Vegas", category: "Global Event Coverage", image: "/asset/du an tieu bieu/ATSH_logo_HTV2.webp" },
    { title: "Nghệ Thuật Truyền Hình", category: "Digital Content", image: "/asset/du an tieu bieu/NHTH.jpg" },
    { title: "Mái Ấm Tình Thương", category: "Documentary", image: "/asset/du an tieu bieu/MATN_logo_HTV7.webp" },
    { title: "Ký Ức Vui Vẻ", category: "TV Production", image: "/asset/du an tieu bieu/Ky_uc_vui_ve_VTV.png" }
  ];

  const bonuses = [
    { title: "Kèm cặp 1:1 trọn đời", desc: "Hỗ trợ trực tiếp qua Zalo/Group để bạn không đơn độc trên hành trình.", icon: <Users size={20} /> },
    { title: "Kho kịch bản Triệu View", desc: "100+ mẫu nội dung đã được chứng minh hiệu quả thực tế.", icon: <Terminal size={20} /> },
    { title: "Âm thanh Bản quyền", desc: "Bộ sưu tập nhạc nền xu hướng giúp video bứt phá thuật toán.", icon: <Play size={20} /> },
    { title: "Template Thiết kế độc quyền", desc: "Mẫu ảnh bìa, hiệu ứng chữ chuyên nghiệp từ Minh Tấn.", icon: <Award size={20} /> }
  ];

  const faqs = [
    { q: "Điện thoại cũ có làm được không?", a: "Hoàn toàn được! Tôi sẽ dạy bạn cách làm chủ ánh sáng và góc quay để che đi khuyết điểm của thiết bị." },
    { q: "Tôi ngại lên hình thì phải làm sao?", a: "Có chiến lược Voice-over và bối cảnh sáng tạo giúp bạn vẫn ra video triệu view mà không cần lộ mặt." },
    { q: "Học xong chưa ra tiền thì sao?", a: "Tôi cam kết hỗ trợ 1-1 cho đến khi bạn xây dựng thành công phễu bán hàng tự động đầu tiên." }
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-accent-secondary/10">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-[95vh] flex items-center bg-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(227,38,54,0.03),transparent)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 bg-slate-50/50 text-[11px] font-black text-slate-400 mb-10 tracking-[0.3em] uppercase">
              <Zap size={14} className="text-accent-secondary" /> Tri thức là sức mạnh
            </div>
            
            <h1 className="leading-[0.9] text-6xl md:text-8xl font-black mb-8 italic italic-glow">
              VIDEO LÀ<br />
              <span className="text-slate-900">TÀI SẢN</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-12 max-w-lg leading-relaxed font-bold uppercase tracking-tight">
              BIẾN ĐIỆN THOẠI THÀNH TÀI SẢN<br />
              <span className="text-sm font-medium normal-case tracking-normal text-slate-400">Kiến tạo cỗ máy thu nhập thụ động chỉ với smartphone và chiến lược nội dung viral.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/courses" className="btn-premium flex items-center justify-center gap-4 group">
                VÀO HỌC NGAY <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/courses" className="px-10 py-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                KHÓA HỌC
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="w-full aspect-[4/5] md:aspect-square rounded-[4rem] overflow-hidden relative group shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200" 
                  alt="Video Advisor"
                  className="w-full h-full object-cover grayscale brightness-110 group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12">
                   <p className="text-[11px] font-black tracking-[0.5em] text-accent-secondary uppercase mb-3">Video Advisor</p>
                   <p className="text-5xl font-black tracking-tighter text-slate-900 italic">MINH TẤN</p>
                </div>
            </div>
            {/* Stat Badge */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-12 -right-8 p-10 bg-white shadow-2xl rounded-[3rem] hidden lg:block border border-slate-100"
            >
               <p className="text-5xl font-black text-accent-secondary mb-1">99%</p>
               <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Học viên hài lòng</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 border-y border-slate-100 bg-white">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-4 font-mono">Trusted by Global Giants</p>
               <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">
                  ĐỐI TÁC CHIẾN LƯỢC & <span className="text-accent-secondary">THƯƠNG HIỆU HỢP TÁC</span>
               </h3>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               {partners.map((partner) => (
                 <div key={partner.name} className="h-12 md:h-16 flex items-center justify-center">
                    <img src={partner.logo} alt={partner.name} className="h-full w-auto object-contain" />
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Featured Projects Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/5 text-accent-secondary text-[11px] font-black uppercase tracking-widest mb-6 border border-accent-secondary/10">
                <Video size={14} /> Authority Showcase
             </div>
             <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-6 italic-glow leading-none">
                Dự án <span className="text-slate-300">Tiêu biểu</span>
             </h2>
             <p className="text-slate-500 font-bold text-lg italic leading-relaxed">
                Chứng thực năng lực qua các tác phẩm truyền hình và điện ảnh quy mô lớn.
             </p>
          </div>
          <Link href="/work" className="px-8 py-3 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3">
             XEM TẤT CẢ <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {projects.map((project, i) => (
             <Link key={i} href="/work" className="group block relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-100 bg-white hover:border-accent-secondary/20 shadow-xl transition-all duration-700">
                <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-110" />
                <div className="absolute inset-0 bg-white/40 group-hover:bg-transparent transition-all z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
                   <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-accent-secondary shadow-2xl">
                      <Play size={24} fill="currentColor" />
                   </div>
                </div>
                <div className="absolute bottom-10 left-10 z-20 text-white group-hover:text-slate-900 p-8 rounded-3xl bg-black/20 backdrop-blur-sm group-hover:bg-white/80 group-hover:shadow-2xl transition-all">
                   <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">{project.category}</p>
                   <h4 className="text-xl font-black italic uppercase">{project.title}</h4>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* Courses Bento Grid */}
      <section className="bg-white py-32 px-6 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase italic-glow">Lộ trình <span className="text-slate-300">Tài sản</span></h2>
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">Hệ thống đào tạo thực chiến tại Tanlab</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <BentoCard 
              title={featuredCourse?.title || "VIDEO LÀ TÀI SẢN"}
              description={featuredCourse?.description || "Làm chủ quy trình xây dựng cỗ máy thu nhập tự động từ smartphone."}
              size="large"
              icon={<Video size={32} className="text-accent-secondary" />}
              className="md:col-span-2 md:row-span-2 shadow-2xl"
            >
              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={16} className="text-accent-secondary" />
                  Dựng phim chuyên nghiệp trên Mobile
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={16} className="text-accent-secondary" />
                  Tư duy kịch bản thương mại hóa
                </div>
                <button 
                  onClick={() => { if (featuredCourse) handlePayment(featuredCourse.id, featuredCourse.price, featuredCourse.title); }}
                  className="mt-6 p-5 rounded-2xl bg-accent-secondary text-white font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-accent-secondary/30 transition-all"
                >
                   VÀO HỌC NGAY
                </button>
              </div>
            </BentoCard>

            <BentoCard title="Nội Dung Viral" description="Tiếp cận triệu khách hàng mục tiêu." icon={<Star size={24} />} className="bg-slate-50" />
            <BentoCard title="Hệ Thống Phễu" description="Tự động hóa dòng tiền 24/7." icon={<Layers size={24} />} className="bg-slate-50" />
            <BentoCard title="Thương Hiệu" description="Định vị Personal Brand sắc nét." icon={<Users size={24} />} className="md:col-span-2 bg-slate-50" />
          </div>
        </div>
      </section>

      {/* Bonus Stack */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">QUÀ TẶNG <span className="text-accent-secondary">ĐẶC QUYỀN</span></h2>
             <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mt-4 underline-accent">Exclusive Bonuses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bonuses.map((bonus, i) => (
              <div key={i} className="flex gap-8 p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl hover:translate-y-[-5px] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-accent-secondary/5 flex items-center justify-center text-accent-secondary group-hover:scale-110 transition-transform shrink-0">
                  {bonus.icon}
                </div>
                <div>
                  <h4 className="font-black text-xl mb-3 text-slate-900 group-hover:text-accent-secondary transition-colors uppercase italic">{bonus.title}</h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic">{bonus.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center mb-16 flex flex-col items-center gap-4 italic italic-glow">
             <HelpCircle className="text-accent-secondary" size={32} />
             GIẢI ĐÁP THẮC MẮC
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden transition-all shadow-sm"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                  <span className="font-black text-slate-900 text-sm uppercase italic">{faq.q}</span>
                  <ChevronRight size={20} className={`text-slate-300 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
                </div>
                {activeFaq === i && (
                  <div className="px-8 pb-8 text-slate-500 font-medium text-sm border-t border-slate-100 pt-8 animate-fade-in leading-relaxed italic">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* SaaS DRM Minimalist Bar */}
      <section id="saas-preview" className="relative bg-white py-12 border-y border-slate-100 overflow-hidden">
         <div className="flex items-center gap-10 whitespace-nowrap animate-scroll-minimal">
            {[1,2,3,4,5].map(i => (
               <div key={i} className="flex items-center gap-6 text-[11px] font-black uppercase tracking-[0.5em] text-slate-200">
                  <ShieldCheck size={16} className="text-accent-secondary" /> 
                  BẢO MẬT TÀI SẢN TOÀN DIỆN VỚI TANLAB DRM 
                  <span className="text-slate-100">//</span>
               </div>
            ))}
         </div>
         {/* Hidden/Minimized actual DRM content to preserve SEO and technical structure but keep UI light */}
         <div className="sr-only">
           <SaaSDRMHero />
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center">
        <div className="max-w-4xl mx-auto p-16 rounded-[4rem] bg-white border border-slate-100 shadow-[0_50px_100px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-50" />
          <h2 className="text-5xl md:text-7xl font-black mb-8 italic italic-glow uppercase"> READY TO <span className="text-slate-300">DEPLOY?</span></h2>
          <p className="text-lg text-slate-500 mb-12 leading-relaxed font-bold uppercase italic tracking-tight">Chiếc điện thoại của bạn đang chờ để được bứt phá tiềm năng.</p>
          <button 
                onClick={() => { if (featuredCourse) handlePayment(featuredCourse.id, featuredCourse.price, featuredCourse.title); }}
                className="btn-premium px-16 py-6 rounded-full font-black text-sm tracking-widest shadow-3xl"
              >
                GIA NHẬP TANLAB NGAY &rarr;
          </button>
        </div>
      </section>

    </main>
  );
}
