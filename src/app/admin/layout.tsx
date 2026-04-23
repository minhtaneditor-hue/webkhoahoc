"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { isAdmin } from '@/lib/admin';
import { 
  BarChart3, 
  Users, 
  PlayCircle, 
  CreditCard, 
  Settings, 
  Mail, 
  TrendingUp, 
  FileText,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  ChevronRight,
  Database
} from 'lucide-react';

// ... (sidebarItems unchanged)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !isAdmin(user.email)) {
        router.push('/auth?redirect=' + pathname);
        return;
      }
      
      setIsAuthorized(true);
    }
    checkAuth();
  }, [router, pathname]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-black italic uppercase tracking-[0.5em] animate-pulse">
        Verifying Security Protocol...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-slate-950 text-white z-[100] border-r border-white/5 overflow-hidden flex flex-col"
      >
        <div className="p-8 pb-12 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-secondary flex items-center justify-center">
                <ShieldCheck size={20} className="text-white" />
              </div>
              <span className="font-black text-lg tracking-tighter italic italic-glow">TANLAB ADMIN</span>
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-accent-secondary flex items-center justify-center mx-auto">
               <ShieldCheck size={24} className="text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto no-scrollbar">
          {sidebarItems.map((group, gi) => (
            <div key={gi} className="mb-10">
              {isSidebarOpen && (
                <p className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{group.group}</p>
              )}
              <ul className="space-y-1">
                {group.items.map((item, ii) => (
                  <li key={ii}>
                    <Link 
                      href={item.href}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                        pathname === item.href 
                          ? 'bg-accent-secondary text-white shadow-lg' 
                          : 'text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {isSidebarOpen && <span className="text-sm font-bold">{item.title}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button className="w-full flex items-center gap-4 px-4 py-4 text-white/40 hover:text-red-400 transition-colors">
              <LogOut size={20} />
              {isSidebarOpen && <span className="text-sm font-bold">Đăng xuất</span>}
           </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? 280 : 80 }}
      >
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-[50]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 min-w-[300px]">
               <Search size={16} className="text-slate-300" />
               <input type="text" placeholder="Tìm kiếm nhanh..." className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-accent-secondary rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black uppercase italic tracking-tighter">Minh Tấn</p>
                  <p className="text-[10px] font-bold text-slate-300">System Admin</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img src="/asset/avatar/hero_expert.jpg" alt="admin" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="p-10 flex-1 max-w-[1600px] mx-auto w-full">
           {children}
        </div>
      </main>
    </div>
  );
}
