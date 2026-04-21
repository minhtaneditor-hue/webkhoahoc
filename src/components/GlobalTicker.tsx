"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Target, Zap, Mail } from "lucide-react";

export default function GlobalTicker() {
  const items = [
    { text: "tVNDRM: Hệ sinh thái bảo mật Video Hollywood • Mô hình White-Label hạ tầng riêng • Sở hữu trọn đời", icon: <ShieldCheck size={12} /> },
    { text: "GIẢI PHÁP CHO: EdTech Đào tạo cao cấp • Doanh nghiệp sở hữu nội dung số • Tối ưu 90% chi phí vận hành", icon: <Target size={12} /> },
    { text: "CÔNG NGHỆ: AES-128 HLS • Hardware Fingerprinting • AI chống quay màn hình & can thiệp sâu", icon: <Zap size={12} /> },
    { text: "HỢP TÁC: tanlab@minhtanacademy.com - 0962255861", icon: <Mail size={12} /> },
  ];

  return (
    <div className="w-full bg-slate-950 py-2.5 border-b border-white/5 fixed top-0 left-0 z-[2000] overflow-hidden select-none">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-16"
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/80">
              <span className="text-accent-secondary">{item.icon}</span>
              <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{item.text}</span>
              <span className="text-slate-800 ml-12 opacity-50 font-light">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
