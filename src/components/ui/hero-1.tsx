"use client";

import * as React from "react";
import { Paperclip, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Hero1Props {
  onClose?: () => void;
}

const Hero1 = ({ onClose }: Hero1Props) => {
  return (
    <div className="min-h-screen bg-[#0c0414] text-white flex flex-col relative overflow-hidden">
      {/* Close Button - Added for Chat Integration */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-24 z-[100] p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 text-white/50" />
        </button>
      )}

      {/* Gradient */}
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-40rem] right-[-30rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50 pointer-events-none">
        <div className="w-[10rem] h-[20rem] bg-gradient-to-r from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem] bg-gradient-to-r from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem] bg-gradient-to-r from-white to-blue-300"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-50rem] right-[-50rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50 pointer-events-none">
        <div className="w-[10rem] h-[20rem] bg-gradient-to-r from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem] bg-gradient-to-r from-white to-blue-300"></div>
        <div className="w-[10rem] h-[20rem] bg-gradient-to-r from-white to-blue-300"></div>
      </div>
      <div className="flex gap-[10rem] rotate-[-20deg] absolute top-[-60rem] right-[-60rem] z-[0] blur-[4rem] skew-[-40deg] opacity-50 pointer-events-none">
        <div className="w-[10rem] h-[30rem] bg-gradient-to-r from-white to-blue-300"></div>
        <div className="w-[10rem] h-[30rem] bg-gradient-to-r from-white to-blue-300"></div>
        <div className="w-[10rem] h-[30rem] bg-gradient-to-r from-white to-blue-300"></div>
      </div>

      <header className="flex justify-between items-center p-6 relative z-10">
        <div className="flex items-center gap-2">
          <Image src="http://hextaui.com/logo.svg" width={30} height={30} alt="Logo" />
          <div className="font-bold text-md">HextaAI</div>
        </div>
        <button 
          onClick={onClose}
          className="bg-white text-black hover:bg-gray-200 rounded-full px-4 py-2 text-sm cursor-pointer font-semibold transition-colors"
        >
          {onClose ? "Return to Learning" : "Get Started"}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1c1528] rounded-full px-4 py-2 flex items-center gap-2 w-fit mx-4">
              <span className="text-xs flex items-center gap-2">
                <span className="bg-black p-1 rounded-full">🥳</span>
                Introducing Magic Components
              </span>
            </div>
          </div>
          {/* Headline */}
          <h1 className="text-5xl font-bold leading-tight">
            Build Stunning websites effortslessly
          </h1>

          {/* Subtitle */}
          <p className="text-md opacity-70">
            HextaAI can create amazing websites with few lines of prompt.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto w-full group">
            <div className="bg-[#1c1528] border border-white/5 group-focus-within:border-purple-500/50 rounded-full p-4 flex items-center shadow-2xl transition-all">
              <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
                <Paperclip className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 rounded-full hover:bg-[#2a1f3d] transition-all">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </button>
              <input
                type="text"
                placeholder="How HextaAI can help you today?"
                className="bg-transparent flex-1 outline-none text-gray-300 pl-4 text-lg"
              />
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-12 max-w-2xl mx-auto">
            {[
              "Launch a blog with Astro",
              "Develop an app using NativeScript",
              "Build documentation with Vitepress",
              "Generate UI with shadcn",
              "Generate UI with HextaUI"
            ].map((text) => (
              <button 
                key={text}
                className="bg-[#1c1528] hover:bg-[#2a1f3d] border border-white/5 rounded-full px-4 py-2 text-xs transition-all hover:scale-105 active:scale-95"
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
