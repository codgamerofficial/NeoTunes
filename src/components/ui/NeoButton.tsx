'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'ghost' 
    | 'danger' 
    | 'lime' 
    | 'cyan' 
    | 'outline' 
    | 'glass' 
    | 'brutalist' 
    | 'brutalist-cyan';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold rounded-full transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFFF00]/50';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5 font-bold',
    md: 'text-xs sm:text-sm px-5 py-2.5 min-h-[44px] gap-2 font-bold',
    lg: 'text-sm sm:text-base px-6 py-3.5 min-h-[50px] gap-2.5 font-extrabold',
    icon: 'p-2.5 min-h-[44px] min-w-[44px]',
  };

  const variantStyles = {
    primary: 'bg-[#DFFF00] text-black hover:bg-[#E8FF33] hover:shadow-[0_0_20px_rgba(223,255,0,0.35)] shadow-md',
    lime: 'bg-[#DFFF00] text-black hover:bg-[#E8FF33] hover:shadow-[0_0_20px_rgba(223,255,0,0.35)] shadow-md',
    cyan: 'bg-[#00E5FF] text-black hover:bg-[#33EAFF] hover:shadow-[0_0_20px_rgba(0,229,255,0.35)] shadow-md',
    secondary: 'bg-[#171A21] text-[#F5F7FA] border border-white/10 hover:border-white/25 hover:bg-[#1E222B]',
    outline: 'bg-transparent text-[#F5F7FA] border border-white/20 hover:border-white/40 hover:bg-white/5',
    ghost: 'bg-transparent text-[#9AA1AD] hover:text-[#F5F7FA] hover:bg-white/5',
    glass: 'bg-[#11141A]/75 backdrop-blur-xl text-[#F5F7FA] border border-white/10 hover:border-white/20 hover:bg-[#171A21]/90',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20',
    brutalist: 'bg-[#DFFF00] text-black border-2 border-black shadow-[3px_3px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px]',
    'brutalist-cyan': 'bg-[#00E5FF] text-black border-2 border-black shadow-[3px_3px_0px_#FFFFFF] hover:shadow-[1px_1px_0px_#FFFFFF] hover:translate-x-[2px] hover:translate-y-[2px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default NeoButton;
