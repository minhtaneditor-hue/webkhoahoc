'use client';

import { Book, Shield, Gavel, UserCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white pt-48 pb-24 px-6 opacity-90 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-accent-secondary mb-8">
              <Gavel size={12} /> Legal Governance // v1.0
           </div>
           <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic italic-glow">ĐIỀU KHOẢN <span className="text-accent-secondary">DỊCH VỤ</span></h1>
           <p className="text-text-muted text-xl font-medium italic">Quy định về việc sử dụng nội dung và sở hữu trí tuệ tại Minh Tân Academy.</p>
        </header>

        <div className="space-y-12 bg-white/[0.01] border border-white/5 rounded-[4rem] p-12 md:p-20 leading-relaxed font-medium text-text-muted border-t-accent-secondary/20">
           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <Book className="text-accent-secondary" /> 1. Quyền Sở Hữu Trí Tuệ
              </h2>
              <p>
                 Toàn bộ nội dung Video, Presets, LUTs và tài liệu đính kèm đều thuộc quyền sở hữu trí tuệ của <strong>Minh Tân Academy</strong>. Học viên có quyền truy cập và học tập trọn đời nhưng KHÔNG có quyền sao chép, phân phối hoặc bán lại nội dung này dưới bất kỳ hình thức nào.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <UserCheck className="text-accent-primary" /> 2. Trách Nhiệm Học Viên
              </h2>
              <p>
                 Mỗi tài khoản được cấp quyền cho duy nhất 1 cá nhân sử dụng. Việc chia sẻ tài khoản hoặc sử dụng chung tài khoản sẽ dẫn đến việc đình chỉ truy cập vĩnh viễn mà không được hoàn trả học phí.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <Shield className="text-accent-secondary" /> 3. Giới Hạn Trách Nhiệm
              </h2>
              <p>
                 Minh Tân Academy cam kết cung cấp kiến thức thực chiến chính xác nhất tại thời điểm phát hành. Tuy nhiên, kết quả cuối cùng phụ thuộc vào sự nỗ lực và quá trình thực hành của từng học viên. Chúng tôi không đảm bảo về mức thu nhập cụ thể sau khóa học.
              </p>
           </section>

           <section className="pt-12 border-t border-white/5 text-center text-xs italic">
              Cập nhật lần cuối: Tháng 4, 2026. Mọi thay đổi về điều khoản sẽ được thông báo trực tiếp qua hệ thống.
           </section>
        </div>
      </div>
    </main>
  );
}
