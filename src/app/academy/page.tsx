'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  Clock, 
  ShieldCheck, 
  LayoutGrid,
  TrendingUp,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const coachingPackages = [
  {
    name: "Platinum Companion",
    price: "2.000$",
    duration: "1 THÁNG ĐỒNG HÀNH",
    features: [
      "8 buổi học trực tiếp 1:1 cùng Mentor",
      "Tư vấn MIỄN PHÍ định hướng kinh doanh",
      "Combo tất cả khóa học Online (Vĩnh viễn)",
      "Support trực tiếp qua Zalo/Zoom 24/7"
    ],
    cta: "TƯ VẤN MIỄN PHÍ",
    color: "accent-primary"
  },
  {
    name: "Elite Transformation",
    price: "5.000$",
    duration: "4 THÁNG ĐỒNG HÀNH",
    features: [
      "Tất cả quyền lợi của gói Platinum",
      "Đồng hành xây dựng kênh TikTok, YouTube",
      "Đặc quyền tham gia các buổi quay thực tế",
      "Định hướng thương hiệu cá nhân dài hạn"
    ],
    cta: "ĐĂNG KÝ XÉT TUYỂN",
    color: "accent-secondary"
  }
];

export default function AcademyPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      setCourses(data || []);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-[#050507] text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-accent-primary/5 blur-[120px] rounded-full -z-10" />
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-10">
            <Zap size={12} className="text-accent-primary" />
            Academy Roadmap // 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic italic-glow">
            Lộ Trình <span className="text-accent-primary">Bứt Phá</span> <br />
            Kinh Doanh <span className="text-white/40">Sáng Tạo</span>
          </h1>
          <p className="max-w-3xl mx-auto text-text-muted text-xl md:text-2xl font-medium leading-relaxed mb-12 italic">
            Từ nền móng kỹ thuật đến tư duy kinh doanh triệu đô. Chọn lộ trình phù hợp với mục tiêu của bạn.
          </p>
        </motion.div>
      </section>

      {/* High-Ticket Coaching Section */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
         <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 italic-glow leading-none">Chương Trình <span className="text-accent-primary">1:1 Elite</span></h2>
            <p className="text-text-muted uppercase tracking-[0.4em] font-black text-[10px]">Đồng hành trực tiếp cùng Mentor</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {coachingPackages.map((pkg, i) => (
              <div 
                key={i}
                className={`flex flex-col p-12 rounded-[4rem] border relative overflow-hidden transition-all duration-700 ${
                  i === 1 ? 'bg-white text-black' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                 <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${i === 1 ? 'text-black/40' : 'text-white/40'}`}>{pkg.duration}</p>
                 <h3 className="text-4xl font-black mb-2 italic tracking-tighter uppercase">{pkg.name}</h3>
                 <p className={`text-4xl font-black mb-12 tracking-tighter ${i === 1 ? 'text-accent-secondary' : 'text-accent-primary'}`}>{pkg.price}</p>
                 
                 <div className="space-y-6 mb-16 flex-1">
                    {pkg.features.map((f, fi) => (
                       <div key={fi} className="flex items-start gap-4">
                          <CheckCircle2 size={18} className={i === 1 ? 'text-accent-secondary shrink-0 mt-1' : 'text-accent-primary shrink-0 mt-1'} />
                          <span className={`text-sm font-bold italic ${i === 1 ? 'text-black/70' : 'text-text-muted'}`}>{f}</span>
                       </div>
                    ))}
                 </div>

                 <Link 
                   href="https://m.me/yourid" 
                   className={`w-full py-6 rounded-2xl font-black text-center tracking-widest text-xs uppercase ${
                     i === 1 ? 'bg-black text-white hover:bg-accent-secondary' : 'bg-white text-black hover:bg-accent-primary hover:text-white'
                   }`}
                 >
                    {pkg.cta}
                 </Link>
              </div>
            ))}
         </div>
      </section>

      {/* Courses Catalog Section */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
         <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 italic-glow leading-none">Danh Mục <span className="text-accent-primary">Khóa Học</span></h2>
            <p className="text-text-muted uppercase tracking-[0.4em] font-black text-[10px]">Tự học thực chiến - Truy cập vĩnh viễn</p>
         </div>

         {loading ? (
            <div className="text-center py-20 text-accent-primary font-black animate-pulse uppercase tracking-widest">Synchronizing Catalog...</div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {courses.map((course, i) => (
                <div key={course.id} className="group bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden hover:border-accent-primary/40 transition-all duration-700 flex flex-col">
                   <div className="aspect-video relative overflow-hidden">
                      <img src={course.thumbnail_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                      <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-accent-primary">Học thử</div>
                   </div>
                   <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-xl font-black mb-4 group-hover:text-accent-primary transition-colors italic uppercase">{course.title}</h3>
                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                         <span className="text-xl font-black">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}</span>
                         <Link href={`/courses/${course.id}`} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-accent-primary hover:text-white transition-all"><ChevronRight size={18}/></Link>
                      </div>
                   </div>
                </div>
              ))}
            </div>
         )}
      </section>
    </main>
  );
}
