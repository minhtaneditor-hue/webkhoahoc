"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  Users, 
  CreditCard, 
  Settings, 
  Plus, 
  Search, 
  BarChart3,
  ChevronRight,
  Save,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Loader2,
  ShieldCheck,
  Trash2,
  Layers,
  Video,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'crm' | 'payments' | 'content'>('crm');
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: usersData } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      const { data: paymentsData } = await supabase.from('payments').select('*, users(email, full_name)').order('created_at', { ascending: false });
      const { data: coursesData } = await supabase.from('courses').select('*');
      
      if (usersData) setUsers(usersData);
      if (paymentsData) setPayments(paymentsData);
      if (coursesData) setCourses(coursesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleUpdateCourse = async (courseId: string, updates: any) => {
    setSaving(true);
    const { error } = await supabase.from('courses').update(updates).eq('id', courseId);
    if (!error) {
      alert('Cập nhật nội dung thành công!');
      // Refresh local state
      setCourses(courses.map(c => c.id === courseId ? { ...c, ...updates } : c));
    } else {
      alert('Lỗi cập nhật: ' + error.message);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin" />
        <p className="text-accent-primary font-bold tracking-widest text-xs uppercase">Initialing Admin Link...</p>
      </div>
    </div>
  );

  const handleUserAction = async (userId: string, action: 'reset' | 'remove') => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${action === 'reset' ? 'đặt lại mật khẩu về 21day12345' : 'XÓA VĨNH VIỄN'} học viên này?`)) return;
    
    setLoading(true);
    try {
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      const response = await fetch('/api/admin/user', {
        method: action === 'reset' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, requesterEmail: adminUser?.email })
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      alert(result.message);
      // Refresh list
      const { data: updatedUsers } = await supabase.from('users').select('*');
      if (updatedUsers) setUsers(updatedUsers);
    } catch (err: any) {
      alert('Lỗi: ' + err.message + '\n\nLưu ý: Bạn cần dán SERVICE_ROLE_KEY vào .env.local để tính năng này hoạt động.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex">
      {/* Sidebar: Pro CRM Layout */}
      <aside className="w-80 border-r border-white/5 bg-[#050507] p-10 flex flex-col gap-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent-secondary rounded-2xl flex items-center justify-center font-black rotate-[-10deg] shadow-lg shadow-accent-secondary/20">A</div>
          <div>
            <span className="font-black tracking-tighter text-xl block leading-none">CRM</span>
            <span className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">Commander</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <button 
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 ${activeTab === 'crm' ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-xl' : 'text-text-muted hover:bg-white/5'}`}
          >
            <Users size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Leads & Students</span>
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 ${activeTab === 'payments' ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-xl' : 'text-text-muted hover:bg-white/5'}`}
          >
            <CreditCard size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Revenues</span>
          </button>
          
          <div className="h-px bg-white/5 my-4" />
          
          <Link 
            href="/admin/courses"
            className="flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 text-text-muted hover:bg-white/5 hover:text-white"
          >
            <Layers size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Content Master</span>
          </Link>

          <Link 
            href="/admin/work"
            className="flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 text-text-muted hover:bg-white/5 hover:text-white"
          >
            <Video size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Portfolio Master</span>
          </Link>

          <Link 
            href="/admin/shop"
            className="flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 text-text-muted hover:bg-white/5 hover:text-white"
          >
            <ShoppingBag size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Asset Forge</span>
          </Link>

          <Link 
            href="/admin/settings"
            className="flex items-center gap-4 p-5 rounded-[2rem] transition-all duration-500 text-text-muted hover:bg-white/5 hover:text-white"
          >
            <ShieldCheck size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">God Mode Admin</span>
          </Link>
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5">
          <Link href="/" className="flex items-center gap-4 p-4 rounded-full bg-white/5 border border-white/10 text-text-muted hover:text-white transition-all text-[10px] font-black uppercase tracking-widest justify-center">
            <LayoutDashboard size={14} />
            Exit Command
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 italic">ADMIN CONTROL</h1>
            <p className="text-text-muted text-sm uppercase tracking-[0.2em]">Management & Performance Metrics</p>
          </div>
          <div className="flex gap-4">
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center min-w-[120px]">
                <p className="text-[10px] text-text-muted mb-1 font-bold">TOTAL USERS</p>
                <p className="text-2xl font-black">{users.length}</p>
             </div>
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center min-w-[120px]">
                <p className="text-[10px] text-accent-primary mb-1 font-bold">REVENUE</p>
                <p className="text-2xl font-black text-accent-primary">
                  {new Intl.NumberFormat('vi-VN').format(payments.reduce((acc, p) => acc + (p.status === 'SUCCESS' ? p.amount : 0), 0))}đ
                </p>
             </div>
          </div>
        </header>

        {/* Tab Content: CRM */}
        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input type="text" placeholder="Search leads by email..." className="w-full bg-transparent pl-12 pr-4 py-2 border-none focus:outline-none text-sm" />
              </div>
              <button className="btn-premium px-6 py-2 rounded-xl text-xs flex items-center gap-2">
                <Plus size={16} /> Export Data
              </button>
            </div>

            <div className="lux-border-gold rounded-3xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Student Email</th>
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Status</th>
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Joined Date</th>
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="font-bold">{u.email}</div>
                        <div className="text-[10px] text-text-muted">{u.id}</div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase">Active</span>
                      </td>
                      <td className="p-6 text-sm text-text-muted">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="p-6 text-right">
                        <button className="text-text-muted group-hover:text-accent-primary transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: Payments */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="lux-border-gold rounded-3xl overflow-hidden bg-black/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Transaction ID</th>
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Customer</th>
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Amount</th>
                    <th className="p-6 text-[10px] font-black tracking-widest text-text-muted uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-6">
                        <div className="font-mono text-xs">{p.vnp_txn_ref || 'N/A'}</div>
                        <div className="text-[10px] text-text-muted italic">{p.course_title}</div>
                      </td>
                      <td className="p-6">
                        <div className="font-bold text-sm">{p.users?.email || 'Unknown User'}</div>
                      </td>
                      <td className="p-6">
                         <div className="font-black text-accent-primary">{new Intl.NumberFormat('vi-VN').format(p.amount)}đ</div>
                      </td>
                      <td className="p-6">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${p.status === 'SUCCESS' ? 'text-green-500' : 'text-orange-500'}`}>
                          {p.status === 'SUCCESS' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {p.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Content: CMS Content Management */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courses.map((course: any) => (
              <div key={course.id} className="lux-border-gold p-8 rounded-[2rem] bg-white/[0.02]">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black italic">COURSE EDITOR</h3>
                    <div className="px-3 py-1 rounded bg-accent-primary text-black text-[10px] font-black">LIVE</div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Course Title</label>
                       <input 
                         type="text" 
                         defaultValue={course.title}
                         className="glass-input text-sm"
                         onBlur={(e) => handleUpdateCourse(course.id, { title: e.target.value })}
                       />
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tuition Fee (VNĐ)</label>
                       <input 
                         type="number" 
                         defaultValue={course.price}
                         className="glass-input text-sm !text-accent-primary font-black"
                         onBlur={(e) => handleUpdateCourse(course.id, { price: parseInt(e.target.value) })}
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Promotion Logic</label>
                       <div className="p-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-xs text-text-muted">
                          Hiện tại bạn có thể cập nhật giá trực tiếp. Hệ thống sẽ áp dụng ngay cho thanh toán VNPay.
                       </div>
                    </div>
                 </div>
              </div>
            ))}
            <button className="w-full mt-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">VIEW ALL LOGS</button>
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl p-6">
                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-2">QUICK TIPS</h4>
                <p className="text-sm text-text-muted leading-relaxed italic">"Sử dụng khóa học Free để thu hút Leads, sau đó hệ thống Automation sẽ tự động chuyển đổi họ bằng kịch bản FOMO."</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
