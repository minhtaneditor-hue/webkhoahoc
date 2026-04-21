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
  LayoutGrid,
  CheckCircle2,
  Star,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const coachingPackages = [
  {
    name: "Video Strategy Audit",
    price: "Tư vấn 1:1",
    duration: "DÀNH CHO NGƯỜI MẤT PHƯƠNG HƯỚNG",
    features: [
      "Phân tích kênh & định hướng nội dung",
      "Xây dựng tấm bản đồ lộ trình rõ ràng",
      "Tối ưu hóa phễu chuyển đổi hiện tại",
      "Giải đáp trực tiếp các nút thắt kỹ thuật"
    ],
    cta: "NHẬN TƯ VẤN NGAY",
    color: "accent-primary"
  },
  {
    name: "Premium Coaching 1:1",
    price: "Cầm tay chỉ việc",
    duration: "XÂY DỰNG HỆ THỐNG RIÊNG CHO BẠN",
    features: [
      "Đồng hành xây dựng hệ thống Video Sales",
      "Scale kênh mạnh mẽ & định vị Brand sắc nét",
      "Hỗ trợ setup góc quay chuyên nghiệp tại nhà",
      "Đặc quyền kho tài nguyên ăn sẵn trọn đời"
    ],
    cta: "ĐĂNG KÝ XÉT TUYỂN",
    color: "accent-secondary"
  }
];

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

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-accent-secondary font-black animate-pulse tracking-widest">TANLAB CATALOG LOADING...</div>;

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-48 pb-24 px-6 text-center relative">
        <header className="mb-32 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-accent-secondary/5 blur-[120px] rounded-full -z-10" />
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-slate-100 bg-white shadow-sm text-[11px] font-black tracking-[0.4em] uppercase text-slate-400 mb-10">
              <Zap size={14} className="text-accent-secondary" />
              Intelligence Hub // 2026
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic italic-glow">
              DANH MỤC <span className="text-slate-300">KHÓA HỌC</span>
            </h1>
            <p className="max-w-3xl mx-auto text-slate-500 text-xl font-bold leading-relaxed mb-16 italic uppercase tracking-tight">
              TỪ NỀN MÓNG KỸ THUẬT ĐẾN TƯ DUY KINH DOANH TRIỆU ĐÔ.<br />
              <span className="text-sm font-medium normal-case tracking-normal text-slate-400">Chọn lộ trình phù hợp với mục tiêu bứt phá của bạn.</span>
            </p>

            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center gap-10 md:gap-20">
               {[
                 { label: "Học viên", value: "1.000+" },
                 { label: "Thành công", value: "98%" },
                 { label: "Video triệu view", value: "5.000+" }
               ].map((stat, i) => (
                 <div key={i} className="flex flex-col items-center">
                    <span className="text-4xl font-black italic tracking-tighter text-slate-900">{stat.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{stat.label}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </header>

        {/* High-Ticket Coaching */}
        <section className="mb-40">
           <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 italic-glow leading-none">Chương trình <span className="text-slate-300">Companion</span></h2>
              <p className="text-slate-300 uppercase tracking-[0.4em] font-black text-[10px]">Đồng hành trực tiếp cùng Video Advisor</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              {coachingPackages.map((pkg, i) => (
                <div 
                  key={i}
                  className={`flex flex-col p-12 rounded-[4rem] border relative overflow-hidden transition-all duration-700 bg-white ${
                    i === 1 ? 'border-accent-secondary/20 shadow-2xl' : 'border-slate-100 shadow-xl'
                  }`}
                >
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-slate-300">{pkg.duration}</p>
                   <h3 className="text-4xl font-black mb-2 italic tracking-tighter uppercase text-slate-900">{pkg.name}</h3>
                   <p className={`text-3xl font-black mb-12 tracking-tighter ${i === 1 ? 'text-accent-secondary' : 'text-slate-400'}`}>{pkg.price}</p>
                   
                   <div className="space-y-6 mb-16 flex-1">
                      {pkg.features.map((f, fi) => (
                         <div key={fi} className="flex items-start gap-4">
                            <CheckCircle2 size={18} className={i === 1 ? 'text-accent-secondary shrink-0 mt-1' : 'text-slate-300 shrink-0 mt-1'} />
                            <span className="text-sm font-bold italic text-slate-500">{f}</span>
                         </div>
                      ))}
                   </div>

                   <Link 
                     href="https://zalo.me/0922255861" 
                     className={`w-full py-6 rounded-2xl font-black text-center tracking-widest text-xs uppercase transition-all ${
                       i === 1 ? 'bg-accent-secondary text-white shadow-xl hover:shadow-accent-secondary/30' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                     }`}
                   >
                      {pkg.cta}
                   </Link>
                </div>
              ))}
           </div>
        </section>

        {/* Course Catalog */}
        <section className="text-left">
           <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 italic-glow leading-none">Tự học <span className="text-slate-300">Thực chiến</span></h2>
              <p className="text-slate-300 uppercase tracking-[0.4em] font-black text-[10px]">Truy cập vĩnh viễn - Cập nhật liên tục</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {courses.map((course, i) => (
               <motion.div 
                 key={course.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:border-accent-secondary/40 transition-all duration-700 hover:shadow-2xl flex flex-col"
               >
                  <div className="aspect-video relative overflow-hidden">
                     <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                     <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md border border-slate-100 text-[9px] font-black uppercase tracking-widest text-accent-secondary">
                        Digital Asset
                     </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                     <h3 className="text-xl font-black mb-4 group-hover:text-accent-secondary transition-colors italic uppercase text-slate-900 leading-tight">{course.title}</h3>
                     <p className="text-slate-500 text-xs font-medium mb-8 italic line-clamp-3 leading-relaxed">{course.description || "Học quy trình bẻ khóa thuật toán đa nền tảng và xây dựng phễu bán hàng tự động."}</p>
                     
                     <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-2xl font-black tracking-tighter text-slate-900">
                           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
                        </span>
                        <Link href={`/courses/${course.id}`} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-accent-secondary hover:text-white transition-all">
                           <ChevronRight size={20}/>
                        </Link>
                     </div>
                  </div>
               </motion.div>
             ))}
           </div>
           
           {courses.length === 0 && (
             <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest animate-pulse">
                Deploying catalog intelligence...
             </div>
           )}
        </section>
      </div>

      <Footer />
    </main>
  );
}
