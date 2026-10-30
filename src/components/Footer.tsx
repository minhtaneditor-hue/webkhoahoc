'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ShieldCheck, CreditCard } from 'lucide-react';
import { Logo, isAppShellRoute } from './Navbar';

export const CONTACT = {
  phone: '0922 255 861',
  phoneHref: 'tel:0922255861',
  zaloHref: 'https://zalo.me/0922255861',
  email: 'tanlab@minhtanacademy.com',
  address: 'Quận 1, TP. Hồ Chí Minh',
};

const columns = [
  {
    title: 'Học viện',
    links: [
      { name: 'Tất cả khóa học', href: '/courses' },
      { name: 'Coaching 1:1', href: '/coaching' },
      { name: 'Ebook & Preset', href: '/shop' },
      { name: 'Về Minh Tấn', href: '/about' },
    ],
  },
  {
    title: 'Cộng đồng',
    links: [
      { name: 'Học viên tiêu biểu', href: '/students' },
      { name: 'Dự án', href: '/work' },
      { name: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Chính sách',
    links: [
      { name: 'Điều khoản dịch vụ', href: '/terms' },
      { name: 'Hoàn tiền trong 7 ngày', href: '/refund' },
      { name: 'Bảo mật thông tin', href: '/privacy' },
    ],
  },
];

const socials = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61583837884143', icon: FacebookIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@minhtanvideoadvisor', icon: YoutubeIcon },
  { label: 'TikTok', href: 'https://www.tiktok.com/@minhtanvideoadvisor', icon: TikTokIcon },
];

export default function Footer() {
  const pathname = usePathname();
  if (isAppShellRoute(pathname)) return null;

  return (
    <footer className="surface-dark">
      <div className="container-lux pt-16 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo light />
            <p className="mt-5 text-stone-400 text-[15px] leading-relaxed">
              Học làm video bài bản từ người làm nghề truyền hình — để mỗi video bạn quay ra đều trở thành tài sản.
            </p>
            <div className="mt-6 flex gap-2">
              {socials.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                   className="w-11 h-11 rounded-md border border-white/15 flex items-center justify-center text-stone-300 hover:text-gold-light hover:border-gold-light transition-colors">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-xs font-semibold tracking-[0.18em] uppercase text-gold-light mb-4">{col.title}</h2>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-1.5 text-[15px] text-stone-300 hover:text-white transition-colors">{l.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 border-t border-white/10 pt-8 text-[15px] text-stone-300">
          <a href={CONTACT.phoneHref} className="flex items-center gap-3 hover:text-white"><Phone size={18} className="text-gold-light" aria-hidden="true" /> {CONTACT.phone} (Zalo)</a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 hover:text-white break-all"><Mail size={18} className="text-gold-light shrink-0" aria-hidden="true" /> {CONTACT.email}</a>
          <p className="flex items-center gap-3"><MapPin size={18} className="text-gold-light" aria-hidden="true" /> {CONTACT.address}</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-stone-400">
          <p>© {new Date().getFullYear()} Minh Tấn Academy. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2"><ShieldCheck size={16} aria-hidden="true" /> Bảo mật SSL</span>
            <span className="flex items-center gap-2"><CreditCard size={16} aria-hidden="true" /> Thanh toán VNPay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
}
function YoutubeIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>;
}
function TikTokIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>;
}
