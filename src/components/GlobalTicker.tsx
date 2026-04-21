"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Info, Users, Briefcase } from "lucide-react";

export default function GlobalTicker() {
  const items = [
    { text: "GIỚI THIỆU SẢN PHẨM", icon: <Info size={12} /> },
    { text: "AI CẦN SẢN PHẨM NÀY?", icon: <Users size={12} /> },
    { text: "LIÊN HỆ HỢP TÁC", icon: <Briefcase size={12} /> },
    { text: "TANLAB DRM PROTECTION: ANTI-PIRACY TECHNOLOGY", icon: <ShieldCheck size={12} /> },
  ];

  return (
    <div className="w-full bg-slate-950 py-2 border-b border-white/5 relative z-[1000] overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-12"
        >
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
              <span className="text-accent-secondary">{item.icon}</span>
              <span>{item.text}</span>
              <span className="text-slate-800 ml-8">//</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
