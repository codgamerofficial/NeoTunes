'use client';

import React from 'react';

export interface NeoChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: 'default' | 'accent' | 'cyan' | 'tonal';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const NeoChip: React.FC<NeoChipProps> = ({
  selected = false,
  variant = 'default',
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`
        px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer 
        flex items-center gap-2 select-none border min-h-[36px]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFFF00]/50 active:scale-95
        ${
          selected
            ? variant === 'cyan'
              ? 'bg-[#00E5FF] text-black border-[#00E5FF] shadow-[0_0_14px_rgba(0,229,255,0.35)]'
              : 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_14px_rgba(223,255,0,0.35)]'
            : 'bg-[#11141A] text-[#9AA1AD] border-white/[0.06] hover:text-white hover:border-white/20 hover:bg-[#171A21]'
        }
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {selected && !icon && (
        <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0" />
      )}
      <span>{children}</span>
    </button>
  );
};

export default NeoChip;
