'use client';

import React from 'react';

interface NeoTuneLogoProps {
  className?: string;
  showTagline?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function NeoTuneLogo({ className = '', showTagline = false, showText = true, size = 'md' }: NeoTuneLogoProps) {
  const sizeClasses = {
    sm: { text: 'text-base font-black', icon: 'h-4 w-4', oCircle: 'h-4 w-4', playTriangle: 'border-l-[5px] border-y-[3px]' },
    md: { text: 'text-xl font-black', icon: 'h-5 w-5', oCircle: 'h-5 w-5', playTriangle: 'border-l-[7px] border-y-[4px]' },
    lg: { text: 'text-3xl font-black', icon: 'h-7 w-7', oCircle: 'h-7 w-7', playTriangle: 'border-l-[10px] border-y-[6px]' },
    xl: { text: 'text-5xl font-black', icon: 'h-10 w-10', oCircle: 'h-10 w-10', playTriangle: 'border-l-[14px] border-y-[9px]' },
  }[size];

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      <div className={`flex items-center gap-0.5 tracking-tight text-white ${sizeClasses.text}`}>
        
        {/* N with Equalizer Soundwaves */}
        <span className="relative flex items-center text-[#00D6FF] font-black">
          N
          <span className="inline-flex items-end gap-[1px] ml-[1px] mr-[1px] h-3">
            <span className="w-[1.5px] h-2 bg-[#00D6FF] rounded-full animate-pulse" />
            <span className="w-[1.5px] h-3 bg-[#00D6FF] rounded-full animate-pulse delay-75" />
            <span className="w-[1.5px] h-1.5 bg-[#00D6FF] rounded-full animate-pulse delay-150" />
          </span>
        </span>

        {/* e */}
        <span className="text-[#00D6FF] font-black">e</span>

        {/* O WITH SOLID PLAY BUTTON INSIDE ▶ */}
        <span className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-[#00D6FF] to-[#00A3FF] shadow-sm mx-[1px] ${sizeClasses.oCircle}`}>
          <span className="h-[65%] w-[65%] rounded-full bg-[#0B0E14] flex items-center justify-center">
            {/* Play Triangle */}
            <span className={`w-0 h-0 border-y-transparent border-l-[#00D6FF] translate-x-[1px] ${sizeClasses.playTriangle}`} />
          </span>
        </span>

        {/* Tunes with Cyan-to-Magenta Gradient */}
        {showText && (
          <span className="relative bg-gradient-to-r from-[#00A3FF] via-[#7A3CFF] to-[#FF4DDB] bg-clip-text text-transparent font-black ml-[1px]">
            Tunes
            {/* Magenta Sparkle Star on top right of 's' */}
            <span className="absolute -top-1 -right-2 text-[10px] text-[#FF4DDB] animate-pulse">
              ✨
            </span>
          </span>
        )}
      </div>

      {/* Audio Waveform Underline */}
      <div className="w-full flex items-center gap-0.5 mt-0.5 opacity-80">
        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#00D6FF] via-[#7A3CFF] to-[#FF4DDB] rounded-full" />
      </div>

      {/* Optional Tagline */}
      {showTagline && (
        <p className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#B3B3B3] mt-1 uppercase">
          <span className="text-[#00D6FF]">FEEL</span> THE MUSIC. <span className="text-[#FF4DDB]">LIVE</span> THE MOMENT.
        </p>
      )}
    </div>
  );
}
