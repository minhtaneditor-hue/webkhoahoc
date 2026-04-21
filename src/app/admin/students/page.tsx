"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  UserPlus, 
  Mail, 
  Flag,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';

const mockStudents = [
  { id: "STU-001", name: "Trần Thành Tân", email: "tan@tanlab.vn", status: "Enrolled", progress: 85, source: "Facebook", funnel: "Loyal", date: "21/04/2026" },
  { id: "STU-002", name: "Nguyễn Đăng Hạnh", email: "hanh@bakery.com", status: "Enrolled", progress: 42, source: "Youtube", funnel: "Active", date: "20/04/2026" },
  { id: "STU-003", name: "Lê Minh Tấn", email: "tan@academy.com", status: "Active", progress: 100, source: "Direct", funnel: "Elite", date: "19/04/2026" },
  { id: "STU-004", name: "Phạm Gia Bảo", email: "bao@creative.vn", status: "Lead", progress: 0, source: "TikTok", funnel: "Hot", date: "21/04/2026" },
  { id: "STU-005", name: "Trương Thị Như Hằng", email: "hang@food.vn", status: "Enrolled", progress: 15, source: "Facebook", funnel: "Active", date: "18/04/2026" },
];

export default function StudentsManagement() {
  const [activeTab, setActiveTab] = useState("Tất cả");

  const tabs = ["Tất cả", "Đang học", "Tiềm năng", "Hoàn thành"];

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Học viên</p>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Quản Lý <span className="text-slate-300">Tri Thức</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-6 py-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
              <Download size={16} /> Xuất dữ liệu
           </button>
           <button className="px-8 py-2.5 rounded-xl bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-accent-secondary/30 transition-all flex items-center gap-2">
              <UserPlus size={16} /> Thêm học viên
           </button>
        </div>
      </header>

      {/* Filters & Tabs */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
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

            <div className="flex items-center gap-4 flex-1 max-w-md">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input type="text" placeholder="Tìm kiếm tên, email, số điện thoại..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-0 outline-none" />
               </div>
               <button className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                  <Filter size={18} />
               </button>
            </div>
         </div>

         {/* Students Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="border-b border-slate-50">
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Học viên</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Funnel Status</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Tiến độ xem</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300">Nguồn</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Ngày tham gia</th>
                     <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-300 text-right">Thao tác</th>
                  </tr>
               </thead>
               <tbody>
                  {mockStudents.map((student, i) => (
                     <tr key={i} className="hover:bg-slate-50 transition-all group">
                        <td className="py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group-hover:scale-105 transition-transform">
                                 <img src={`https://i.pravatar.cc/100?u=${student.email}`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-900 text-sm italic underline-accent transition-all group-hover:text-accent-secondary">{student.name}</h4>
                                 <p className="text-[10px] font-medium text-slate-400">{student.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-2 w-fit ${
                              student.funnel === 'Elite' ? 'bg-indigo-50 text-indigo-600' :
                              student.funnel === 'Loyal' ? 'bg-emerald-50 text-emerald-600' :
                              student.funnel === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                           }`}>
                              <TrendingUp size={10} /> {student.funnel}
                           </span>
                        </td>
                        <td className="py-6 max-w-[200px]">
                           <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${student.progress}%` }}
                                    className={`h-full ${student.progress === 100 ? 'bg-emerald-500' : 'bg-accent-secondary'}`}
                                 />
                              </div>
                              <span className="text-[10px] font-black italic">{student.progress}%</span>
                           </div>
                        </td>
                        <td className="py-6">
                           <div className="flex items-center gap-2 text-slate-400">
                              <MapPin size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{student.source}</span>
                           </div>
                        </td>
                        <td className="py-6 text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-xs font-bold text-slate-500">{student.date}</span>
                              <span className="text-[9px] font-medium text-slate-300">14:24 PM</span>
                           </div>
                        </td>
                        <td className="py-6 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-accent-secondary transition-all">
                                 <Eye size={18} />
                              </button>
                              <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">
                                 <Mail size={18} />
                              </button>
                              <button className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                                 <Flag size={18} />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         <div className="flex items-center justify-between pt-10 border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-300">Hiển thị 1 - 5 trong số 1,240 học viên</p>
            <div className="flex items-center gap-4">
               <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:bg-slate-50 transition-all disabled:opacity-30">
                  <ChevronLeft size={18} />
               </button>
               <div className="flex items-center gap-2">
                  <span className="w-10 h-10 rounded-xl bg-accent-secondary flex items-center justify-center text-white text-xs font-black shadow-lg">1</span>
                  <span className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer">2</span>
                  <span className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 text-xs font-bold cursor-pointer">3</span>
               </div>
               <button className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                  <ChevronRight size={18} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
