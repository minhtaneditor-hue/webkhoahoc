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
  Target,
  Flame,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

const INITIAL_COURSES = [
  {
    id: 'course-21-day',
    title: '21 Ngày Biến Video Thành Tài Sản',
    description: 'Bẻ khóa quy trình xây dựng cỗ máy thu nhập thụ động từ smartphone. Từ ý tưởng đến kịch bản triệu view và phễu chuyển đổi tự động.',
    price: 1999000,
    thumbnail_url: '/asset/hoc_vien/tan.jpg',
    tag: 'FLAGSHIP',
    features: ['21 Video bài giảng thực chiến', 'Kho 100+ kịch bản mẫu', 'Group hỗ trợ 1:1 trọn đời', 'Bộ Template thiết kế độc quyền']
  },
  {
    id: 'course-production',
    title: 'Quy Trình Sản Xuất Truyền Hình',
    description: 'Học cách vận hành những show truyền hình thực tế lớn. Từ setup bối cảnh đến quản trị nhân sự sản xuất.',
    price: 9999000,
    thumbnail_url: '/asset/du_an_tieu_bieu/project_2n1d.webp',
    tag: 'PRODUCTION'
  }
];

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
  const [courses, setCourses] = useState<any[]>(INITIAL_COURSES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          // Merge with static flagship but prioritize DB if duplicates
          const merged = [...INITIAL_COURSES, ...data.filter(c => !INITIAL_COURSES.find(ic => ic.title === c.title))];
          setCourses(merged);
        }
      } catch (e) {
        console.error("Course fetch fail, using initials");
      }
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900 selection:bg-accent-secondary/10">
      
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
              TỪ NỀN MÓNG KỸ THUẬT ĐẾN TƯ DUY KINH DOANH TRIỆU ĐÔ.
            </p>

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

        {/* Flagship Product Showcase */}
        <section className="mb-40">
           <div className="text-left mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/5 text-accent-secondary text-[10px] font-black uppercase tracking-widest mb-6 border border-accent-secondary/10">
                  <Flame size={14} fill="currentColor" /> Signature Course
              </div>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">BIẾN VIDEO THÀNH <br /><span className="text-slate-200">TÀI SẢN TRONG 21 NGÀY</span></h2>
           </div>

           <div className="bg-slate-950 rounded-[4rem] overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-3xl text-left border border-white/5 relative group">
              <div className="aspect-square relative overflow-hidden">
                 <img src="/asset/hoc_vien/tan.jpg" alt="21 Day Course" className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent z-10" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
              </div>
              <div className="p-16 flex flex-col justify-center relative z-20">
                 <div className="mb-10">
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white mb-4">21 NGÀY BIẾN VIDEO<br />THÀNH TÀI SẢN</h3>
                    <p className="text-slate-400 font-medium italic leading-relaxed text-lg">Bẻ khóa lộ trình xây dựng cỗ máy thu nhập tự động chỉ từ chiếc smartphone của bạn.</p>
                 </div>

                 <div className="space-y-6 mb-12">
                    {['21 Video bài giảng thực chiến', 'Kho 100+ kịch bản mẫu triệu view', 'Group hỗ trợ 1:1 trọn đời', 'Bộ Template thiết kế độc quyền'].map((f, i) => (
                       <div key={i} className="flex items-center gap-4">
                          <CheckCircle2 size={18} className="text-accent-secondary" />
                          <span className="text-sm font-bold text-slate-300 italic uppercase tracking-wider">{f}</span>
                       </div>
                    ))}
                 </div>

                 <div className="flex flex-col sm:flex-row items-center gap-8 pt-8 border-t border-white/5">
                    <div className="text-left">
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">MỨC ĐẦU TƯ</p>
                       <p className="text-3xl font-black text-white italic tracking-tighter">1.999.000 <span className="text-xs">VNĐ</span></p>
                    </div>
                    <Link href="/courses/course-21-day" className="btn-premium px-12 py-5 rounded-full text-xs shadow-[0_20px_50px_rgba(227,38,54,0.3)] flex-1 text-center">GIA NHẬP NGAY &rarr;</Link>
                 </div>
              </div>
           </div>
        </section>

        {/* Companion Program */}
        <section className="mb-40">
           <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">Chương trình <span className="text-slate-300">Companion</span></h2>
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

        {/* Other Courses Grid */}
        <section className="text-left">
           <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-4 leading-none">Tự học <span className="text-slate-300">Thực chiến</span></h2>
              <p className="text-slate-300 uppercase tracking-[0.4em] font-black text-[10px]">Truy cập vĩnh viễn - Cập nhật liên tục</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {courses.map((course, i) => (
               <motion.div 
                 key={course.id + i}
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:border-accent-secondary/40 transition-all duration-700 hover:shadow-2xl flex flex-col"
               >
                  <div className="aspect-video relative overflow-hidden">
                     <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
                     {course.tag && (
                       <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-accent-secondary shadow-lg">
                          {course.tag}
                       </div>
                     )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                     <h3 className="text-xl font-black mb-4 group-hover:text-accent-secondary transition-colors italic uppercase text-slate-900 leading-tight">{course.title}</h3>
                     <p className="text-slate-500 text-[11px] font-medium mb-8 italic line-clamp-3 leading-relaxed">{course.description}</p>
                     
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
        </section>
      </div>

    </main>
  );
}
