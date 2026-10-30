'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { isAdmin } from '@/lib/admin';

const navLinks = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Khóa học', href: '/courses' },
  { name: 'Coaching 1:1', href: '/coaching' },
  { name: 'Về Minh Tấn', href: '/about' },
];

const communityLinks = [
  { name: 'Học viên tiêu biểu', href: '/students', icon: Users },
  { name: 'Dự án', href: '/work', icon: Briefcase },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Ebook & Preset', href: '/shop', icon: ShoppingBag },
];

// Routes with their own full-screen chrome
export const isAppShellRoute = (pathname: string | null) =>
  !!pathname && (pathname.startsWith('/admin') || pathname.startsWith('/learn'));

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 min-h-[44px]" aria-label="Minh Tấn Academy — Trang chủ">
      <span className={`w-9 h-9 rounded-md flex items-center justify-center font-display text-xl font-bold ${light ? 'bg-gold-light text-onyx' : 'bg-onyx text-gold-light'}`}>
        M
      </span>
      <span className="leading-none">
        <span className={`block font-display text-xl font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Minh Tấn</span>
        <span className={`block text-[10px] font-semibold tracking-[0.25em] uppercase ${light ? 'text-gold-light' : 'text-gold'}`}>Academy</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuTop, setMenuTop] = useState(72);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    // No backdrop-filter while the menu is open: it would trap the fixed mobile menu inside the header
    <header ref={headerRef} className={`sticky top-0 z-[100] transition-[background-color,box-shadow,border-color] duration-300 border-b ${isMenuOpen ? 'bg-ivory border-line' : isScrolled ? 'bg-ivory/95 backdrop-blur-md border-line shadow-[0_1px_2px_rgba(12,10,9,0.05)]' : 'bg-ivory border-transparent'}`}>
      <nav className="container-lux flex items-center justify-between h-[72px]" aria-label="Điều hướng chính">
        <Logo />

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`px-4 py-2.5 rounded-md text-[15px] font-medium transition-colors ${isActive(link.href) ? 'text-ink' : 'text-muted-foreground hover:text-ink'}`}
            >
              {link.name}
              {isActive(link.href) && <span className="block h-px bg-gold mt-1" aria-hidden="true" />}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              onClick={() => setIsDropdownOpen((o) => !o)}
              className="px-4 py-2.5 rounded-md text-[15px] font-medium text-muted-foreground hover:text-ink transition-colors flex items-center gap-1.5"
            >
              Cộng đồng
              <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 card p-2 shadow-[var(--shadow-lift)] animate-fade-up">
                {communityLinks.map(({ name, href, icon: Icon }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-stone hover:bg-muted hover:text-ink transition-colors">
                    <Icon size={18} className="text-gold" aria-hidden="true" /> {name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin(user.email) && (
                <Link href="/admin" className="btn btn-outline !min-h-[44px] !px-4 text-sm">
                  <ShieldCheck size={16} aria-hidden="true" /> Quản trị
                </Link>
              )}
              <Link href="/dashboard" className="btn btn-dark !min-h-[44px] !px-4 text-sm">
                <LayoutDashboard size={16} aria-hidden="true" /> Khu học tập
              </Link>
              <button onClick={handleLogout} aria-label="Đăng xuất" className="w-11 h-11 rounded-md flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-muted transition-colors">
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="px-4 py-2.5 text-[15px] font-medium text-muted-foreground hover:text-ink transition-colors">Đăng nhập</Link>
              <Link href="/courses" className="btn btn-gold !min-h-[44px] text-sm">Bắt đầu học</Link>
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
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`py-4 border-b border-line font-display text-2xl font-semibold ${isActive(link.href) ? 'text-gold' : 'text-ink'}`}>
                {link.name}
              </Link>
            ))}
            <p className="eyebrow mt-8 mb-2">Cộng đồng</p>
            {communityLinks.map(({ name, href, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 py-3 text-base font-medium text-stone">
                <Icon size={18} className="text-gold" aria-hidden="true" /> {name}
              </Link>
            ))}
            <div className="mt-8 grid gap-3">
              {user ? (
                <>
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
