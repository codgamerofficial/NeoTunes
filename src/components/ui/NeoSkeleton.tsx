'use client';

import React from 'react';

export interface NeoSkeletonProps {
  variant?: 'track' | 'card' | 'hero' | 'avatar' | 'text' | 'button';
  count?: number;
  className?: string;
}

export function NeoSkeleton({
  variant = 'track',
  count = 1,
  className = '',
}: NeoSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'track') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 animate-pulse"
          >
            <div className="h-11 w-11 rounded-lg bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3.5 w-1/3 bg-white/10 rounded" />
              <div className="h-2.5 w-1/5 bg-white/5 rounded" />
            </div>
            <div className="h-3 w-10 bg-white/5 rounded shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3 animate-pulse">
            <div className="w-full aspect-square rounded-xl bg-white/10" />
            <div className="h-3.5 w-3/4 bg-white/10 rounded" />
            <div className="h-2.5 w-1/2 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`w-full h-64 sm:h-72 rounded-3xl bg-white/[0.02] border border-white/5 p-6 sm:p-8 flex flex-col justify-end space-y-3 animate-pulse ${className}`}>
        <div className="h-4 w-24 bg-white/10 rounded-full" />
        <div className="h-8 w-1/2 bg-white/15 rounded-lg" />
        <div className="h-4 w-1/3 bg-white/10 rounded" />
        <div className="h-10 w-28 bg-white/20 rounded-full mt-2" />
      </div>
    );
  }

  return (
    <div className={`h-4 w-full bg-white/10 rounded animate-pulse ${className}`} />
  );
}

export default NeoSkeleton;
