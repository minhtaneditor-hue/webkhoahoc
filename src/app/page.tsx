"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import BentoCard from '@/components/BentoCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingContent, setLoadingContent] = useState(false); // Instant load
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
      }
    }
    init();
  }, []);

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
    { name: "Phú Long", logo: "/asset/doi_tac/partner_phulong.webp" },
    { name: "Viglacera", logo: "/asset/doi_tac/partner_viglacera.webp" },
    { name: "Suntory Pepsico", logo: "/asset/doi_tac/partner_pepsico.png" },
    { name: "HTV", logo: "/asset/doi_tac/partner_htv.png" },
    { name: "Vietjet", logo: "/asset/doi_tac/partner_vietjet.jpg" }
  ];

  const projects = [
    { title: "2 Ngày 1 Đêm", category: "TV Show Integration", image: "/asset/du_an_tieu_bieu/project_2n1d.webp" },
    { title: "Anh Trai Say Hi Movie", category: "Cinematic Production", image: "/asset/du_an_tieu_bieu/project_atsh_movie.jpg" },
    { title: "Anh Trai Say Hi - Las Vegas", category: "Global Event Coverage", image: "/asset/du_an_tieu_bieu/project_atsh_vegas.webp" },
    { title: "Nghệ Thuật Truyền Hình", category: "Digital Content", image: "/asset/du_an_tieu_bieu/project_nhth.jpg" },
    { title: "Mái Ấm Tình Thương", category: "Documentary", image: "/asset/du_an_tieu_bieu/project_matn.webp" },
    { title: "Ký Ức Vui Vẻ", category: "TV Production", image: "/asset/du_an_tieu_bieu/project_kuvv.png" }
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
    <main className="min-h-screen text-slate-900 selection:bg-accent-secondary/10 relative overflow-x-hidden bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center bg-white">
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
                  src="/asset/avatar/hero_expert.jpg" 
                  alt="Video Advisor"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12">
                   <p className="text-[11px] font-black tracking-[0.5em] text-white uppercase mb-3 drop-shadow-md">Video Advisor</p>
                   <p className="text-5xl font-black tracking-tighter text-white italic drop-shadow-xl">MINH TẤN</p>
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

      {/* Partners Auto-Scroll Ticker */}
      <section className="py-20 border-y border-slate-100 bg-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 mb-12">
            <h3 className="text-center text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">ĐỐI TÁC CHIẾN LƯỢC & THƯƠNG HIỆU HỢP TÁC</h3>
         </div>
         <div className="flex relative">
            <motion.div 
              initial={{ x: 0 }}
              animate={{ x: "-50%" }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                ease: "linear",
                delay: 2 // Initial delay as requested
              }}
              className="flex items-center gap-24 whitespace-nowrap"
            >
               {[...partners, ...partners].map((partner, i) => (
                 <div key={i} className="h-12 md:h-20 flex items-center justify-center">
                    <img src={partner.logo} alt={partner.name} className="h-full w-auto object-contain" />
                 </div>
               ))}
            </motion.div>
         </div>
      </section>

      {/* Featured Projects Grid (Normal Scroll) */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/5 text-accent-secondary text-[11px] font-black uppercase tracking-widest mb-6 border border-accent-secondary/10">
                <Video size={14} /> Authority Showcase
             </div>
             <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-6 italic-glow leading-none">
                Dự án <span className="text-slate-300">Tiêu biểu</span>
             </h2>
          </div>
          <Link href="/work" className="px-8 py-3 rounded-full bg-slate-50 border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-3">
             XEM TẤT CẢ <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {projects.map((project, i) => (
             <Link key={i} href="/work" className="group block relative aspect-[4/3] rounded-[3rem] overflow-hidden border border-slate-100 bg-white hover:border-accent-secondary/20 shadow-xl transition-all duration-700">
                <img src={project.image} alt={project.title} className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 z-20 text-white">
                   <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">{project.category}</p>
                   <h4 className="text-[10px] font-black italic uppercase tracking-tight leading-none">{project.title}</h4>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* DRM Ticker Section */}
      <section className="bg-slate-950 py-10 relative overflow-hidden">
        <div className="flex whitespace-nowrap">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-16"
          >
            {[1,2,3,4].map(i => (
              <div key={i} className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.5em] text-white">
                <ShieldCheck size={16} className="text-accent-secondary" /> 
                <span className="bg-gradient-to-r from-white via-slate-400 to-white bg-clip-text text-transparent">BẢO MẬT TÀI SẢN TOÀN DIỆN VỚI TANLAB DRM</span>
                <span className="text-slate-800">//</span>
                <span className="text-accent-secondary italic">ANTI-PIRACY TECHNOLOGY</span>
                <span className="text-slate-800">//</span>
                <span className="text-slate-400">100% CONTENT PROTECTION</span>
                <span className="text-slate-800">//</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Courses Bento Grid */}
      <section className="bg-white py-32 px-6 border-b border-slate-100">
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
                  className="mt-6 p-5 rounded-2xl bg-accent-secondary text-white font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-accent-secondary/30 transition-all font-mono"
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
      <section className="py-32 px-6 bg-slate-50/30">
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
      <section className="py-32 px-6 bg-white border-y border-slate-100">
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

      {/* Final FOMO CTA */}
      <section className="py-40 px-6 text-center bg-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(227,38,54,0.02),transparent)] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto p-16 rounded-[4rem] bg-white border border-slate-100 shadow-[0_50px_100px_rgba(0,0,0,0.05)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-primary/2 to-accent-secondary/5 opacity-50 -z-10" />
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-secondary/10 text-accent-secondary text-[10px] font-black uppercase tracking-widest mb-8">
            <Zap size={14} fill="currentColor" /> HÀNH ĐỘNG NGAY
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8 italic italic-glow uppercase leading-[0.9]"> 
            SẴN SÀNG <span className="text-slate-900">BỨT PHÁ?</span>
          </h2>
          
          <p className="text-xl text-slate-400 mb-12 font-black uppercase italic tracking-widest border-y border-slate-50 py-6 inline-block">
            CHỈ CÒN <span className="text-accent-secondary animate-pulse">3 SUẤT ƯU ĐÃI CUỐI CÙNG</span> TRONG HÔM NAY!
          </p>
          
          <button 
                onClick={() => { if (featuredCourse) handlePayment(featuredCourse.id, featuredCourse.price, featuredCourse.title); }}
                className="btn-premium px-20 py-7 rounded-full font-black text-xs tracking-[0.3em] shadow-3xl mx-auto block hover:scale-105 transition-transform"
              >
                GIA NHẬP TANLAB NGAY &rarr;
          </button>
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100">
        <Footer />
      </footer>

    </main>
  );
}
