'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Play, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Loader2,
  Video,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CoursesPage() {
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

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-primary font-black animate-pulse">SYNCHRONIZING CATALOG...</div>;

  return (
    <main className="min-h-screen bg-[#050507] text-white pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center relative">
          <div className="absolute inset-0 bg-accent-primary/5 blur-[120px] -z-10" />
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-8">
            <LayoutGrid size={12} className="text-accent-primary" />
            Academy Inventory // 2026
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic">DANH MỤC <span className="text-accent-primary underline-accent">KHÓA HỌC</span></h1>
          <p className="max-w-2xl mx-auto text-text-muted text-lg font-medium leading-relaxed">
            Hệ thống đào tạo thực chiến giúp bạn xây dựng tài sản số bền vững thông qua nội dung Video và trí tuệ nhân tạo.
          </p>

          {/* Trust Engineering: Social Proof Bar */}
          <div className="flex flex-wrap justify-center gap-6 mt-16 pb-16 border-b border-white/5">
             {[
               { label: "Thành viên", value: "3.600+" },
               { label: "Quốc gia", value: "20+" },
               { label: "Hài lòng", value: "99%" },
               { label: "Dự án", value: "1.200+" }
             ].map((stat, i) => (
               <div key={i} className="flex flex-col items-center px-10 border-r border-white/10 last:border-0">
                  <span className="text-3xl font-black italic tracking-tighter text-accent-primary">{stat.value}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
               </div>
             ))}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course, i) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-accent-primary/40 transition-all duration-700 hover:shadow-[0_0_50px_rgba(227,38,54,0.1)] flex flex-col"
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800"} 
                  alt={course.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-80" />
                
                {/* Elite Badges */}
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                   <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-accent-primary">
                      Học thử
                   </div>
                   <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-accent-secondary">
                      Support 24/7
                   </div>
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black mb-4 group-hover:text-accent-primary transition-colors leading-tight">
                  {course.title}
                </h3>
                <p className="text-text-muted text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                  {course.description || "Master the elite secrets of video asset building and marketing automation."}
                </p>
                
                <div className="flex items-center justify-between mb-8 pt-6 border-t border-white/5">
                   <div className="flex items-center gap-2 text-accent-secondary">
                      <Clock size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Ongoing Access</span>
                   </div>
                   <div className="text-2xl font-black tracking-tighter">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <Link 
                     href={`/courses/${course.id}`}
                     className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
                   >
                     Chi tiết
                   </Link>
                   <Link 
                     href={`/courses/${course.id}`}
                     className="p-4 rounded-2xl bg-accent-primary text-white text-center font-black text-[11px] uppercase tracking-widest hover:shadow-[0_0_20px_rgba(227,38,54,0.4)] transition-all flex items-center justify-center gap-2"
                   >
                     Đăng ký <ChevronRight size={14} />
                   </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="py-20 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-white/20">
                <Video size={40} />
             </div>
             <p className="text-text-muted uppercase tracking-widest font-black text-sm">No courses deployed yet</p>
          </div>
        )}
      </div>
    </main>
  );
}
