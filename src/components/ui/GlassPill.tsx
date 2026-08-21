'use client';

import React from 'react';

interface GlassPillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function GlassPill({ active = false, children, className = '', ...props }: GlassPillProps) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer min-h-[44px] flex items-center justify-center border shrink-0 ${
        active
          ? 'bg-[#DFFF00] text-black border-[#DFFF00] font-extrabold shadow-sm'
          : 'bg-white/[0.055] text-[#A1A1A6] hover:text-white border-white/10 hover:border-white/25'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default GlassPill;
