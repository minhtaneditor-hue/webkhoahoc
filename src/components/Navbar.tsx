'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  ChevronDown, 
  User as UserIcon, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Users,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isAdmin } from '@/lib/admin';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [isScrolled, setIsScrolled] = useState(false);

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
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    getSession();
    fetchSettings();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Khóa học', href: '/courses' },
    { name: 'Về chúng tôi', href: '/about' },
  ];

  const communityLinks = [
    { name: 'Học viên', href: '/students', icon: <Users size={14} /> },
    { name: 'Blog', href: '/blog', icon: <BookOpen size={14} /> },
    { name: 'Dự án', href: '/work', icon: <Briefcase size={14} /> },
    { name: 'Cửa hàng', href: '/shop', icon: <ShoppingBag size={14} /> },
  ];

  return (
    <nav className={`fixed top-[37px] left-0 w-full z-[100] transition-all duration-500 ${isScrolled ? 'py-4 px-10 bg-white/80 backdrop-blur-2xl shadow-xl' : 'py-8 px-10 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-accent-secondary flex items-center justify-center text-white shadow-[0_10px_20px_rgba(227,38,54,0.2)] group-hover:scale-110 transition-transform">
             <span className="font-black text-xl italic uppercase">T</span>
          </div>
          <span className="font-black tracking-tighter text-2xl uppercase group-hover:text-accent-secondary transition-colors text-slate-900">
            {settings['branding_name'] === 'MINH TAN ACADEMY' ? 'TANLAB' : (settings['branding_name'] || 'TANLAB')}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors"
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
            <button className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2">
              Cộng đồng <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-4 w-56 bg-white border border-slate-100 rounded-2xl p-4 shadow-2xl"
                >
                  <div className="grid grid-cols-1 gap-2">
                    {communityLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        href={link.href}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                      >
                         <div className="text-slate-300 group-hover:text-accent-secondary transition-colors">{link.icon}</div>
                         <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{link.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth State */}
          <div className="flex items-center gap-6 ml-6 border-l border-slate-100 pl-10">
            {user ? (
              <div className="flex items-center gap-6">
                <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"><LayoutDashboard size={18} /></Link>
                {isAdmin(user.email) && (
                  <Link href="/admin" className="px-6 py-2 rounded-full bg-accent-secondary/5 border border-accent-secondary/10 text-[10px] font-black uppercase tracking-widest text-accent-secondary hover:bg-accent-secondary hover:text-white transition-all">Admin Hub</Link>
                )}
                <button onClick={handleLogout} className="text-slate-400 hover:text-slate-900 transition-all"><LogOut size={18} /></button>
              </div>
            ) : (
              <Link href="/auth" className="px-8 py-3 rounded-full bg-accent-secondary text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(227,38,54,0.2)] hover:shadow-[0_15px_30px_rgba(227,38,54,0.3)] hover:-translate-y-0.5 transition-all">Gia nhập</Link>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
            className="fixed inset-0 top-[120px] bg-white z-40 p-10 md:hidden overflow-y-auto"
          >
            <div className="flex flex-col gap-10">
               {navLinks.map((link) => (
                 <Link key={link.name} href={link.href} className="text-3xl font-black italic uppercase tracking-tighter text-slate-900" onClick={() => setIsMenuOpen(false)}>{link.name}</Link>
               ))}
               <div className="pt-10 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6 tracking-widest">Community Hub</p>
                  <div className="grid grid-cols-1 gap-6">
                    {communityLinks.map((link) => (
                      <Link key={link.name} href={link.href} className="text-xl font-bold italic uppercase flex items-center gap-4 text-slate-600 hover:text-slate-900" onClick={() => setIsMenuOpen(false)}>
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
