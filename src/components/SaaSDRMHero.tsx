"use client";

import { motion } from "framer-motion";

export default function SaaSDRMHero() {
  const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260210_031346_d87182fb-b0af-4273-84d1-c6fd17d6bf0f.mp4";

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-32 max-w-7xl mx-auto">
        {/* Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-saas-bg-pill backdrop-blur-md border border-saas-border-pill rounded-[10px] h-[38px] px-[6px] flex items-center gap-[10px] mb-8"
        >
          <span className="bg-saas-primary text-white text-[12px] font-family-cabin font-bold px-[8px] py-[2px] rounded-[6px] uppercase tracking-tighter shadow-lg shadow-saas-primary/20">
            Mới
          </span>
          <span className="text-white font-family-cabin font-medium text-[14px]">
            Khám phá Datacore v3.2 - Hệ thống bảo mật tối tân
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-family-instrument text-white text-5xl md:text-[96px] leading-[1.1] mb-8 tracking-tight italic"
        >
          Bảo mật tài sản <br className="hidden md:block" />
          <span className="text-saas-accent px-2 not-italic">toàn diện</span> và tức thì
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-family-inter text-white text-[18px] max-w-[662px] mb-12 leading-relaxed font-medium"
        >
          Giải pháp bảo vệ video, khóa học và tài sản số hàng đầu. 
          Chống quay màn hình, phân phối nội dung an toàn với công nghệ DRM chuẩn quốc tế.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="bg-saas-primary hover:bg-[#ff1a1a] rounded-[10px] px-[32px] py-[16px] text-white font-family-cabin font-bold text-[16px] transition-all cursor-pointer shadow-xl shadow-saas-primary/30 uppercase tracking-widest">
            Trải nghiệm ngay
          </button>
          <button className="bg-saas-secondary hover:bg-[#2a2a2a] rounded-[10px] px-[32px] py-[16px] text-white font-family-cabin font-bold text-[16px] transition-all cursor-pointer border border-white/20 uppercase tracking-widest">
            Xem bản Demo
          </button>
        </motion.div>
      </div>
    </div>
  );
}
