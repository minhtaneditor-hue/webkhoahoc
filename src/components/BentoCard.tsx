"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface BentoCardProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  title, 
  description, 
  className = '', 
  children, 
  icon,
  size = 'medium'
}) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 md:col-span-1 md:row-span-1',
    large: 'col-span-1 md:col-span-2 md:row-span-2'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.015, y: -5 }}
      transition={{ type: "spring", stiffness: 250, damping: 25 }}
      className={`lux-border-gold p-10 relative overflow-hidden group ${sizeClasses[size]} ${className}`}
    >
      <div className="flex flex-col h-full gap-6 relative z-10">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-14 h-14 rounded-3xl bg-accent-secondary/5 flex items-center justify-center text-accent-secondary group-hover:rotate-6 transition-transform duration-500">
              {icon}
            </div>
          )}
          <h3 className="text-2xl font-black tracking-tight text-slate-900 italic uppercase">{title}</h3>
        </div>
        
        {description && (
          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm italic">
            {description}
          </p>
        )}
        
        <div className="mt-4 flex-grow">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default BentoCard;
