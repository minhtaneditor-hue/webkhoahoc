'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  User, 
  ExternalLink, 
  Quote, 
  Loader2,
  Award,
  Video,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      setStudents(data || []);
      setLoading(false);
    }
    fetchStudents();
  }, []);

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      {/* Header Section */}
      <section className="pt-48 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(227,38,54,0.08),transparent)] pointer-events-none" />
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8">
            <Award size={12} className="text-accent-primary" />
            Student Excellence // Hall of Fame
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic italic-glow">
            Niềm Tự Hào <br />
            Của <span className="text-accent-primary">Học Viện</span>
          </h1>
          <p className="max-w-2xl mx-auto text-text-muted text-lg font-medium leading-relaxed italic">
            Nơi trưng bày những thành quả, sự bứt phá và những sản phẩm thực chiến từ chính bàn tay các học viên của Minh Tân Academy.
          </p>
        </motion.div>
      </section>

      {/* Students Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 mb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
             <Loader2 size={40} className="text-accent-primary animate-spin" />
             <p className="text-[10px] font-black uppercase tracking-widest text-white/20 font-mono tracking-widest">Synchronizing Success Stories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {students.map((student, i) => (
              <motion.div 
                key={student.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                 <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 hover:border-accent-primary/40 transition-all duration-700 h-full flex flex-col hover:shadow-[0_0_50px_rgba(227,38,54,0.05)]">
                    <Quote className="text-accent-primary opacity-20 mb-8" size={40} />
                    
                    <p className="text-lg font-medium text-text-muted italic leading-relaxed mb-10 flex-1">
                       "{student.story || 'Khóa học đã thực sự thay đổi tư duy làm phim của mình từ một người quay phim nghiệp dư thành một production chuyên nghiệp.'}"
                    </p>

                    <div className="flex items-center justify-between pt-10 border-t border-white/5">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5 grayscale group-hover:grayscale-0 transition-all duration-700">
                             {student.avatar_url ? (
                               <img src={student.avatar_url} className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-white/10"><User size={24} /></div>
                             )}
                          </div>
                          <div>
                             <h4 className="text-xl font-black uppercase italic tracking-tighter group-hover:text-accent-primary transition-colors">{student.name}</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20 italic">Elite Student</p>
                          </div>
                       </div>
                       
                       {student.project_link && (
                         <a 
                           href={student.project_link} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:bg-accent-primary hover:text-white transition-all shadow-xl"
                         >
                            <Video size={18} />
                         </a>
                       )}
                    </div>
                 </div>
              </motion.div>
            ))}

            {students.length === 0 && (
              <div className="col-span-full py-40 text-center bg-white/[0.01] border border-dashed border-white/10 rounded-[3rem]">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-white/10">
                    <Award size={40} />
                 </div>
                 <h3 className="text-2xl font-black uppercase italic mb-4">Sắp xuất hiện...</h3>
                 <p className="text-text-muted font-medium italic">Chúng tôi đang cập nhật những câu chuyện thành công mới nhất.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Trust Trigger Section */}
      <section className="max-w-5xl mx-auto px-6 mb-40 text-center">
         <div className="p-20 rounded-[4rem] bg-accent-primary/5 border border-accent-primary/10">
            <Star size={40} className="text-accent-primary mx-auto mb-8" />
            <h2 className="text-3xl font-black mb-6 uppercase italic tracking-tighter">Bạn Muốn Là <span className="text-accent-primary">Gương Mặt</span> Tiếp Theo?</h2>
            <p className="text-text-muted font-medium mb-10 max-w-2xl mx-auto italic">
               Tham gia vào Academy và bắt đầu cuộc hành trình chuyển mình từ một người nghiệp dư thành một chuyên gia thực thụ. Kết quả của bạn là niềm tự hào của chúng tôi.
            </p>
            <Link href="/academy" className="btn-premium px-12 py-5 inline-flex">GIA NHẬP ACADEMY NGAY</Link>
         </div>
      </section>
    </main>
  );
}
