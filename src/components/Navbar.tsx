'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BrandMark from './BrandMark';
import { usePathname } from 'next/navigation';
import { supabase, getCurrentUser } from '@/utils/supabase';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserRound,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { isAdmin } from '@/lib/admin';

// Top-level items. Courses and coaching sit under "Khóa học"; ebooks, presets and skills are
// "Sản phẩm khác" right after "Dự án". The logo links home; Blog stays in the footer.
const productLinks = [
  { name: 'Khóa học online', desc: 'Học theo lộ trình, truy cập trọn đời', href: '/courses', icon: GraduationCap },
  { name: 'Coaching 1:1', desc: 'Đồng hành riêng cùng Minh Tấn', href: '/coaching', icon: UserRound },
];

const navLinks = [
  { name: 'Học viên', href: '/students' },
  { name: 'Dự án', href: '/work' },
  { name: 'Sản phẩm khác', href: '/shop' },
];

// Routes with their own full-screen chrome
export const isAppShellRoute = (pathname: string | null) =>
  !!pathname && (pathname.startsWith('/admin') || pathname.startsWith('/learn'));

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 min-h-[44px]" aria-label="TẤN VA — Trang chủ">
      <BrandMark size={38} className="transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110 group-hover:-rotate-[6deg]" />
      <span className="font-sans text-[1.35rem] font-extrabold tracking-tight leading-none">
        <span className={light ? 'text-white' : 'text-ink'}>TẤN</span> <span className={light ? 'text-gold-light' : 'text-gold'}>VA</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ full_name?: string | null; avatar_url?: string | null } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const [menuTop, setMenuTop] = useState(72);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    // The navbar stays mounted across pages: signing in or out must update it without a reload
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    let lastY = window.scrollY;
    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setIsScrolled(y > 8);
        // Hide while reading down the page, come back as soon as the visitor scrolls up
        if (Math.abs(y - lastY) > 6) setIsHidden(y > lastY && y > 240);
        lastY = y;
        // Gold reading-progress bar
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      });
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', handleScroll); cancelAnimationFrame(frame); };
  }, []);

  // Photo and name beside the logout button; ProfileForm announces its saves so they change at once
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const load = () => supabase.from('users').select('full_name, avatar_url').eq('id', userId).maybeSingle().then(({ data }) => setProfile(data));
    load();
    window.addEventListener('profile-updated', load);
    return () => window.removeEventListener('profile-updated', load);
  }, [userId]);
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatar = (size: string) => (
    <span className={`${size} shrink-0 rounded-full overflow-hidden bg-gold-soft text-gold flex items-center justify-center font-bold`}>
      {profile?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- the student's own uploaded photo
        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover !rounded-none" />
      ) : displayName.charAt(0).toUpperCase()}
    </span>
  );

  // Close menus on navigation (adjusting state during render, as React recommends), outside click and Escape
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsDropdownOpen(false); setIsMenuOpen(false); }
    };
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    // The fixed menu starts right under the header, wherever the header currently sits
    if (isMenuOpen && headerRef.current) setMenuTop(headerRef.current.getBoundingClientRect().bottom);
  }, [isMenuOpen]);

  if (isAppShellRoute(pathname)) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.assign('/');
  };

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));
  const productActive = productLinks.some((l) => isActive(l.href));

  return (
    // While the mobile menu is open the header must have no backdrop-filter and no translate:
    // either one would make the header the containing block and trap the fixed menu inside it
    <header ref={headerRef} className={`sticky top-0 z-[100] transition-[background-color,box-shadow,border-color,translate] duration-500 ease-[cubic-bezier(.22,1,.36,1)] border-b ${isHidden && !isMenuOpen && !isDropdownOpen ? '-translate-y-full' : ''} ${isMenuOpen ? 'bg-ivory border-line' : isScrolled ? 'bg-ivory/95 backdrop-blur-md border-line shadow-[0_8px_24px_-16px_rgba(12,10,9,0.25)]' : 'bg-ivory border-transparent'}`}>
      <div ref={progressRef} aria-hidden="true" className="absolute left-0 right-0 -bottom-px h-[2px] bg-gradient-to-r from-gold via-gold-light to-gold origin-left scale-x-0" />
      <nav className="container-lux flex items-center justify-between gap-4 h-[72px] whitespace-nowrap" aria-label="Điều hướng chính">
        <Logo />

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              onClick={() => setIsDropdownOpen((o) => !o)}
              className={`px-4 py-2.5 rounded-md text-[15px] font-medium transition-colors flex items-center gap-1.5 ${productActive ? 'text-ink' : 'text-muted-foreground hover:text-ink'}`}
            >
              <span className="link-underline" data-active={productActive || undefined}>Khóa học</span>
              <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 card p-2 shadow-[var(--shadow-lift)] animate-fade-up">
                {productLinks.map(({ name, desc, href, icon: Icon }) => (
                  <Link key={href} href={href} className="group flex items-start gap-3 p-3 rounded-md hover:bg-muted transition-colors">
                    <span className="w-10 h-10 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0 transition-colors group-hover:bg-gold group-hover:text-white"><Icon size={18} aria-hidden="true" /></span>
                    <span>
                      <span className="block text-sm font-semibold text-ink">{name}</span>
                      <span className="block text-sm text-muted-foreground">{desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`group px-4 py-2.5 rounded-md text-[15px] font-medium transition-colors ${isActive(link.href) ? 'text-ink' : 'text-muted-foreground hover:text-ink'}`}
            >
              <span className="link-underline" data-active={isActive(link.href) || undefined}>{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
          {user ? (
            <>
              {isAdmin(user.email) && (
                <Link href="/admin" className="btn btn-outline !min-h-[44px] !px-4 text-sm">
                  <ShieldCheck size={16} aria-hidden="true" className="hidden xl:block" /> Quản trị
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-dark !min-h-[44px] !px-4 text-sm">
                <LayoutDashboard size={16} aria-hidden="true" className="hidden xl:block" /> Khu học tập
              </Link>
              <Link href="/dashboard#ho-so" className="flex items-center gap-2 min-h-[44px] pl-1 pr-2 rounded-md hover:bg-muted transition-colors" aria-label={`Hồ sơ của ${displayName}`}>
                {avatar('w-9 h-9')}
                <span className="hidden xl:inline max-w-[9rem] truncate text-sm font-semibold text-ink">{displayName}</span>
              </Link>
              <button onClick={handleLogout} aria-label="Đăng xuất" className="w-11 h-11 rounded-md flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-muted transition-colors">
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="px-4 py-2.5 text-[15px] font-medium text-muted-foreground hover:text-ink transition-colors">Đăng nhập</Link>
              <Link href="/courses" className="btn btn-gold !min-h-[44px] text-sm">Bắt đầu học <ArrowRight size={16} aria-hidden="true" /></Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden w-11 h-11 -mr-2 flex items-center justify-center rounded-md text-ink hover:bg-muted"
          onClick={() => setIsMenuOpen((o) => !o)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="mobile-menu" style={{ top: menuTop }} className="lg:hidden fixed inset-x-0 bottom-0 bg-ivory overflow-y-auto border-t border-line animate-fade-up">
          <div className="container-lux py-6 flex flex-col">
            <p className="eyebrow mb-1 animate-fade-up">Khóa học</p>
            {productLinks.map(({ name, desc, href, icon: Icon }, i) => (
              <Link key={href} href={href} style={{ animationDelay: `${60 + i * 50}ms` }} className="animate-fade-up flex items-center gap-4 py-3">
                <span className="w-11 h-11 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0"><Icon size={20} aria-hidden="true" /></span>
                <span>
                  <span className={`block text-lg font-semibold ${isActive(href) ? 'text-gold' : 'text-ink'}`}>{name}</span>
                  <span className="block text-sm text-muted-foreground">{desc}</span>
                </span>
              </Link>
            ))}
            <div className="mt-6">
              {navLinks.map((link, i) => (
                <Link key={link.href} href={link.href} style={{ animationDelay: `${220 + i * 60}ms` }} className={`animate-fade-up block py-3 font-display text-3xl font-bold ${isActive(link.href) ? 'text-gold' : 'text-ink'}`}>
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-8 grid gap-3">
              {user ? (
                <>
                  <Link href="/dashboard#ho-so" className="flex items-center gap-3 min-w-0 py-1">
                    {avatar('w-11 h-11')}
                    <span className="min-w-0 truncate font-semibold text-ink">{displayName}</span>
                  </Link>
                  <Link href="/dashboard" className="btn btn-dark w-full">Khu học tập</Link>
                  {isAdmin(user.email) && <Link href="/admin" className="btn btn-outline w-full">Quản trị</Link>}
                  <button onClick={handleLogout} className="btn btn-outline w-full">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link href="/courses" className="btn btn-gold w-full">Bắt đầu học</Link>
                  <Link href="/auth" className="btn btn-outline w-full">Đăng nhập</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
