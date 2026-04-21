"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { isAdmin } from '@/lib/admin';

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingContent, setLoadingContent] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: coursesData } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (coursesData) setCourses(coursesData);

      const { data: settingsData } = await supabase.from('site_settings').select('*');
      const settingsMap: Record<string, string> = {};
      settingsData?.forEach(s => { settingsMap[s.key] = s.value; });
      setSettings(settingsMap);
      setLoadingContent(false);
    }
    init();
  }, []);

  if (loadingContent) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black tracking-widest animate-pulse">SYNCHRONIZING TERMINAL...</div>;

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

  const bonuses = [
    { title: "Kèm cặp 1:1 từ số 0", desc: "Hỗ trợ trực tiếp qua Zalo/Group để bạn không bị lạc lõng.", icon: <Users size={20} /> },
    { title: "Kho kịch bản viral", desc: "100+ mẫu nội dung đã được chứng minh hiệu quả.", icon: <Terminal size={20} /> },
    { title: "Âm thanh bản quyền", desc: "Bộ sưu tập nhạc nền xu hướng giúp video lên xu hướng.", icon: <Play size={20} /> },
    { title: "Template thiết kế", desc: "Mẫu ảnh bìa, hiệu ứng chữ độc quyền của Minh Tấn.", icon: <Award size={20} /> }
  ];

  const faqs = [
    { q: "Điện thoại cũ có học được không?", a: "Được! Tôi sẽ hướng dẫn bạn cách dùng ánh sáng để che đi khuyết điểm của máy." },
    { q: "Tôi nhát, không dám lên hình?", a: "Có chiến thuật Voice-over và bối cảnh giúp bạn vẫn ra video mà không cần lộ mặt nếu muốn." },
    { q: "Học xong chưa ra tiền thì sao?", a: "Tôi cam kết hỗ trợ 1-1 cho đến khi bạn nắm vững quy trình tạo ra phễu bán hàng." }
  ];

  return (
    <main className="min-h-screen bg-[#050507] text-white selection:bg-accent-secondary/30">
      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(227,38,54,0.12),transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-20 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black text-white/40 mb-10 tracking-[0.3em]">
              ACADEMY ELITE // v21.0 DEPLOYMENT
            </div>
            
            <h1 className="leading-[0.9] md:leading-[0.85] text-5xl md:text-7xl font-black mb-8 italic uppercase italic-glow">
              {settings['hero_title'] || 'Khai Phá'}<br />
              <span className="text-accent-primary">Tư Duy</span><br />
              <span className="text-white/40">Sáng Tạo</span>
            </h1>
            
            <p className="text-xl text-text-muted mb-12 max-w-lg leading-relaxed font-medium">
              {settings['hero_description'] || 'Kiến tạo cỗ máy thu nhập thụ động chỉ với smartphone và chiến lược nội dung chuyên nghiệp.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link href="/academy" className="btn-premium flex items-center justify-center gap-4 group">
                VÀO HỌC VIỆN <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/work" className="px-10 py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                DỰ ÁN ELITE
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative"
          >
            <div className="w-full aspect-[4/5] md:aspect-square lux-border-gold overflow-hidden relative group">
                <img 
                  src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200" 
                  alt="Professional Cinematography"
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:scale-105 transition-transform duration-[3000ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-12 left-12">
                   <p className="text-[10px] font-black tracking-[0.5em] text-accent-primary uppercase mb-3">Lead Mentor</p>
                   <p className="text-5xl font-black tracking-tighter">MINH TÂN</p>
                </div>
            </div>
            {/* Minimal Stat Badge */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute -top-12 -right-8 p-10 glass-effect rounded-[3rem] hidden lg:block border-white/10"
            >
               <p className="text-5xl font-black text-accent-primary mb-1">99%</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Hài lòng</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Brand Authority Section */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 font-mono">Trusted by Global Giants</p>
               <h3 className="text-2xl font-black italic tracking-tighter uppercase whitespace-pre-line group">
                  ĐỐI TÁC CHIẾN LƯỢC & <span className="text-accent-primary">THƯƠNG HIỆU ĐÃ HỢP TÁC</span>
               </h3>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               {['SONY', 'CANON', 'HONDA', 'ADOBE', 'DJI'].map((brand) => (
                 <div key={brand} className="text-2xl md:text-4xl font-black tracking-[0.4em] italic hover:text-accent-primary hover:opacity-100 transition-all cursor-default">
                    {brand}
                 </div>
               ))}
            </div>
            <div className="mt-16 flex justify-center">
               <Link href="/about" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group">
                  TÌM HIỂU VỀ CHÚNG TÔI <ChevronRight size={14} className="group-hover:translate-x-2 transition-all" />
               </Link>
            </div>
         </div>
      </section>

      {/* Authority Showcase: Featured Work */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 text-accent-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-accent-primary/20">
                <Video size={12} /> Authority Showcase
             </div>
             <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 italic-glow">
                Dự án <span className="text-white/40">tiêu biểu</span>
             </h2>
             <p className="text-text-muted font-medium text-lg leading-relaxed">
                Chứng thực năng lực qua các tác phẩm được đầu tư bài bản về mặt hình ảnh và ngôn ngữ điện ảnh.
             </p>
          </div>
          <Link href="/work" className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-all flex items-center gap-3">
             XEM TẤT CẢ <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1, 2, 3].map((_, i) => (
             <Link key={i} href="/work" className="group block relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/5 hover:border-accent-primary/30 transition-all duration-700">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-all z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all">
                   <div className="w-12 h-12 rounded-full bg-accent-primary/20 backdrop-blur-md flex items-center justify-center text-accent-primary transform scale-50 group-hover:scale-100 transition-all">
                      <Play size={20} fill="currentColor" />
                   </div>
                </div>
                <div className="absolute bottom-6 left-6 z-20">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Production Project</p>
                   <h4 className="text-lg font-black italic uppercase group-hover:text-accent-primary transition-colors">Tactical Visual v{i+1}</h4>
                </div>
             </Link>
           ))}
        </div>
      </section>

      {/* The Core System Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <BentoCard 
            title={featuredCourse?.title || "Tactical Bundle"}
            description={featuredCourse?.description || "Master the 21-day workflow of content automation."}
            size="large"
            icon={<Video size={32} className="text-accent-secondary" />}
            className="md:col-span-2 md:row-span-2"
          >
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <CheckCircle2 size={16} className="text-green-500" />
                Dựng phim chuyên nghiệp trên Mobile
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted">
                <CheckCircle2 size={16} className="text-green-500" />
                Tư duy kịch bản "Bán mà không bán"
              </div>
              <button 
                onClick={() => { if (featuredCourse) handlePayment(featuredCourse.id, featuredCourse.price, featuredCourse.title); }}
                className="mt-4 p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary font-bold text-center hover:bg-accent-secondary/20 transition-all"
              >
                View Operations Details
              </button>
            </div>
          </BentoCard>

          <BentoCard title="Nội Dung Viral" description="Tiếp cận triệu khách hàng tự nhiên." icon={<Play size={24} />} />
          <BentoCard title="Hệ Thống Phễu" description="Tự động hóa dòng tiền 24/7." icon={<Layers size={24} />} />
          <BentoCard title="Thương Hiệu" description="Định vị personal brand sắc nét." icon={<Users size={24} />} className="md:col-span-2" />
        </div>
      </section>

      {/* Bonus Stack */}
      <section className="bg-white/5 py-24 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center mb-16 underline-accent">QUÀ TẶNG <span className="text-accent-secondary">ĐẶC QUYỀN</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bonuses.map((bonus, i) => (
              <div key={i} className="flex gap-6 p-8 rounded-3xl lux-border-gold hover:border-accent-primary/30 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform shrink-0">
                  {bonus.icon}
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">{bonus.title}</h4>
                  <p className="text-text-muted text-sm leading-relaxed">{bonus.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-center mb-16 flex items-center justify-center gap-3">
             <HelpCircle className="text-accent-secondary" />
             QUERY RESOLUTION
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden transition-all"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.03]">
                  <span className="font-bold">{faq.q}</span>
                  <ChevronRight size={20} className={`text-text-muted transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} />
                </div>
                {activeFaq === i && (
                  <div className="px-6 pb-6 text-text-muted text-sm border-t border-white/5 pt-6 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* SaaS DRM Premium Integration */}
      <section id="saas-preview" className="relative border-y border-white/5">
        <SaaSDRMHero />
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black mb-6"> READY TO <span className="text-accent-secondary">DEPLOY?</span></h2>
          <p className="text-text-muted mb-10 leading-relaxed font-medium">Chiếc điện thoại của bạn đang chờ để được lên cấu hình mới. Đắm chìm vào 21 ngày thực chiến ngay hôm nay.</p>
          <button 
                onClick={() => { if (featuredCourse) handlePayment(featuredCourse.id, featuredCourse.price, featuredCourse.title); }}
                className="btn-premium px-12 py-5 rounded-full font-black text-sm tracking-widest shadow-2xl shadow-accent-primary/40 hover:shadow-accent-secondary/40"
              >
                MISSION START &rarr;
          </button>
        </div>
      </section>

    </main>
  );
}
