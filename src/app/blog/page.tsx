'use client';

import { 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Tag, 
  Loader2,
  Newspaper,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BlogPage() {
  const posts = [
    { title: "Cách tối ưu ánh sáng Cinematic cho Video Mobile", date: "20/04/2026", cat: "Production", desc: "Khám phá bí mật đằng sau những cảnh quay triệu view chỉ với một nguồn sáng tự nhiên." },
    { title: "Hành trình xây dựng nhân hiệu từ con số 0", date: "18/04/2026", cat: "Branding", desc: "Chiến lược định vị bản thân trong ngách thị trường đầy cạnh tranh và thu hút tệp khách hàng mơ ước." },
    { title: "Xu hướng Video Asset 2026: Điều gì sẽ lên ngôi?", date: "15/04/2026", cat: "Strategy", desc: "Phân tích số liệu và dự đoán sự bùng nổ của nội dung ngắn tích hợp trí tuệ nhân tạo." }
  ];

  return (
    <main className="min-h-screen bg-[#050507] text-white pt-48 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/10 text-accent-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-6 border border-accent-secondary/20">
             Knowledge Base // Journal
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 italic tracking-tighter uppercase text-white/40"><span className="text-white">Elite</span> Journal</h1>
          <p className="max-w-2xl mx-auto text-lg text-text-muted font-medium leading-relaxed">
             Cập nhật những chiến thuật, tư duy và kỹ thuật mới nhất về Video Content & Automation từ đội ngũ chuyên gia.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {posts.map((post, i) => (
            <motion.article 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-accent-secondary/40 transition-all duration-700 flex flex-col"
            >
              <div className="aspect-[16/10] bg-white/5 overflow-hidden relative">
                 <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform duration-1000">
                    <Newspaper size={80} />
                 </div>
                 <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-accent-secondary flex items-center gap-2">
                    <Tag size={10} /> {post.cat}
                 </div>
              </div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-white/30 text-[10px] font-black uppercase tracking-widest mb-4">
                   <Clock size={12} /> {post.date}
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-accent-secondary transition-colors leading-tight italic">
                   {post.title}
                </h3>
                <p className="text-text-muted text-sm mb-10 line-clamp-3 leading-relaxed font-medium flex-1">
                   {post.desc}
                </p>
                <Link href="#" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors">
                   Read Entry <ChevronRight size={16} />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Content-to-Sales Accelerator */}
        <div className="mt-32 p-16 rounded-[4rem] bg-accent-secondary/5 border border-accent-secondary/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen size={200} />
           </div>
           
           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/10 text-accent-secondary text-[10px] font-black uppercase tracking-widest mb-6 border border-accent-secondary/20">
                    <Zap size={12} /> Advanced Opportunity
                 </div>
                 <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none">
                    Vượt Xa <span className="text-white">Kỹ thuật</span><br />
                    Làm chủ <span className="text-accent-secondary italic-glow">Sự nghiệp</span>
                 </h2>
                 <p className="text-text-muted text-lg font-medium leading-relaxed mb-8 max-w-md">
                    Bạn đã có kiến thức từ Blog. Giờ là lúc thực sự bứt phá với chương trình Coaching 1:1 đồng hành cùng Mentor 4 tháng.
                 </p>
                 <Link href="/coaching" className="btn-secondary inline-flex w-full md:w-auto">THAM GIA COACHING ELITE</Link>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-md">
                 <h4 className="text-sm font-black uppercase tracking-widest mb-6">Master Class Featured</h4>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                       <div>
                          <p className="text-[10px] font-black text-accent-secondary uppercase mb-1">Bán chạy nhất</p>
                          <p className="font-bold text-sm italic">Xây kênh triệu view từ 0</p>
                       </div>
                       <Link href="/courses" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent-secondary transition-all">
                          <ChevronRight size={18} />
                       </Link>
                    </div>
                    <div className="flex items-center justify-between">
                       <div>
                          <p className="text-[10px] font-black text-white/30 uppercase mb-1">Chương trình mới</p>
                          <p className="font-bold text-sm italic">Video Marketing for Business</p>
                       </div>
                       <Link href="/courses" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-accent-secondary transition-all">
                          <ChevronRight size={18} />
                       </Link>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}
