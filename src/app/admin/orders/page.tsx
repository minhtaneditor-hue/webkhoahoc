"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Banknote,
  Smartphone
} from 'lucide-react';

const mockOrders = [
  { id: "ORD-9281", user: "Trần Thành Tân", email: "tan@tanlab.vn", course: "21 Ngày Video Tài Sản", amount: "1,999,000", method: "VNPay", status: "Success", date: "21/04/2026 10:30" },
  { id: "ORD-9280", user: "Nguyễn Đăng Hạnh", email: "hanh@bakery.com", course: "Video Strategy Audit", amount: "999,000", method: "Bank Transfer", status: "Pending", date: "21/04/2026 09:15" },
  { id: "ORD-9279", user: "Lê Minh Tấn", email: "tan@academy.com", course: "Premium Coaching 1:1", amount: "12,000,000", method: "VNPay", status: "Success", date: "21/04/2026 08:45" },
  { id: "ORD-9278", user: "Phạm Gia Bảo", email: "bao@creative.vn", course: "21 Ngày Video Tài Sản", amount: "1,999,000", method: "MoMo", status: "Failed", date: "21/04/2026 07:20" },
  { id: "ORD-9277", user: "Trương Thị Như Hằng", email: "hang@food.vn", course: "21 Ngày Video Tài Sản", amount: "1,999,000", method: "Bank Transfer", status: "Success", date: "20/04/2026 18:10" },
];

export default function OrdersManagement() {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const tabs = ["Tất cả", "Thành công", "Chờ xử lý", "Thất bại"];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Quản lý bán hàng</p>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Lịch Sử <span className="text-slate-300">Giao Dịch</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-8 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <Download size={16} /> Xuất báo cáo CSV
           </button>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-8 rounded-[3rem] bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-between group">
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">Thành công (Tháng)</p>
               <p className="text-2xl font-black italic text-emerald-600">84,500,000đ</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm"><CheckCircle2 size={24} /></div>
         </div>
         <div className="p-8 rounded-[3rem] bg-amber-50 border border-amber-100 shadow-sm flex items-center justify-between group">
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 mb-1">Đang chờ xử lý</p>
               <p className="text-2xl font-black italic text-amber-600">12,200,000đ</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm"><Clock size={24} /></div>
         </div>
         <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between group">
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Tổng đơn hàng</p>
               <p className="text-2xl font-black italic text-white">1,542 đơn</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white shadow-sm"><Smartphone size={24} /></div>
         </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-xl space-y-10">
         <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
               {tabs.map(tab => (
                 <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-sm">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" placeholder="Tìm mã đơn, tên..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-0 outline-none" />
               </div>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Đơn hàng</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Khách hàng</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Hình thức</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Số tiền</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Ngày thanh toán</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Trạng thái</th>
                  </tr>
               </thead>
               <tbody>
                  {mockOrders.map((order, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-all group">
                        <td className="py-6">
                           <span className="text-xs font-black italic text-slate-900">{order.id}</span>
                           <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">{order.course}</p>
                        </td>
                        <td className="py-6">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-600 underline-accent-secondary inline-block">{order.user}</span>
                              <span className="text-[10px] font-medium text-slate-300">{order.email}</span>
                           </div>
                        </td>
                        <td className="py-6">
                           <div className="flex items-center gap-2 text-slate-400">
                              <Banknote size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{order.method}</span>
                           </div>
                        </td>
                        <td className="py-6 text-right">
                           <span className="text-sm font-black italic text-slate-900">{order.amount}đ</span>
                        </td>
                        <td className="py-6 text-right">
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{order.date}</div>
                        </td>
                        <td className="py-6 text-right">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase inline-flex items-center gap-2 shadow-sm ${
                              order.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 
                              order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                           }`}>
                              {order.status === 'Success' ? <CheckCircle2 size={10} /> : order.status === 'Pending' ? <Clock size={10} /> : <AlertCircle size={10} />}
                              {order.status}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="flex items-center justify-between pt-10 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-300 italic">Page 1 of 54</p>
            <div className="flex items-center gap-4">
               <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-all">
                  <ChevronLeft size={18} />
               </button>
               <button className="w-10 h-10 rounded-xl bg-accent-secondary text-white text-xs font-black shadow-lg">1</button>
               <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                  <ChevronRight size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
