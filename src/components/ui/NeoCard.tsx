import React from 'react';

export interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  glass?: boolean;
  children: React.ReactNode;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  elevated = false,
  interactive = false,
  glass = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl border transition-all duration-200
        ${
          elevated
            ? 'bg-[#171A21] border-white/10 shadow-xl'
            : glass
            ? 'bg-[#11141A]/80 backdrop-blur-xl border-white/[0.08]'
            : 'bg-[#11141A] border-white/[0.06]'
        }
        ${
          interactive
            ? 'cursor-pointer hover:border-[#DFFF00]/40 hover:bg-[#171A21] active:scale-[0.99]'
            : ''
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
