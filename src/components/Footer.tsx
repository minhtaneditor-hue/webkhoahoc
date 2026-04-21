'use client';

import Link from 'next/link';
import { 
  Facebook, 
  Play as Youtube, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CreditCard,
  ExternalLink
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050507] border-t border-white/5 pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand Info */}
          <div className="flex flex-col gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(227,38,54,0.3)]">
                <span className="font-black text-xl italic uppercase">MT</span>
              </div>
              <span className="font-black tracking-tighter text-xl uppercase">MINH TAN ACADEMY</span>
            </Link>
            <p className="text-text-muted text-sm font-medium leading-relaxed italic">
              "Hệ thống đào tạo thực chiến hàng đầu giúp bạn xây dựng sự nghiệp tự do thông qua nội dung số và tư duy kinh doanh hiện đại."
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: <Facebook size={18} />, href: "#" },
                { icon: <Youtube size={18} />, href: "#" },
                { icon: <Instagram size={18} />, href: "#" },
                { icon: <Mail size={18} />, href: "#" }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-accent-primary transition-all">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Academy Roadmap */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 font-mono">Academy Hub</h4>
            <div className="flex flex-col gap-6">
              {[
                { name: "Học viện Elite", href: "/academy" },
                { name: "Học viên tiêu biểu", href: "/students" },
                { name: "Showroom Dự án", href: "/work" },
                { name: "Kho tài nguyên", href: "/shop" }
              ].map((link) => (
                <Link key={link.name} href={link.href} className="text-sm font-bold text-text-muted hover:text-accent-primary transition-colors italic flex items-center gap-2 group">
                  {link.name} <ChevronRightIcon size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 font-mono">Support & Legal</h4>
            <div className="flex flex-col gap-6 font-medium">
              <Link href="/terms" className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-3">
                 <ShieldCheck size={16} className="text-accent-secondary" /> Điều khoản dịch vụ
              </Link>
              <Link href="/refund" className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-3">
                 <CreditCard size={16} className="text-accent-primary" /> Chính sách hoàn trả (7 ngày)
              </Link>
              <Link href="/privacy" className="text-sm text-text-muted hover:text-white transition-colors flex items-center gap-3">
                 <InfoIcon size={16} className="text-white/20" /> Chính sách bảo mật
              </Link>
            </div>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 font-mono">Direct Channel</h4>
            <div className="flex flex-col gap-8">
              <div className="flex items-start gap-4">
                 <MapPin size={20} className="text-accent-primary shrink-0" />
                 <div>
                    <p className="text-white font-bold text-sm mb-1 uppercase tracking-tighter">Văn phòng</p>
                    <p className="text-text-muted text-xs font-medium leading-relaxed">District 1, Ho Chi Minh City, Vietnam</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <Phone size={20} className="text-accent-secondary shrink-0" />
                 <div>
                    <p className="text-white font-bold text-sm mb-1 uppercase tracking-tighter">Hotline & Zalo</p>
                    <p className="text-text-muted text-xs font-medium">+84 (0) 900 000 000</p>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            © {currentYear} MINH TAN ACADEMY. ALL RIGHTS RESERVED. POWERED BY AGENTIC AI.
          </p>
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-[10px] font-black text-white/40 italic">
                <ShieldCheck size={14} className="text-accent-primary" /> SSL SECURED
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-white/40 italic">
                <CreditCard size={14} className="text-accent-secondary" /> VNPAY VERIFIED
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ChevronRightIcon({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

function InfoIcon({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4"/>
      <path d="M12 8h.01"/>
    </svg>
  );
}
