'use client';

import { 
  Rocket, 
  Target, 
  MessageCircle, 
  CheckCircle2, 
  Zap, 
  ChartBar, 
  ShieldCheck, 
  Star,
  ChevronRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const packages = [
  {
    name: "Platinum Companion",
    price: "2.000$",
    duration: "1 THÁNG ĐỒNG HÀNH",
    features: [
      "8 buổi học trực tiếp 1:1 cùng Mentor",
      "Tư vấn MIỄN PHÍ định hướng & chiến lược mô hình kinh doanh",
      "Combo tất cả khóa học Online (Vĩnh viễn)",
      "CAM KẾT đạt được mục tiêu video cụ thể",
      "Support trực tiếp qua Zalo/Zoom 24/7",
      "FREE bộ tài nguyên Sound FX, Transitions, Overlays"
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
      "Đồng hành xây dựng kênh TikTok, YouTube trong 4 tháng",
      "1 buổi Zoom chiến lược mỗi tuần",
      "Giao bài tập & thúc đẩy hành động mỗi ngày",
      "Định hướng thương hiệu cá nhân dài hạn",
      "Đặc quyền tham gia các buổi quay thực tế cùng Mentor"
    ],
    cta: "ĐĂNG KÝ XÉT TUYỂN",
    color: "accent-secondary"
  }
];

export default function CoachingPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white pt-40 pb-24 overflow-hidden">
      {/* Narrative Hero Section */}
      <section className="max-w-5xl mx-auto px-6 text-center mb-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-accent-primary/5 blur-[120px] rounded-full -z-10" />
        
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black tracking-[0.4em] uppercase text-white/40 mb-10">
            <Star size={12} className="text-secondary" />
            Coaching Program // High-Ticket v1.0
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter uppercase italic italic-glow">
            Nơi Tiết Lộ <span className="text-accent-primary">Bí Mật</span> <br />
            Doanh Nghiệp <span className="text-white/40">Online</span>
          </h1>
          <p className="max-w-3xl mx-auto text-text-muted text-xl md:text-2xl font-medium leading-relaxed mb-12">
             Đừng chỉ học "kỹ thuật quay dựng". Hãy học cách biến video thành một cỗ máy in tiền và xây dựng sự nghiệp tự do thực sự.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
             <a href="#packages" className="btn-premium w-full md:w-auto">THAM GIA NGAY</a>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                <ShieldCheck size={16} className="text-accent-primary" /> Cam kết hoàn tiền 7 ngày
             </div>
          </div>
        </motion.div>
      </section>

      {/* The Origin Story */}
      <section className="max-w-4xl mx-auto px-6 mb-40">
        <div className="p-12 md:p-20 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary opacity-20" />
           <h2 className="text-3xl font-black mb-12 uppercase italic tracking-widest text-accent-primary">Hành trình thoát khỏi vòng xoáy...</h2>
           
           <div className="space-y-8 text-lg font-medium text-text-muted leading-relaxed italic">
              <p>
                 "3 năm trước, tôi cũng như bạn. Làm việc văn phòng 8-10 tiếng mỗi ngày, kiệt sức và bế tắc. Mọi thứ chỉ dừng lại khi tôi phải nhập viện vì áp lực quá tải."
              </p>
              <p>
                 "Đó là lúc tôi quyết định bỏ việc, bắt đầu lại từ con số 0 với nghề làm phim. Gia đình phản đối, bạn bè hoài nghi. Nhưng tôi tin rằng Video chính là tương lai."
              </p>
              <p>
                 "Sau nhiều năm đúc kết, tôi nhận ra sự khác biệt giữa một người làm phim nghiệp dư và một người kinh doanh bằng hình ảnh chuyên nghiệp không nằm ở chiếc máy ảnh, mà nằm ở **Tư duy chiến lược**."
              </p>
              <p className="text-white font-black text-2xl pt-6">
                 Hôm nay, tôi ở đây để giúp bạn rút ngắn hành trình đó. Không còn những sai lầm, không còn sự bấp bênh.
              </p>
           </div>
        </div>
      </section>

      {/* Strategy Hooks */}
      <section className="max-w-7xl mx-auto px-6 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: <Target className="text-accent-primary" />, title: "Chiến Lược Marketing", desc: "Xây dựng thương hiệu cá nhân để từ đó các nhãn hàng sẽ tự động tìm đến bạn." },
            { icon: <TrendingUp className="text-accent-secondary" />, title: "Định Hướng Thu Nhập", desc: "Lộ trình từ 0 đến 1000$ cho người mới và cách nhân bản số tiền đó lên hàng trăm triệu." },
            { icon: <Briefcase className="text-accent-primary" />, title: "Mô Hình Kinh Doanh", desc: "Học cách đóng gói kiến thức thành sản phẩm số để tạo nguồn thu nhập thụ động bền vững." }
          ].map((hook, i) => (
             <motion.div 
               key={i}
               whileHover={{ y: -10 }}
               className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-accent-primary/40 transition-all shadow-xl"
             >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8">{hook.icon}</div>
                <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">{hook.title}</h3>
                <p className="text-text-muted font-medium text-sm leading-relaxed">{hook.desc}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Packages */}
      <section id="packages" className="max-w-7xl mx-auto px-6 mb-40">
         <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6 italic-glow leading-none">Chương Trình <span className="text-accent-primary">Đồng Hành</span></h2>
            <p className="text-text-muted uppercase tracking-[0.4em] font-black text-[10px]">Chỉ nhận tối đa 2 học viên mỗi tháng</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {packages.map((pkg, i) => (
              <div 
                key={i}
                className={`flex flex-col p-12 md:p-16 rounded-[4rem] border relative overflow-hidden transition-all duration-700 ${
                  i === 1 ? 'bg-white text-black border-white' : 'bg-white/[0.03] border-white/10'
                }`}
              >
                 {i === 1 && (
                    <div className="absolute top-10 right-10 px-6 py-2 rounded-full bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                       HIGHT-PERFORMANCE
                    </div>
                 )}
                 
                 <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${i === 1 ? 'text-black/40' : 'text-white/40'}`}>
                    {pkg.duration}
                 </p>
                 <h3 className="text-4xl md:text-5xl font-black mb-2 italic tracking-tighter uppercase">{pkg.name}</h3>
                 <p className={`text-4xl font-black mb-12 tracking-tighter ${i === 1 ? 'text-accent-secondary' : 'text-accent-primary'}`}>{pkg.price}</p>
                 
                 <div className="space-y-6 mb-16 flex-1">
                    {pkg.features.map((f, fi) => (
                       <div key={fi} className="flex items-start gap-4">
                          <CheckCircle2 size={20} className={i === 1 ? 'text-accent-secondary shrink-0 mt-1' : 'text-accent-primary shrink-0 mt-1'} />
                          <span className={`text-sm md:text-base font-bold ${i === 1 ? 'text-black/70 italic' : 'text-text-muted italic'}`}>{f}</span>
                       </div>
                    ))}
                 </div>

                 <Link 
                   href="https://m.me/yourid" 
                   className={`w-full py-6 rounded-2xl font-black text-center tracking-widest transition-all shadow-xl uppercase text-xs ${
                     i === 1 ? 'bg-black text-white hover:bg-accent-secondary' : 'bg-white text-black hover:bg-accent-primary hover:text-white'
                   }`}
                 >
                    {pkg.cta}
                 </Link>
              </div>
            ))}
         </div>
      </section>

      {/* FAQ Final Section */}
      <section className="max-w-4xl mx-auto px-6 text-center">
         <div className="p-16 rounded-[4rem] bg-accent-primary/5 border border-accent-primary/10">
            <MessageCircle size={40} className="mx-auto mb-8 text-accent-primary" />
            <h2 className="text-3xl font-black mb-6 uppercase italic tracking-tighter">Bạn còn thắc mắc?</h2>
            <p className="text-text-muted font-medium mb-10 italic">"Học Online có hiệu quả bằng trực tiếp không? Liệu tôi có làm được không?"</p>
            <p className="text-sm font-bold leading-relaxed mb-12">
               Đừng lo lắng. Tôi đã dành hàng năm trời để kiện toàn giáo trình giúp bạn đạt hiệu quả 100% bất kể khoảng cách địa lý. Sự hỗ trợ 24/7 của tôi và team sẽ luôn ở bên bạn.
            </p>
            <Link href="/" className="text-text-muted hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
               Quay lại Trang chủ <ChevronRight size={14} />
            </Link>
         </div>
      </section>
    </main>
  );
}
