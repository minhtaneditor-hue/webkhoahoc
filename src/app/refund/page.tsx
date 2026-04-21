'use client';

import { ShieldCheck, CreditCard, Clock, MessageSquare } from 'lucide-react';

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white pt-48 pb-24 px-6 uppercase-titles">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-accent-primary mb-8">
              <ShieldCheck size={12} /> Legal Compliance // v1.0
           </div>
           <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic italic-glow">CHÍNH SÁCH <span className="text-accent-primary">HOÀN TRẢ</span></h1>
           <p className="text-text-muted text-xl font-medium italic">Cam kết bảo vệ quyền lợi học viên tại Minh Tân Academy.</p>
        </header>

        <div className="space-y-12 bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-20 leading-relaxed font-medium text-text-muted">
           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <Clock className="text-accent-primary" /> 1. Cam kết 7 Ngày Thử Thách
              </h2>
              <p>
                 Chúng tôi tin tưởng tuyệt đối vào chất lượng nội dung đào tạo. Nếu trong vòng <strong>7 ngày</strong> kể từ ngày đăng ký, bạn cảm thấy nội dung không phù hợp với nhu cầu, bạn có quyền yêu cầu hoàn phí 100% không lý do (áp dụng cho các khóa học Online bán lẻ).
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <ShieldCheck className="text-accent-secondary" /> 2. Điều Kiện Áp Dụng
              </h2>
              <ul className="list-disc pl-6 space-y-4">
                 <li>Học viên chưa hoàn thành quá 20% thời lượng khóa học.</li>
                 <li>Chương trình không áp dụng cho các gói Coaching 1:1 hoặc các buổi tư vấn trực tiếp đã thực hiện.</li>
                 <li>Yêu cầu hoàn trả được gửi qua email chính thức hoặc cổng hỗ trợ trong thời hạn quy định.</li>
              </ul>
           </section>

           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <CreditCard className="text-accent-primary" /> 3. Quy Trình Hoàn Tiền
              </h2>
              <p>
                 Sau khi nhận được yêu cầu hợp lệ, đội ngũ tài chính của chúng tôi sẽ xử lý lệnh hoàn trả trong vòng <strong>3-5 ngày làm việc</strong>. Tiền sẽ được hoàn về đúng tài khoản hoặc phương thức thanh toán mà bạn đã sử dụng để giao dịch trước đó.
              </p>
           </section>

           <section className="pt-12 border-t border-white/5 text-center">
              <p className="mb-8 italic">Mọi thắc mắc vui lòng liên hệ đội ngũ hỗ trợ Mentor:</p>
              <a href="mailto:support@minhtan.academy" className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all">
                 <MessageSquare size={18} /> GỬI YÊU CẦU HỖ TRỢ
              </a>
           </section>
        </div>
      </div>
    </main>
  );
}
