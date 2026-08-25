'use client';

import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  let variantStyles = 'bg-[#00D9FF] text-black font-extrabold shadow-[0_0_15px_rgba(0,217,255,0.3)] hover:scale-105';
  if (variant === 'secondary') {
    variantStyles = 'bg-white/10 text-white font-bold hover:bg-white/20 border border-white/15';
  } else if (variant === 'glass') {
    variantStyles = 'bg-[#090C14]/80 backdrop-blur-md text-white border border-white/10 hover:border-[#00D9FF]/40';
  } else if (variant === 'danger') {
    variantStyles = 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30';
  }

  let sizeStyles = 'px-4 py-2 text-xs rounded-full';
  if (size === 'sm') sizeStyles = 'px-3 py-1 text-[11px] rounded-full';
  if (size === 'lg') sizeStyles = 'px-6 py-3 text-sm rounded-full';

  return (
    <button
      disabled={disabled || isLoading}
      className={`font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#00D9FF] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : children}
    </button>
  );
};
