'use client';

import React from 'react';

export interface NeoTuneLogoProps {
  className?: string;
  variant?: 'primary' | 'icon' | 'marketing' | 'symbol';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showText?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export default function NeoTuneLogo({
  className = '',
  variant = 'primary',
  size = 'md',
  showTagline = false,
  showText = true,
  onClick,
}: NeoTuneLogoProps) {
  const heightClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
    xl: 'h-16',
  }[size];

  if (variant === 'icon' || variant === 'symbol' || !showText) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-200 hover:scale-105 ${className}`}
      >
        <img
          src="/logo-icon.svg"
          alt="NeoTunes Logo"
          className={`${heightClasses} w-auto object-contain`}
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer select-none transition-transform duration-200 hover:scale-[1.02] ${className}`}
    >
      {/* Icon Mark */}
      <img
        src="/logo-icon.svg"
        alt="NeoTunes Mark"
        className={`${heightClasses} w-auto object-contain mr-2.5`}
      />

      {/* Typography & Tagline */}
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center font-black tracking-[0.12em] text-white text-lg sm:text-xl uppercase leading-none font-sans">
            NEO<span className="bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] bg-clip-text text-transparent ml-[2px]">TUNES</span>
          </div>
          {showTagline && (
            <span className="text-[9px] font-bold tracking-[0.25em] bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] bg-clip-text text-transparent uppercase mt-1">
              FEEL EVERY BEAT
            </span>
          )}
        </div>
      )}
    </div>
  );
}
