'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface NeoTuneLogoProps {
  className?: string;
  variant?: 'primary' | 'icon' | 'marketing' | 'animated' | 'symbol';
  theme?: 'dark' | 'light' | 'monochrome' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTagline?: boolean;
  showText?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export default function NeoTuneLogo({
  className = '',
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  showTagline = false,
  showText = true,
  animated = true,
  onClick,
}: NeoTuneLogoProps) {

  // Exact Pixel Dimensions & Scales
  const sizeClasses = {
    xs: { text: 'text-xs font-black', oCircle: 'h-4 w-4', playTriangle: 'border-l-[5px] border-y-[3px]' },
    sm: { text: 'text-sm sm:text-base font-black', oCircle: 'h-5 w-5', playTriangle: 'border-l-[6px] border-y-[3.5px]' },
    md: { text: 'text-xl font-black', oCircle: 'h-7 w-7', playTriangle: 'border-l-[8px] border-y-[5px]' },
    lg: { text: 'text-3xl font-black', oCircle: 'h-11 w-11', playTriangle: 'border-l-[12px] border-y-[7px]' },
    xl: { text: 'text-5xl font-black', oCircle: 'h-18 w-18', playTriangle: 'border-l-[16px] border-y-[10px]' },
    '2xl': { text: 'text-7xl font-black', oCircle: 'h-24 w-24', playTriangle: 'border-l-[20px] border-y-[12px]' },
  }[size];

  /* ══════════════════════════════════════════════════════════════════════ */
  /* 1. SYMBOL ONLY / APP ICON MARK (3D Holographic Vinyl Play Core)        */
  /* ══════════════════════════════════════════════════════════════════════ */
  if (variant === 'icon' || variant === 'symbol' || !showText) {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center select-none cursor-pointer group ${className}`}
      >
        {/* Holographic Ring Aura */}
        <div className={`relative rounded-full p-[2px] bg-gradient-to-tr from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] shadow-[0_0_20px_rgba(24,216,255,0.6)] transition-transform duration-300 group-hover:scale-110 ${sizeClasses.oCircle}`}>
          
          {/* Pulsing Backlight Halo */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] opacity-75 blur-sm animate-pulse" />
          
          {/* Inner Vinyl Core */}
          <div className="relative h-full w-full rounded-full bg-[#0A0D14] flex items-center justify-center border border-[#18D8FF]/30">
            {/* Vinyl Groove Rings */}
            <div className="absolute inset-1 rounded-full border border-white/10" />
            <div className="absolute inset-2 rounded-full border border-white/5" />
            
            {/* 3D Cyan Play Button Triangle */}
            <span className={`w-0 h-0 border-y-transparent border-l-[#18D8FF] translate-x-[1px] filter drop-shadow-[0_0_6px_#18D8FF] ${sizeClasses.playTriangle}`} />
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════ */
  /* 2. MARKETING 3D HERO LOGO VERSION (Landing Pages & Splash Screens)     */
  /* ══════════════════════════════════════════════════════════════════════ */
  if (variant === 'marketing') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center p-6"
        >
          {/* Ambient Multi-Layer Radial Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#18D8FF]/40 via-[#8B5CF6]/40 to-[#FF4FD8]/40 blur-3xl rounded-full animate-pulse" />
          
          <div className="relative flex items-center gap-2">
            
            {/* N with Animated Equalizer Bars */}
            <span className="relative flex items-center text-[#18D8FF] font-black text-6xl tracking-tight drop-shadow-[0_0_25px_rgba(24,216,255,0.8)]">
              N
              <span className="inline-flex items-end gap-1 ml-1 mr-1 h-10">
                <motion.span animate={{ height: ['12px', '32px', '12px'] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }} className="w-1.5 bg-[#18D8FF] rounded-full shadow-[0_0_10px_#18D8FF]" />
                <motion.span animate={{ height: ['32px', '16px', '32px'] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2, ease: 'easeInOut' }} className="w-1.5 bg-[#3B82F6] rounded-full shadow-[0_0_10px_#3B82F6]" />
                <motion.span animate={{ height: ['20px', '40px', '20px'] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4, ease: 'easeInOut' }} className="w-1.5 bg-[#8B5CF6] rounded-full shadow-[0_0_10px_#8B5CF6]" />
              </span>
            </span>

            {/* e */}
            <span className="text-[#18D8FF] font-black text-6xl tracking-tight drop-shadow-[0_0_20px_rgba(24,216,255,0.6)]">e</span>

            {/* 3D HOLOGRAPHIC VINYL PLAY CORE 'O' */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
              className="relative h-20 w-20 rounded-full p-[3px] bg-gradient-to-tr from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] shadow-[0_0_35px_rgba(24,216,255,0.9)] mx-2 flex items-center justify-center"
            >
              <div className="relative h-full w-full rounded-full bg-[#0A0D14] flex items-center justify-center border border-[#18D8FF]/40">
                <div className="absolute inset-2 rounded-full border border-white/20" />
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <span className="w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-[#18D8FF] translate-x-1 filter drop-shadow-[0_0_10px_#18D8FF]" />
              </div>
            </motion.div>

            {/* Tunes Wordmark */}
            <span className="relative bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#FF4FD8] bg-clip-text text-transparent font-black text-6xl tracking-tight drop-shadow-[0_0_25px_rgba(255,79,216,0.6)]">
              Tunes
              <span className="absolute -top-3 -right-6 text-2xl text-[#FF4FD8] animate-bounce">
                ✨
              </span>
            </span>
          </div>
        </motion.div>

        {showTagline && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xs font-mono font-bold tracking-[0.3em] text-[#B3B3B3] uppercase mt-2"
          >
            <span className="text-[#18D8FF]">FEEL THE MUSIC.</span> <span className="text-[#FF4FD8]">LIVE THE MOMENT.</span>
          </motion.p>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════ */
  /* 3. PRIMARY CRAZY NEON LOGO (Default Header, Navbar & Navigation)       */
  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-start select-none cursor-pointer group ${className}`}
    >
      <div className={`flex items-center gap-0.5 tracking-tight ${sizeClasses.text}`}>
        
        {/* N with Equalizer Bars */}
        <span className="relative flex items-center text-[#18D8FF] font-black drop-shadow-[0_0_12px_rgba(24,216,255,0.6)]">
          N
          <span className="inline-flex items-end gap-[1.5px] ml-[1.5px] mr-[1.5px] h-3.5">
            <motion.span
              animate={animated ? { height: ['6px', '14px', '6px'] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-[2px] h-2 bg-[#18D8FF] rounded-full shadow-[0_0_6px_#18D8FF]"
            />
            <motion.span
              animate={animated ? { height: ['14px', '6px', '14px'] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
              className="w-[2px] h-3.5 bg-[#3B82F6] rounded-full shadow-[0_0_6px_#3B82F6]"
            />
            <motion.span
              animate={animated ? { height: ['8px', '16px', '8px'] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
              className="w-[2px] h-2.5 bg-[#8B5CF6] rounded-full shadow-[0_0_6px_#8B5CF6]"
            />
          </span>
        </span>

        {/* e */}
        <span className="text-[#18D8FF] font-black drop-shadow-[0_0_10px_rgba(24,216,255,0.5)]">e</span>

        {/* 3D HOLOGRAPHIC VINYL PLAY CORE 'O' */}
        <div className={`relative inline-flex items-center justify-center rounded-full p-[1.5px] bg-gradient-to-tr from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] shadow-[0_0_14px_rgba(24,216,255,0.7)] mx-[2px] ${sizeClasses.oCircle}`}>
          <div className="relative h-full w-full rounded-full bg-[#0A0D14] flex items-center justify-center border border-[#18D8FF]/30">
            {/* Inner Ring Detail */}
            <div className="absolute inset-[2px] rounded-full border border-white/10" />
            <span className={`w-0 h-0 border-y-transparent border-l-[#18D8FF] translate-x-[1px] filter drop-shadow-[0_0_4px_#18D8FF] ${sizeClasses.playTriangle}`} />
          </div>
        </div>

        {/* Tunes Wordmark */}
        {showText && (
          <span className="relative bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#FF4FD8] bg-clip-text text-transparent font-black drop-shadow-[0_0_12px_rgba(255,79,216,0.4)]">
            Tunes
            {/* Sparkle Waveform Accent */}
            <span className="absolute -top-1 -right-2 text-[10px] text-[#FF4FD8] animate-pulse">
              ✨
            </span>
          </span>
        )}
      </div>

      {/* Audio Waveform Underline */}
      <div className="w-full flex items-center gap-0.5 mt-0.5 opacity-90">
        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] rounded-full shadow-[0_0_8px_#18D8FF]" />
      </div>

      {/* Optional Tagline */}
      {showTagline && (
        <p className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#B3B3B3] mt-1 uppercase">
          <span className="text-[#18D8FF]">FEEL</span> THE MUSIC. <span className="text-[#FF4FD8]">LIVE</span> THE MOMENT.
        </p>
      )}
    </div>
  );
}
