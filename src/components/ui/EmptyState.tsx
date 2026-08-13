'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LucideIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) onAction();
    else if (actionHref) router.push(actionHref);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-[#121318] border border-white/10 rounded-3xl">
      <div className="h-14 w-14 rounded-2xl bg-[#17181D] border border-white/10 flex items-center justify-center text-[#AFC7FF] shadow-lg">
        <Icon className="h-7 w-7" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-black text-white">{title}</h3>
        <p className="text-xs text-[#A8A7AF] leading-relaxed">{description}</p>
      </div>

      {actionLabel && (
        <button
          onClick={handleAction}
          className="mt-2 px-5 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(175,199,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
