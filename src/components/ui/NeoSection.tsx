'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface NeoSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const NeoSection: React.FC<NeoSectionProps> = ({
  title,
  subtitle,
  icon,
  actionText,
  onAction,
  children,
  className = '',
}) => {
  return (
    <section className={`space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-[#DFFF00] shrink-0">{icon}</span>}
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#F5F7FA] tracking-tight uppercase">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#9AA1AD] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {actionText && onAction && (
          <button
            onClick={onAction}
            className="text-xs font-bold text-[#9AA1AD] hover:text-white flex items-center gap-1 transition-colors cursor-pointer shrink-0 py-1"
          >
            <span>{actionText}</span>
            <ChevronRight className="h-3.5 w-3.5 text-[#DFFF00]" />
          </button>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
};

export default NeoSection;
