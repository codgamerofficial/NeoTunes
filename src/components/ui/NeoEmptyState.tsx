'use client';

import React from 'react';
import { LucideIcon, Music } from 'lucide-react';
import { NeoButton } from './NeoButton';

export interface NeoEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function NeoEmptyState({
  icon: Icon = Music,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: NeoEmptyStateProps) {
  return (
    <div
      className={`p-8 sm:p-12 rounded-3xl bg-[#11141A] border border-white/5 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto my-8 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-white/5 text-[#DFFF00] flex items-center justify-center">
        <Icon className="h-8 w-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-[#F5F7FA]">{title}</h3>
        <p className="text-xs sm:text-sm text-[#9AA1AD] leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <NeoButton variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </NeoButton>
      )}
    </div>
  );
}

export default NeoEmptyState;
