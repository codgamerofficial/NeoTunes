'use client';

import React from 'react';

export interface NeoSkeletonProps {
  variant?: 'track' | 'card' | 'hero' | 'avatar' | 'text' | 'lyrics';
  count?: number;
  className?: string;
}

export const NeoSkeleton: React.FC<NeoSkeletonProps> = ({
  variant = 'track',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (variant === 'hero') {
    return (
      <div className={`w-full rounded-3xl bg-[#11141A] border border-white/5 p-6 sm:p-8 animate-shimmer flex flex-col sm:flex-row gap-6 ${className}`}>
        <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl bg-white/5 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="w-24 h-4 rounded-full bg-white/5" />
          <div className="w-3/4 h-8 rounded-lg bg-white/5" />
          <div className="w-1/2 h-4 rounded-md bg-white/5" />
          <div className="w-1/3 h-3 rounded-md bg-white/5" />
          <div className="pt-3 flex gap-3">
            <div className="w-28 h-10 rounded-full bg-white/10" />
            <div className="w-24 h-10 rounded-full bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`flex gap-4 overflow-hidden py-1 ${className}`}>
        {items.map((_, idx) => (
          <div
            key={idx}
            className="w-36 sm:w-44 p-3 rounded-2xl bg-[#11141A] border border-white/5 space-y-3 shrink-0 animate-shimmer"
          >
            <div className="aspect-square w-full rounded-xl bg-white/5" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-4/5 rounded-md bg-white/5" />
              <div className="h-2.5 w-1/2 rounded-md bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'lyrics') {
    return (
      <div className={`space-y-4 py-4 px-2 animate-shimmer ${className}`}>
        {items.map((_, idx) => (
          <div key={idx} className="space-y-2">
            <div className="h-5 rounded-lg bg-white/5" style={{ width: `${60 + (idx % 4) * 10}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl bg-[#11141A]/60 border border-white/5 animate-shimmer"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="h-11 w-11 rounded-xl bg-white/5 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 w-1/2 rounded-md bg-white/5" />
              <div className="h-2.5 w-1/3 rounded-md bg-white/5" />
            </div>
          </div>
          <div className="h-3 w-8 rounded bg-white/5 shrink-0" />
        </div>
      ))}
    </div>
  );
};

export default NeoSkeleton;
