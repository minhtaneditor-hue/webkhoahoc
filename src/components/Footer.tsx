'use client';

import Link from 'next/link';
import { 
  ShieldCheck, 
  CreditCard,
  ChevronRight,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="flex flex-col gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-accent-secondary flex items-center justify-center text-white shadow-[0_10px_20px_rgba(227,38,54,0.15)]">
                <span className="font-black text-xl italic uppercase">T</span>
              </div>
              <span className="font-black tracking-tighter text-2xl uppercase text-slate-900">TANLAB</span>
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
              "Hệ thống đào tạo thực chiến hàng đầu giúp bạn xây dựng sự nghiệp tự do thông qua nội dung số và tư duy kinh doanh hiện đại."
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <FacebookIcon size={18} />, href: "https://www.facebook.com/profile.php?id=61583837884143" },
                { icon: <YoutubeIcon size={18} />, href: "https://www.youtube.com/@minhtanvideoadvisor" },
                { icon: <TikTokIcon size={18} />, href: "https://www.tiktok.com/@minhtanvideoadvisor" },
                { icon: <Mail size={18} />, href: "mailto:customer@gmail.com" }
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-accent-secondary hover:border-accent-secondary transition-all">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Academy Roadmap */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 font-mono">Hệ sinh thái</h4>
            <div className="flex flex-col gap-6">
              {[
                { name: "Khóa học thực chiến", href: "/courses" },
                { name: "Học viên tiêu biểu", href: "/students" },
                { name: "Dự án sáng tạo", href: "/work" },
                { name: "Cửa hàng Dashboard", href: "/shop" }
              ].map((link) => (
                <Link key={link.name} href={link.href} className="text-sm font-bold text-slate-500 hover:text-accent-secondary transition-colors italic flex items-center gap-2 group">
                  {link.name} <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 font-mono">Hỗ trợ & Pháp lý</h4>
            <div className="flex flex-col gap-6 font-medium">
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-3">
                 <ShieldCheck size={16} className="text-accent-secondary" /> Điều khoản dịch vụ
              </Link>
              <Link href="/refund" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-3">
                 <CreditCard size={16} className="text-accent-primary" /> Chính sách hoàn trả (7 ngày)
              </Link>
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-3">
                 <ShieldCheck size={16} className="text-slate-300" /> Chính sách bảo mật
              </Link>
            </div>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8 font-mono">Liên hệ trực tiếp</h4>
            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4">
                 <MapPin size={20} className="text-accent-secondary shrink-0" />
                 <div>
                    <p className="text-slate-900 font-bold text-sm mb-1 uppercase tracking-tighter">Địa chỉ</p>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">District 1, Ho Chi Minh City, Vietnam</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <Phone size={20} className="text-accent-primary shrink-0" />
                 <div>
                    <p className="text-slate-900 font-bold text-sm mb-1 uppercase tracking-tighter">Hotline & Zalo</p>
                    <p className="text-slate-500 text-xs font-medium">0922 255 861</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
            © {currentYear} TANLAB ACADEMY. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 italic">
                <ShieldCheck size={14} className="text-accent-primary" /> SSL SECURED
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 italic">
                <CreditCard size={14} className="text-accent-secondary" /> VNPAY VERIFIED
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  );
}

function YoutubeIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
  );
}

function TikTokIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
  );
}
