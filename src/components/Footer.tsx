'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, ShieldCheck, CreditCard, ArrowUp } from 'lucide-react';
import { Reveal } from './motion/Motion';
import { useSiteSettings } from './SiteContext';
import { contactFrom } from '@/lib/site-settings';
import { Logo, isAppShellRoute } from './Navbar';


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
  const CONTACT = contactFrom(useSiteSettings());
  if (isAppShellRoute(pathname)) return null;

  const contacts = [
    { icon: Phone, label: 'Hotline & Zalo', value: CONTACT.phone, href: CONTACT.phoneHref },
    { icon: Mail, label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { icon: MapPin, label: 'Địa chỉ', value: CONTACT.address },
  ];

  return (
    <footer className="surface-dark overflow-hidden">
      <div className="container-lux pt-16 md:pt-20">
        {/* Contact tiles */}
        <Reveal as="ul" className="grid gap-4 md:grid-cols-3" stagger={0.08}>
          {contacts.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <>
                <span className="w-12 h-12 rounded-full bg-gold-light/10 text-gold-light flex items-center justify-center shrink-0 transition-colors group-hover:bg-gold-light group-hover:text-onyx"><Icon size={20} aria-hidden="true" /></span>
                <span className="min-w-0">
                  <span className="block text-sm text-stone-400">{label}</span>
                  <span className="block font-semibold text-white break-words">{value}</span>
                </span>
              </>
            );
            return (
              <li key={label}>
                {href ? (
                  <a href={href} className="group flex items-center gap-4 p-5 rounded-[var(--radius-card)] bg-white/[0.04] ring-1 ring-white/10 hover:ring-gold-light/60 hover:bg-white/[0.07] transition">{inner}</a>
                ) : (
                  <div className="group flex items-center gap-4 p-5 rounded-[var(--radius-card)] bg-white/[0.04] ring-1 ring-white/10">{inner}</div>
                )}
              </li>
            );
          })}
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo light />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">Từ góc nhìn đến câu chuyện</p>
            <p className="mt-4 text-stone-400 text-[15px] leading-relaxed">
              Học làm video bài bản từ người làm nghề truyền hình, để mỗi video bạn quay ra đều trở thành tài sản.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                   className="w-11 h-11 rounded-full bg-white/[0.06] flex items-center justify-center text-stone-300 transition duration-300 hover:-translate-y-1 hover:bg-gold-light hover:text-onyx">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-base font-semibold text-gold-light mb-3">{col.title}</h2>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-block py-1.5 text-[15px] text-stone-300 hover:text-white transition-colors">
                      <span className="link-underline">{l.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-lux mt-14 py-8 pb-24 sm:pb-8 sm:pr-40 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-sm text-stone-400">
        <p>© {new Date().getFullYear()} TẤN VA · Minh Tấn Video Advisor. Bảo lưu mọi quyền.</p>
        <div className="flex items-center gap-5 flex-wrap">
          <span className="flex items-center gap-2"><ShieldCheck size={16} aria-hidden="true" /> Bảo mật SSL</span>
          <span className="flex items-center gap-2"><CreditCard size={16} aria-hidden="true" /> Thanh toán QR ngân hàng</span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
            className="group flex items-center gap-2 h-11 pl-4 pr-3 rounded-full bg-white/[0.06] text-stone-200 hover:bg-gold-light hover:text-onyx transition-colors"
          >
            Lên đầu trang <ArrowUp size={16} className="transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
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
