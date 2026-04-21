"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Hero1 } from "./ui/hero-1";

export default function AIChatAssistant() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-8 right-8 z-[9999] w-16 h-16 rounded-full bg-accent-secondary text-white shadow-2xl flex items-center justify-center cursor-pointer group"
      >
        <div className="absolute inset-0 rounded-full bg-accent-secondary animate-ping opacity-20 group-hover:hidden" />
        <MessageCircle className="w-8 h-8 relative z-10" />
      </motion.button>

      {/* Expanded Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-0 md:p-12 overflow-hidden"
          >
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-2xl"
              onClick={() => setIsExpanded(false)}
            />

            {/* Content Container */}
            <motion.div 
              className="relative w-full h-full max-w-7xl max-auto rounded-none md:rounded-[3rem] overflow-hidden border-0 md:border border-white/10 shadow-lux shadow-black/80"
              layoutId="chat-expand"
            >
              <Hero1 onClose={() => setIsExpanded(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
