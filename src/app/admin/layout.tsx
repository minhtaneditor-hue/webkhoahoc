"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase, getCurrentUser } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';
import { Logo } from '@/components/Navbar';
import { BarChart3, Users, CreditCard, Settings, Menu, X, LogOut, Database, ShoppingBag, Briefcase, ExternalLink, Loader2, TrendingUp, Star, MessageSquareQuote, HelpCircle, Clapperboard, MessageSquareHeart, Activity, ShieldCheck, Inbox, TicketPercent, CalendarCheck, MessageSquareText, Mail, Crown } from 'lucide-react';

const sidebarItems = [
  { group: 'Tổng quan', items: [
    { title: 'Bảng điều khiển', icon: BarChart3, href: '/admin' },
    { title: 'Doanh thu', icon: TrendingUp, href: '/admin/revenue' },
    { title: 'Truy cập website', icon: Activity, href: '/admin/traffic' },
  ]},
  { group: 'Bán hàng', items: [
    { title: 'Đơn hàng', icon: CreditCard, href: '/admin/orders' },
    { title: 'Mã giảm giá', icon: TicketPercent, href: '/admin/promos' },
    { title: 'Học viên', icon: Users, href: '/admin/students' },
    { title: 'Hội viên', icon: Crown, href: '/admin/members' },
    { title: 'Đặt lịch & tư vấn', icon: CalendarCheck, href: '/admin/consults' },
    { title: 'Khách tiềm năng', icon: Inbox, href: '/admin/leads' },
    { title: 'Email đã gửi', icon: Mail, href: '/admin/emails' },
  ]},
  { group: 'Khóa học', items: [
    { title: 'Khóa học & bài học', icon: Database, href: '/admin/courses' },
    { title: 'Đánh giá khóa học', icon: MessageSquareText, href: '/admin/reviews' },
    { title: 'Sản phẩm khác', icon: ShoppingBag, href: '/admin/shop' },
    { title: 'Bảo vệ video (DRM)', icon: ShieldCheck, href: '/admin/drm' },
  ]},
  { group: 'Trang chủ', items: [
    { title: 'Nội dung & liên hệ', icon: Settings, href: '/admin/settings' },
    { title: 'Học viên tiêu biểu', icon: Star, href: '/admin/testimonials' },
    { title: 'Ảnh feedback', icon: MessageSquareQuote, href: '/admin/feedback' },
    { title: 'Câu hỏi thường gặp', icon: HelpCircle, href: '/admin/faqs' },
    { title: 'Sản phẩm học viên', icon: Clapperboard, href: '/admin/student-works' },
    { title: 'Video feedback', icon: MessageSquareHeart, href: '/admin/feedback-videos' },
    { title: 'Dự án', icon: Briefcase, href: '/admin/work' },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user || !isAdmin(user.email)) {
        router.push('/auth?redirect=' + pathname);
        return;
      }
      setEmail(user.email || '');
      setIsAuthorized(true);
    }
    checkAuth();
  }, [router, pathname]);

  // Close the mobile drawer when the route changes
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-muted-foreground" aria-busy="true">
        <Loader2 size={20} className="animate-spin" aria-hidden="true" /> Đang xác thực quyền quản trị…
      </div>
    );
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href));

  const Sidebar = (
    <div className="flex flex-col h-full">
      <div className="h-16 px-5 flex items-center border-b border-white/10"><Logo light /></div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Menu quản trị">
        {sidebarItems.map((group) => (
          <div key={group.group} className="mb-6">
            <p className="px-3 mb-2 text-sm font-semibold text-stone-500">{group.group}</p>
            <ul className="space-y-1">
              {group.items.map(({ title, icon: Icon, href }) => (
                <li key={href}>
                  <Link href={href} aria-current={isActive(href) ? 'page' : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive(href) ? 'bg-white/10 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'}`}>
                    <Icon size={18} className={isActive(href) ? 'text-gold-light' : ''} aria-hidden="true" /> {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-stone-400 hover:bg-white/5 hover:text-white">
          <ExternalLink size={18} aria-hidden="true" /> Xem website
        </Link>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/'); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-stone-400 hover:bg-white/5 hover:text-white">
          <LogOut size={18} aria-hidden="true" /> Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:block w-64 shrink-0 surface-dark h-screen sticky top-0">{Sidebar}</aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[500]" role="dialog" aria-modal="true" aria-label="Menu quản trị">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 bottom-0 w-72 surface-dark animate-fade-up">
            <button onClick={() => setMobileOpen(false)} className="absolute top-2.5 right-2 w-11 h-11 flex items-center justify-center text-stone-300" aria-label="Đóng menu">
              <X size={20} aria-hidden="true" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between gap-4 bg-card border-b border-line sticky top-0 z-40">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden w-11 h-11 -ml-2 flex items-center justify-center rounded-md hover:bg-muted" aria-label="Mở menu">
            <Menu size={20} aria-hidden="true" />
          </button>
          <p className="hidden lg:block text-sm text-muted-foreground">Khu vực quản trị TẤN VA</p>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">{email}</span>
            <span className="w-9 h-9 rounded-full bg-onyx text-gold-light flex items-center justify-center font-display font-bold">{email.charAt(0).toUpperCase()}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
