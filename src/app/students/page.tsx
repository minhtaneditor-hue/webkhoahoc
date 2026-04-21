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
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const ELITE_STUDENTS = [
  {
    id: 's1',
    name: 'Trần Thành Tân',
    title: 'Cinematographer / Visual Artist',
    story: 'Khóa học đã thay đổi hoàn toàn cách mình tư duy về khung hình. Từ một người cầm máy theo bản năng, mình đã làm chủ được ngôn ngữ điện ảnh để kể những câu chuyện triệu view.',
    avatar_url: 'https://i.pravatar.cc/150?u=tan',
    results: 'Top 1 Trending Content Strategy'
  },
  {
    id: 's2',
    name: 'Nguyễn Đăng Hạnh',
    title: 'Founder Chú Lùn Bakery',
    story: 'Biến điện thoại thành cỗ máy bán hàng là có thật. Mình đã tự sản xuất toàn bộ nội dung marketing cho tiệm bánh và đạt doanh thu bứt phá chỉ sau 3 tuần áp dụng.',
    avatar_url: 'https://i.pravatar.cc/150?u=hanh',
    results: '300% Organic Lead Growth'
  },
  {
    id: 's3',
    name: 'Nguyễn Tiến Dương',
    title: 'Founder Bảo Vệ Thành Đô',
    story: 'Tư duy "Video là Tài sản" giúp mình xây dựng được nhân hiệu uy tín trong ngành dịch vụ bảo vệ. Khách hàng tin tưởng hơn khi thấy quy trình làm việc chuyên nghiệp qua ống kính.',
    avatar_url: 'https://i.pravatar.cc/150?u=duong',
    results: 'Established Industry Authority'
  },
  {
    id: 's4',
    name: 'Trương Thị Như Hằng',
    title: 'Founder Thực phẩm Đồng Tâm',
    story: 'Không chỉ là quay phim, đây là khóa học về chiến lược. Mình đã biết cách đóng gói giá trị sản phẩm truyền thống thành những video hiện đại, thu hút lượng lớn khách hàng trẻ.',
    avatar_url: 'https://i.pravatar.cc/150?u=hang',
    results: 'Viral Traditional Brand Refresh'
  },
  {
    id: 's5',
    name: 'Phan Quốc Việt',
    title: 'Creative Specialist',
    story: 'Quy trình sản xuất tinh gọn tại Tanlab giúp mình tiết kiệm 80% thời gian hậu kỳ mà chất lượng video vẫn đạt chuẩn truyền hình. Một khoản đầu tư quá xứng đáng.',
    avatar_url: 'https://i.pravatar.cc/150?u=viet',
    results: '80% Production Efficiency Increase'
  },
  {
    id: 's6',
    name: 'Lê Hoàng Nam',
    title: 'Content Strategist',
    story: 'Từ một người ngại lên hình, giáo trình của anh Minh Tấn đã giúp mình tự tin và có phong thái chuyên nghiệp. Giờ đây video không còn là nỗi sợ mà là đam mê.',
    avatar_url: 'https://i.pravatar.cc/150?u=nam',
    results: 'Personal Brand Breakthrough'
  }
];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>(ELITE_STUDENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setStudents(data);
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
            Hào Quang Học Viên // Hall of Fame
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic italic-glow">
            KẾT QUẢ LÀ <br />
            <span className="text-slate-900">DINH DƯỠNG</span>
          </h1>
          <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium leading-relaxed italic border-l-4 border-accent-secondary pl-8 text-left md:text-center md:border-l-0 md:pl-0">
            Nơi trưng bày những thành quả bứt phá từ những học viên nỗ lực nhất tại Tanlab. Thành công của bạn chính là bộ mặt của chúng tôi.
          </p>
        </motion.div>
      </section>

      {/* Success Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 mb-40 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {students.map((student, i) => (
            <motion.div 
              key={student.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="bg-white border border-slate-100 rounded-[3rem] p-12 hover:border-accent-secondary/20 transition-all duration-700 h-full flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl">
                <div className="flex justify-between items-start mb-10">
                   <Quote className="text-accent-secondary opacity-10" size={48} />
                   <div className="px-3 py-1 rounded-full bg-accent-secondary/5 text-accent-secondary text-[9px] font-black uppercase tracking-widest border border-accent-secondary/10">
                      {student.results}
                   </div>
                </div>
                
                <p className="text-lg font-medium text-slate-600 italic leading-relaxed mb-12 flex-1">
                   "{student.story}"
                </p>

                <div className="flex items-center gap-6 pt-10 border-t border-slate-50">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-inner bg-slate-50 group-hover:scale-110 transition-transform duration-500">
                    <img src={student.avatar_url || `https://i.pravatar.cc/150?u=${student.name}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-accent-secondary transition-colors underline-accent">{student.name}</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">{student.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Call to Action */}
      <section className="max-w-4xl mx-auto px-6 mb-40 text-center relative z-10">
         <div className="p-20 rounded-[4rem] bg-slate-950 text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 blur-[100px] pointer-events-none" />
            <Star size={40} className="text-accent-secondary mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-black mb-8 uppercase italic tracking-tighter leading-none">TRỞ THÀNH CÂU CHUYỆN <br /><span className="text-accent-secondary">THÀNH CÔNG</span> TIẾP THEO</h2>
            <p className="text-slate-400 font-medium mb-12 max-w-2xl mx-auto italic leading-relaxed">
               Gia nhập cộng đồng Elite Student và bắt đầu hành trình chuyển hóa bản thân. Kết quả của bạn đã sẵn sàng để được trưng bày tại đây.
            </p>
            <Link href="/courses" className="btn-premium px-16 py-6 inline-flex shadow-[0_20px_50px_rgba(227,38,54,0.3)]">BẮT ĐẦU NGAY &rarr;</Link>
         </div>
      </section>
    </main>
  );
}
