'use client';

import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'strong' | 'yellow';
}

export function GlassCard({ children, className = '', variant = 'default', ...props }: GlassCardProps) {
  let baseStyle = 'rounded-2xl border transition-all duration-300 backdrop-blur-md ';
  
  if (variant === 'yellow') {
    baseStyle += 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_10px_30px_rgba(223,255,0,0.2)] ';
  } else if (variant === 'strong') {
    baseStyle += 'bg-white/[0.09] text-[#F5F5F7] border-white/15 hover:border-white/30 shadow-xl ';
  } else {
    baseStyle += 'bg-white/[0.055] text-[#F5F5F7] border-white/10 hover:border-white/20 shadow-lg ';
  }

  return (
    <div className={`${baseStyle} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default GlassCard;
