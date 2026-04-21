'use client';

import { 
  Users, 
  Target, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white pt-48 pb-32 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-20 relative">
          <div className="absolute inset-0 bg-accent-primary/10 blur-[120px] -z-10" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
             The Mission // 2026
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 italic tracking-tighter">KIẾN TẠO <span className="text-primary underline-accent">THE ELITES</span></h1>
          <p className="max-w-2xl mx-auto text-xl text-text-muted font-medium leading-relaxed">
             Sứ mệnh của chúng tôi là giúp 1,000,000 doanh nhân số làm chủ kỹ năng Video Cinematic và xây dựng phễu bán hàng tự động.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32">
           {[
             { t: "Kỹ năng Thực chiến", d: "Chúng tôi không dạy lý thuyết. Chúng tôi dạy cách tạo ra kết quả từ chiếc smartphone của bạn.", i: <Zap /> },
             { t: "Cộng đồng Elite", d: "Bạn sẽ gia nhập mạng lưới các nhà sáng tạo nội dung hàng đầu, hỗ trợ lẫn nhau 24/7.", i: <Users /> },
             { t: "Bảo mật & Uy tín", d: "Mọi kiến thức được kiểm chứng bởi các chuyên gia thực chiến nhất trong ngách Marketing Video.", i: <ShieldCheck /> }
           ].map((item, idx) => (
             <div key={idx} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8 shadow-xl">
                   {item.i}
                </div>
                <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{item.t}</h4>
                <p className="text-text-muted leading-relaxed font-medium">{item.d}</p>
             </div>
           ))}
        </div>

        <section className="p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 text-center">
           <h2 className="text-4xl md:text-5xl font-black mb-8 italic">BẮT ĐẦU HÀNH TRÌNH CỦA BẠN</h2>
           <p className="text-text-muted text-lg mb-12 max-w-xl mx-auto font-medium leading-relaxed">
              Chiếc điện thoại của bạn đang chờ để được lên cấu hình mới. Bạn đã sẵn sàng để trở thành Elite tiếp theo?
           </p>
           <Link href="/courses" className="btn-premium px-12 py-5 rounded-full inline-flex items-center gap-4 font-black uppercase text-xs tracking-widest shadow-2xl">
              KHÁM PHÁ KHÓA HỌC <ArrowRight size={18} />
           </Link>
        </section>
      </div>
    </main>
  );
}
