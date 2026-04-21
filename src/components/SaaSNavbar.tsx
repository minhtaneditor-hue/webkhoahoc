"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SaaSNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#" },
    { name: "Services", href: "#", hasChevron: true },
    { name: "Reviews", href: "#" },
    { name: "Contact us", href: "#" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent px-6 md:px-[120px] py-[16px] flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path
            d="M1.04356 6.35771L13.6437 0.666504L30.9564 6.35771V25.6423L13.6437 31.3335L1.04356 25.6423V6.35771Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M1 6.5L13.5 1L31 6.5V25.5L13.5 31L1 25.5V6.5Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="13.5" cy="16" r="4" fill="currentColor" />
        </svg>
        <span className="font-family-manrope font-bold text-white text-lg tracking-tight">Datacore</span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-8 ml-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="font-family-manrope font-medium text-[14px] text-white hover:opacity-80 transition-opacity flex items-center gap-1"
          >
            {link.name}
            {link.hasChevron && <ChevronDown size={14} />}
          </Link>
        ))}
      </div>

      {/* Desktop Actions */}
      <div className="hidden lg:flex items-center gap-4">
        <button className="bg-white border border-[#d4d4d4] rounded-[8px] px-[20px] py-[10px] text-[#171717] font-family-manrope font-semibold text-[14px] hover:bg-gray-100 transition-colors cursor-pointer">
          Sign In
        </button>
        <button className="bg-saas-primary rounded-[8px] px-[20px] py-[10px] text-[#fafafa] font-family-manrope font-semibold text-[14px] shadow-[0_4px_12px_rgba(227,38,54,0.3)] hover:opacity-90 transition-opacity cursor-pointer">
          Get Started
        </button>
      </div>

      {/* Mobile Menu Trigger */}
      <button
        className="lg:hidden text-white cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-black z-[100] flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-12">
              <span className="text-white font-bold text-2xl tracking-tighter">Datacore</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-white cursor-pointer">
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-4xl font-family-manrope font-bold text-white hover:text-saas-primary transition-colors italic"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-4">
              <button className="w-full bg-white rounded-xl p-5 text-black font-bold text-lg">Sign In</button>
              <button className="w-full bg-saas-primary rounded-xl p-5 text-white font-bold text-lg">Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
