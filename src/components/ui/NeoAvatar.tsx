'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

interface NeoAvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  className?: string;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-24 w-24 sm:h-28 sm:w-28 text-2xl',
  xl: 'h-32 w-32 sm:h-36 sm:w-36 text-3xl',
};

export function NeoAvatar({
  source,
  name = 'Saswata Dey',
  size = 'lg',
  verified = false,
  className = '',
  onClick,
}: NeoAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImgError(false);
    setLoaded(false);
  }, [source]);

  // Compute initials fallback
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SD';

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.lg;

  const showImage = source && !imgError;

  return (
    <div 
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full bg-[#111115] border border-white/15 shadow-xl shrink-0 overflow-hidden ${
        onClick ? 'cursor-pointer hover:border-[#DFFF00] transition-colors' : ''
      } ${sizeClass} ${className}`}
    >
      {showImage ? (
        <img
          src={source}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : null}

      {(!showImage || !loaded) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#16161A] to-[#090A0C] text-[#F5F5F7] font-mono font-black tracking-wider uppercase">
          {initials}
        </div>
      )}

      {verified && (
        <div className="absolute bottom-0 right-0 bg-[#DFFF00] text-black rounded-full p-1 border-2 border-[#050505] shadow-md">
          <ShieldCheck className="w-3 h-3 fill-black text-black" />
        </div>
      )}
    </div>
  );
}

export default NeoAvatar;
