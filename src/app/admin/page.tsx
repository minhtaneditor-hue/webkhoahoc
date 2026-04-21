"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  CreditCard, 
  PlayCircle, 
  TrendingUp,
  Clock,
  ExternalLink,
  ChevronRight,
  Zap,
  Flame
} from 'lucide-react';

const stats = [
  { 
    title: "Tổng Doanh Thu", 
    value: "128,400,000", 
    unit: "VNĐ",
    change: "+12.5%", 
    isUp: true,
    icon: <CreditCard className="text-emerald-500" />
  },
  { 
    title: "Học Viên Mới", 
    value: "1,240", 
    unit: "Học viên",
    change: "+8.2%", 
    isUp: true,
    icon: <Users className="text-blue-500" />
  },
  { 
    title: "Tỷ Lệ Hoàn Thành", 
    value: "68.4", 
    unit: "%",
    change: "-2.1%", 
    isUp: false,
    icon: <PlayCircle className="text-amber-500" />
  },
  { 
    title: "Lượt Xem Bài Giảng", 
    value: "15,800", 
    unit: "Lượt",
    change: "+24.0%", 
    isUp: true,
    icon: <TrendingUp className="text-purple-500" />
  }
];

const recentOrders = [
  { id: "ORD-9281", user: "Trần Thành Tân", course: "21 Ngày Video Tài Sản", amount: "1,999,000", date: "10:30 Hôm nay", status: "Hoàn tất" },
  { id: "ORD-9280", user: "Nguyễn Đăng Hạnh", course: "Video Strategy Audit", amount: "999,000", date: "09:15 Hôm nay", status: "Đang xử lý" },
  { id: "ORD-9279", user: "Lê Minh Tấn", course: "Premium Coaching 1:1", amount: "12,000,000", date: "08:45 Hôm nay", status: "Hoàn tất" },
  { id: "ORD-9278", user: "Phạm Gia Bảo", course: "21 Ngày Video Tài Sản", amount: "1,999,000", date: "Hôm qua", status: "Thất bại" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Bảng điều khiển</p>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Tổng Quan <span className="text-slate-300">Hoạt Động</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 rounded-xl bg-white border border-slate-100 flex items-center gap-3 shadow-sm">
              <Clock size={16} className="text-slate-300" />
              <span className="text-xs font-bold text-slate-500 italic">21/04/2026 - 15:00</span>
           </div>
           <button className="px-6 py-2.5 rounded-xl bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-accent-secondary/30 transition-all">Xuất báo cáo</button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl hover:shadow-2xl transition-all group"
          >
            <div className="flex items-center justify-between mb-8">
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
               </div>
               <div className={`px-3 py-1 rounded-full flex items-center gap-1 text-[9px] font-black ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {stat.change}
               </div>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">{stat.title}</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black italic tracking-tighter text-slate-900">{stat.value}</span>
                  <span className="text-[10px] font-bold text-slate-300 italic">{stat.unit}</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Recent Orders Table */}
         <div className="lg:col-span-2 bg-white rounded-[4rem] border border-slate-100 shadow-xl p-10 overflow-hidden">
            <div className="flex items-center justify-between mb-10">
               <h3 className="text-xl font-black italic uppercase tracking-tight">Giao dịch <span className="text-slate-300">Gần đây</span></h3>
               <Link href="/admin/orders" className="text-xs font-bold text-accent-secondary hover:underline flex items-center gap-2">Tất cả đơn hàng <ChevronRight size={14} /></Link>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="border-b border-slate-50">
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Đơn hàng</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Khách hàng</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Sản phẩm</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Số tiền</th>
                        <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Trạng thái</th>
                     </tr>
                  </thead>
                  <tbody>
                     {recentOrders.map((order, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                           <td className="py-6 py-6 font-bold text-slate-900 text-xs italic">{order.id}</td>
                           <td className="py-6 text-sm font-bold text-slate-500">{order.user}</td>
                           <td className="py-6 text-xs font-black uppercase italic tracking-tight text-slate-400">{order.course}</td>
                           <td className="py-6 text-right font-black italic text-slate-900 text-xs">{order.amount}đ</td>
                           <td className="py-6 text-right">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                 order.status === 'Hoàn tất' ? 'bg-emerald-50 text-emerald-600' : 
                                 order.status === 'Đang xử lý' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                              }`}>
                                 {order.status}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Hot Topics / Resources */}
         <div className="space-y-8">
            <div className="bg-slate-950 rounded-[4rem] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/20 blur-[60px]" />
               <Zap className="text-accent-secondary mb-8" size={32} />
               <h4 className="text-2xl font-black italic uppercase italic-glow mb-4">Hệ Thống <br />DRM SECURITY</h4>
               <p className="text-slate-400 text-xs font-medium leading-relaxed mb-10">Tất cả video đang được bảo mật bằng công nghệ tVNDRM. Tỷ lệ can thu độ 0%.</p>
               <button className="w-full py-4 rounded-2x bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Kiểm tra hạ tầng</button>
            </div>

            <div className="bg-white rounded-[4rem] p-10 border border-slate-100 shadow-xl">
               <h4 className="text-sm font-black uppercase italic tracking-widest mb-8">Học viên <span className="text-slate-300">Đang xem</span></h4>
               <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 p-1">
                          <img src={`https://i.pravatar.cc/100?u=watching-${i}`} className="w-full h-full object-cover rounded-lg" />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <p className="text-[10px] font-black uppercase italic text-slate-900">Student {i}</p>
                             <p className="text-[9px] font-bold text-emerald-500">Watching</p>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.random() * 80 + 20}%` }}
                               className="h-full bg-accent-secondary"
                             />
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-10 py-4 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-accent-secondary transition-colors">Xem hành trình học viên</button>
            </div>
         </div>
      </div>
    </div>
  );
}
