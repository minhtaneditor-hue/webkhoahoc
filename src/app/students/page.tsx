'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  User, 
  Quote, 
  Award,
  Video,
  Star,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

const ELITE_STUDENTS = [
  {
    id: 's1',
    name: 'Trần Thành Tân',
    title: 'Cinematographer / Visual Artist',
    avatar_url: '/asset/hoc_vien/tan.jpg',
    results: 'Top 1 Trending',
    quote: 'Làm chủ ngôn ngữ điện ảnh triệu view.'
  },
  {
    id: 's2',
    name: 'Nguyễn Đăng Hạnh',
    title: 'Founder Chú Lùn Bakery',
    avatar_url: '/asset/hoc_vien/hanh.jpg',
    results: '+300% Organic Revenue',
    quote: 'Biến tiệm bánh thành cỗ máy nội dung.'
  },
  {
    id: 's3',
    name: 'Nguyễn Tiến Dương',
    title: 'Founder Bảo Vệ Thành Đô',
    avatar_url: '/asset/hoc_vien/duong.jpg',
    results: 'Industry Authority',
    quote: 'Video nâng tầm uy tín dịch vụ chuyên nghiệp.'
  },
  {
    id: 's4',
    name: 'Trương Thị Như Hằng',
    title: 'Founder Thực phẩm Đồng Tâm',
    avatar_url: '/asset/hoc_vien/hang.jpg',
    results: 'Brand Refresh Success',
    quote: 'Đưa sản phẩm truyền thống chạm đến giới trẻ.'
  }
];

const FEEDBACK_IMAGES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg'];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>(ELITE_STUDENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setStudents([...ELITE_STUDENTS, ...data]);
      }
      setLoading(false);
    }
    fetchStudents();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-accent-secondary/10 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,rgba(227,38,54,0.02),transparent)] pointer-events-none" />
      
      {/* Header Section */}
      <section className="pt-48 pb-20 px-6 text-center relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">
            <Award size={12} className="text-accent-secondary" />
            Hall of Fame // Elite Alumni
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic italic-glow">
            KẾT QUẢ <br />
            <span className="text-slate-900">THỰC CHIẾN</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-400 text-xs font-black uppercase tracking-[0.2em] italic">
            Hợp tác kiến tạo tài sản số cùng Minh Tân Academy.
          </p>
        </motion.div>
      </section>

      {/* Large Grid Section */}
      <section className="max-w-[1400px] mx-auto px-6 py-24 mb-40 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {students.map((student, i) => (
            <motion.div 
              key={student.id + i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group relative rounded-[4rem] overflow-hidden aspect-[4/5] md:aspect-square lg:aspect-[4/3] bg-slate-100 shadow-2xl"
            >
                <img 
                  src={student.avatar_url || `/asset/hoc_vien/tan.jpg`} 
                  alt={student.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-10 right-10">
                  <div className="px-5 py-2 rounded-full bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {student.results}
                  </div>
                </div>

                <div className="absolute bottom-12 left-12 right-12 z-20">
                   <Quote className="text-accent-secondary mb-6 opacity-80" size={32} />
                   <h3 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight mb-8">
                      "{student.quote || student.story}"
                   </h3>
                   <div className="flex flex-col gap-1 border-l-2 border-accent-secondary pl-6">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-white underline-accent inline-block">{student.name}</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{student.title}</p>
                   </div>
                </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hard Proof Feedback Section */}
      <section className="py-40 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-left mb-24">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-secondary/5 text-accent-secondary text-[10px] font-black uppercase tracking-widest mb-8 border border-accent-secondary/10">
                  <MessageSquare size={14} /> Bằng chứng thép
              </div>
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter italic-glow leading-none">
                 Phản Hồi <br />
                 <span className="text-slate-200">Từ Cộng Đồng</span>
              </h2>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {FEEDBACK_IMAGES.map((img, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white group cursor-zoom-in"
                >
                   <img 
                    src={`/asset/feedback/${img}`} 
                    alt={`feedback-${i}`} 
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-110" 
                   />
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* Bottom Conversion Section */}
      <section className="max-w-4xl mx-auto px-6 py-40 text-center relative z-10">
         <div className="p-20 rounded-[4rem] bg-white border border-slate-100 shadow-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(227,38,54,0.02),transparent)] pointer-events-none" />
            <Star size={40} className="text-accent-secondary mx-auto mb-8 animate-pulse" />
            <h2 className="text-3xl md:text-6xl font-black mb-8 uppercase italic tracking-tighter leading-none">BẮT ĐẦU CÂU CHUYỆN <br /><span className="text-accent-secondary">CỦA BẠN</span></h2>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] mb-12">Chỉ dành cho những người hành động.</p>
            <Link href="/courses" className="btn-premium px-20 py-7 inline-flex shadow-3xl hover:scale-105 transition-transform">GIA NHẬP ACADEMY &rarr;</Link>
         </div>
      </section>

    </main>
  );
}
