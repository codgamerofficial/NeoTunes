import React from 'react';

export interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  glass?: boolean;
  brutalist?: boolean;
  brutalistCyan?: boolean;
  children: React.ReactNode;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  elevated = false,
  interactive = false,
  glass = false,
  brutalist = false,
  brutalistCyan = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl transition-all duration-200
        ${
          brutalist
            ? 'bg-[#11141A] border-2 border-[#DFFF00] shadow-[4px_4px_0px_rgba(223,255,0,0.85)]'
            : brutalistCyan
            ? 'bg-[#11141A] border-2 border-[#00E5FF] shadow-[4px_4px_0px_rgba(0,229,255,0.85)]'
            : elevated
            ? 'bg-[#171A21] border border-white/10 shadow-xl'
            : glass
            ? 'bg-[#11141A]/75 backdrop-blur-2xl border border-white/[0.08] shadow-glass'
            : 'bg-[#11141A] border border-white/[0.06]'
        }
        ${
          interactive && !brutalist && !brutalistCyan
            ? 'cursor-pointer hover:border-[#DFFF00]/40 hover:bg-[#171A21] active:scale-[0.985] hover:shadow-lg'
            : ''
        }
        ${
          interactive && (brutalist || brutalistCyan)
            ? 'cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[1px] active:translate-y-[1px]'
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

export default NeoCard;
