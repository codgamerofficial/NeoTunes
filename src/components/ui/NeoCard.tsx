'use client';

import React from 'react';

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  glass = true,
  interactive = false,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = glass
    ? 'bg-[#090C14]/80 backdrop-blur-xl border border-white/10 shadow-2xl'
    : 'bg-[#090C14] border border-white/10 shadow-xl';

  const interactiveStyles = interactive
    ? 'hover:border-[#00D9FF]/40 hover:scale-[1.01] transition-all duration-200 cursor-pointer'
    : '';

  return (
    <div className={`p-6 rounded-3xl ${baseStyles} ${interactiveStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
