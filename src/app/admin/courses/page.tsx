"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Plus, 
  Search, 
  Settings, 
  PlayCircle, 
  Layers, 
  ChevronRight, 
  MoreVertical, 
  Eye, 
  Video, 
  Globe, 
  DollarSign,
  GripVertical,
  CheckCircle2,
  Users
} from 'lucide-react';

const mockCourses = [
  { 
    id: "c1", 
    title: "21 Ngày Biến Video Thành Tài Sản", 
    slug: "21-ngay-video-tai-san",
    price: "1,999,000", 
    students: 1240, 
    chapters: 5, 
    lessons: 21,
    status: "Published",
    thumbnail: "/asset/hoc_vien/tan.jpg"
  },
  { 
    id: "c2", 
    title: "Video Strategy Audit", 
    slug: "video-strategy-audit",
    price: "0 (Consulting)", 
    students: 450, 
    chapters: 1, 
    lessons: 3,
    status: "Published",
    thumbnail: "/asset/du_an_tieu_bieu/project_nhth.jpg"
  },
  { 
    id: "c3", 
    title: "Quy Trình Sản Xuất Truyền Hình", 
    slug: "production-process",
    price: "9,999,000", 
    students: 85, 
    chapters: 12, 
    lessons: 48,
    status: "Draft",
    thumbnail: "/asset/du_an_tieu_bieu/project_2n1d.webp"
  }
];

export default function CourseManagement() {
  const [activeTab, setActiveTab] = useState("Tất cả");

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-2">Quản lý nội dung</p>
           <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Kiến Trúc <span className="text-slate-300">Khóa Học</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="px-8 py-2.5 rounded-xl bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:shadow-accent-secondary/30 transition-all flex items-center gap-2">
              <Plus size={16} /> Tạo khóa học mới
           </button>
        </div>
      </header>

      {/* Course List Grid */}
      <div className="grid grid-cols-1 gap-8">
        {mockCourses.map((course, i) => (
          <motion.div 
            key={course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col lg:flex-row group"
          >
            {/* Thumbnail Area */}
            <div className="lg:w-80 h-60 relative overflow-hidden shrink-0">
               <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
               <div className="absolute top-6 left-6 flex gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl border border-white/20 backdrop-blur-md ${
                     course.status === 'Published' ? 'bg-emerald-500/80 text-white' : 'bg-slate-500/80 text-white'
                  }`}>
                    {course.status === 'Published' ? <div className="flex items-center gap-2"><Globe size={10} /> Public</div> : 'Draft'}
                  </span>
               </div>
               <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 flex flex-col">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-2 group-hover:text-accent-secondary transition-colors underline-accent">{course.title}</h3>
                     <div className="flex items-center gap-4 text-slate-300 font-mono text-[10px] tracking-widest">
                        <span className="flex items-center gap-1"><Layers size={12} /> {course.chapters} CHƯƠNG</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><PlayCircle size={12} /> {course.lessons} BÀI GIẢNG</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-accent-secondary transition-all"><Settings size={18} /></button>
                     <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"><MoreVertical size={18} /></button>
                  </div>
               </div>

               <div className="mt-auto flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-slate-50">
                  <div className="flex items-center gap-10">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Doanh thu / Giá</span>
                        <span className="text-sm font-black italic tracking-tighter text-slate-900">{course.price}đ</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 mb-1">Học viên</span>
                        <div className="flex items-center gap-2">
                           <Users size={14} className="text-slate-300" />
                           <span className="text-sm font-black italic tracking-tighter text-slate-900">{course.students}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     <button className="px-6 py-3 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                        <Video size={14} /> Chỉnh sửa Video
                     </button>
                     <Link href={`/courses/${course.id}`} className="px-6 py-3 rounded-xl bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-accent-secondary/30 transition-all flex items-center gap-2">
                        Chi tiết bài giảng <ChevronRight size={14} />
                     </Link>
                  </div>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Global Course Settings (Stub) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
         <div className="bg-slate-950 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 blur-[100px] pointer-events-none" />
            <Globe size={40} className="text-accent-secondary mb-10" />
            <h4 className="text-2xl font-black italic uppercase italic-glow mb-6">CẤU HÌNH SEO <br /> & ĐỊNH DANH</h4>
            <div className="space-y-6">
               <div className="flex items-center gap-4 text-xs font-bold text-slate-400 italic">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Tự động tạo Slug theo Title
               </div>
               <div className="flex items-center gap-4 text-xs font-bold text-slate-400 italic">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Meta description tối ưu AI
               </div>
               <div className="flex items-center gap-4 text-xs font-bold text-slate-400 italic">
                  <CheckCircle2 size={16} className="text-emerald-500" /> Schema markup Course/FAQ
               </div>
            </div>
            <button className="mt-12 w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Quản lý SEO toàn trang</button>
         </div>

         <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl flex flex-col">
            <DollarSign size={40} className="text-accent-secondary mb-10" />
            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-6 text-slate-900">CHỈNH SỬA <br /> BẢNG GIÁ NHANH</h4>
            <div className="flex-1 space-y-6">
               {mockCourses.map(c => (
                 <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black uppercase truncate max-w-[200px]">{c.title}</span>
                    <input type="text" defaultValue={c.price} className="w-24 text-right bg-transparent text-xs font-black italic outline-none text-slate-900" />
                 </div>
               ))}
            </div>
            <button className="mt-12 w-full py-5 rounded-2xl bg-accent-secondary text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:shadow-accent-secondary/30 transition-all">Cập nhật bảng giá</button>
         </div>
      </div>
    </div>
  );
}
