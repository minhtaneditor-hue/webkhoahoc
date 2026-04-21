'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  ChevronDown, 
  User, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin } from '@/lib/admin';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      const s = data?.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.value }), {});
      setSettings(s || {});
    }
    getSession();
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Academy', href: '/academy' },
    { name: 'Học viên', href: '/students' },
  ];

  const communityLinks = [
    { name: 'Blog', href: '/blog', icon: <BookOpen size={14} /> },
    { name: 'Dự án', href: '/work', icon: <Briefcase size={14} /> },
    { name: 'Cửa hàng', href: '/shop', icon: <ShoppingBag size={14} /> },
    { name: 'Về chúng tôi', href: '/about', icon: <Info size={14} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 py-6 px-10">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center text-white shadow-[0_0_20px_rgba(227,38,54,0.4)] group-hover:scale-110 transition-transform">
             <span className="font-black text-xl italic">MT</span>
          </div>
          <span className="font-black tracking-tighter text-xl uppercase group-hover:text-accent-primary transition-colors">
            {settings['branding_name'] || 'MINH TAN ACADEMY'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Community Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors flex items-center gap-2">
              Cộng đồng <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-4 w-56 bg-[#121214] border border-white/5 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
                >
                  <div className="grid grid-cols-1 gap-2">
                    {communityLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        href={link.href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                      >
                         <div className="text-white/20 group-hover:text-accent-primary transition-colors">{link.icon}</div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted group-hover:text-white">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth State */}
          <div className="flex items-center gap-6 ml-6 border-l border-white/10 pl-10">
            {user ? (
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-white/5 text-white/60 hover:text-white transition-all"><LayoutDashboard size={18} /></Link>
                {isAdmin(user.email) && (
                  <Link href="/admin" className="px-6 py-2 rounded-full bg-accent-primary/10 border border-accent-secondary/40 text-[10px] font-black uppercase tracking-widest text-accent-secondary">Admin</Link>
                )}
                <button onClick={handleLogout} className="text-white/40 hover:text-white transition-all"><LogOut size={18} /></button>
              </div>
            ) : (
              <Link href="/auth" className="px-8 py-3 rounded-full bg-accent-primary text-black text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(227,38,54,0.4)] transition-all">Gia nhập</Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed inset-0 top-[88px] bg-black z-40 p-10 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-10">
               {navLinks.map((link) => (
                 <Link key={link.name} href={link.href} className="text-3xl font-black italic uppercase tracking-tighter" onClick={() => setIsMenuOpen(false)}>{link.name}</Link>
               ))}
               <div className="pt-10 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6 font-mono tracking-widest">Community Hub</p>
                  <div className="grid grid-cols-1 gap-6">
                    {communityLinks.map((link) => (
                      <Link key={link.name} href={link.href} className="text-xl font-bold italic uppercase flex items-center gap-4" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-accent-secondary">{link.icon}</span> {link.name}
                      </Link>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
