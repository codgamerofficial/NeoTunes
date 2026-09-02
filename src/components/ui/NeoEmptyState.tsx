'use client';

import React from 'react';
import { Music } from 'lucide-react';
import { NeoButton } from './NeoButton';

export interface NeoEmptyStateProps {
  icon?: any;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const NeoEmptyState: React.FC<NeoEmptyStateProps> = ({
  icon: Icon = Music,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center rounded-3xl bg-[#11141A]/50 border border-white/[0.06] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-6 select-none ${className}`}>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[#DFFF00] shadow-sm">
        <Icon className="h-8 w-8" />
      </div>

      <div className="space-y-1 text-center">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#9AA1AD] leading-relaxed max-w-xs">
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <NeoButton variant="primary" size="sm" onClick={onAction} className="mt-2">
          {actionText}
        </NeoButton>
      )}
    </div>
  );
};

export default NeoEmptyState;
