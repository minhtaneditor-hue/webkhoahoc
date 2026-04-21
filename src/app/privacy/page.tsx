'use client';

import { Lock, Eye, Server, ShieldAlert } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white pt-48 pb-24 px-6 opacity-95">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-accent-primary mb-8">
              <Lock size={12} /> Data Protection // v1.0
           </div>
           <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter italic italic-glow">CHÍNH SÁCH <span className="text-accent-primary">BẢO MẬT</span></h1>
           <p className="text-text-muted text-xl font-medium italic">Cam kết an toàn thông tin tuyệt đối cho học viên.</p>
        </header>

        <div className="space-y-12 bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 md:p-20 leading-relaxed font-medium text-text-muted">
           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <Eye className="text-accent-primary" /> 1. Thu Thập Thông Tin
              </h2>
              <p>
                 Chúng tôi chỉ thu thập những thông tin cần thiết nhất để phục vụ quá trình học tập của bạn, bao gồm: Tên, Email, và thông tin liên hệ. Các dữ liệu này giúp chúng tôi cá nhân hóa trải nghiệm học tập và hỗ trợ bạn kịp thời nhất.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <Server className="text-accent-secondary" /> 2. Lưu Trữ & Bảo Mật
              </h2>
              <p>
                 Dữ liệu của bạn được lưu trữ trên hệ thống máy chủ mã hóa của Supabase, đảm bảo tiêu chuẩn an ninh mạng quốc tế. Chúng tôi cam kết KHÔNG bán hoặc chia sẻ thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích quảng cáo.
              </p>
           </section>

           <section>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-4">
                 <ShieldAlert className="text-accent-primary" /> 3. An Toàn Thanh Toán
              </h2>
              <p>
                 Mọi giao dịch tài chính tại Minh Tân Academy đều được xử lý qua các cổng thanh toán trung gian uy tín (VNPay, SePay). Chúng tôi không lưu trữ thông tin thẻ tín dụng của bạn trên hệ thống riêng, đảm bảo an toàn tuyệt đối trước các nguy cơ tấn công mạng.
              </p>
           </section>

           <section className="pt-12 border-t border-white/5 text-center text-xs">
              Mọi thắc mắc về quyền riêng tư, vui lòng liên hệ Ban Quản Trị qua địa chỉ hỗ trợ chính thức.
           </section>
        </div>
      </div>
    </main>
  );
}
