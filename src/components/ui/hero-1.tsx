"use client";

import * as React from "react";
import { Paperclip, Sparkles, X, MessageSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Hero1Props {
  onClose?: () => void;
}

const Hero1 = ({ onClose }: Hero1Props) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative overflow-hidden">
      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 md:right-24 z-[100] p-3 rounded-2xl bg-white border border-slate-100 hover:bg-slate-50 transition-all cursor-pointer shadow-xl"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      )}

      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-accent-secondary/5 blur-[120px] rounded-full -z-0" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-accent-primary/5 blur-[120px] rounded-full -z-0" />

      <header className="flex justify-between items-center p-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-secondary flex items-center justify-center text-white">
            <span className="font-black text-xs">T</span>
          </div>
          <div className="font-black text-lg tracking-tighter uppercase">Tanlab AI</div>
        </div>
        <button 
          onClick={onClose}
          className="bg-slate-900 text-white hover:bg-accent-secondary rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-xl"
        >
          {onClose ? "Quay lại học" : "Bắt đầu ngay"}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto space-y-10"
        >
          <div className="flex justify-center">
            <div className="bg-white border border-slate-100 shadow-xl rounded-full px-5 py-2 flex items-center gap-3 w-fit">
              <span className="text-[11px] font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest leading-none">
                <span className="bg-accent-secondary/10 p-1 rounded-full text-accent-secondary"><Zap size={12}/></span>
                Giới thiệu trợ lý Tanlab v2.0
              </span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic italic-glow">
            Kiến tạo tương lai <br />
            <span className="text-slate-300">không giới hạn</span>
          </h1>

          <p className="max-w-xl mx-auto text-slate-500 font-bold italic uppercase tracking-tight text-lg">
            Tanlab AI giúp bạn bẻ khóa mọi bài toán về Marketing Automation và Video Strategy chỉ với vài dòng lệnh.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto w-full group">
            <div className="bg-white border border-slate-100 group-focus-within:border-accent-secondary/30 rounded-3xl p-5 flex items-center shadow-2xl transition-all">
              <button className="p-3 rounded-2xl hover:bg-slate-50 transition-all text-slate-300">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Tanlab AI có thể giúp gì cho bạn hôm nay?"
                className="bg-transparent flex-1 outline-none text-slate-600 pl-4 text-lg font-medium"
              />
              <button className="p-3 rounded-2xl bg-accent-secondary text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12 max-w-2xl mx-auto">
            {[
              "Lộ trình xây kênh 21 ngày",
              "Cách viết kịch bản viral",
              "Tối ưu hóa phễu bán hàng",
              "Hệ thống Tanlab DRM",
              "Liên hệ Mentor Minh Tấn"
            ].map((text) => (
              <button 
                key={text}
                className="bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                {text}
              </button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export { Hero1 };
