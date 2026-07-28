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
  animated = false,
  onClick,
}: NeoTuneLogoProps) {

  // Exact Pixel Dimensions & Scales
  const dimensions = {
    xs: { height: 16, textHeight: 'h-4', font: 'text-xs', iconSize: 16 },
    sm: { height: 24, textHeight: 'h-6', font: 'text-sm', iconSize: 24 },
    md: { height: 36, textHeight: 'h-9', font: 'text-xl', iconSize: 36 },
    lg: { height: 56, textHeight: 'h-14', font: 'text-3xl', iconSize: 56 },
    xl: { height: 80, textHeight: 'h-20', font: 'text-5xl', iconSize: 80 },
    '2xl': { height: 120, textHeight: 'h-28', font: 'text-7xl', iconSize: 120 },
  }[size];

  // Theme Colors
  const isDark = theme === 'dark';

  // Primary Vector Gradient IDs
  const gradId = `neotune-grad-${size}-${variant}`;
  const glowId = `neotune-glow-${size}-${variant}`;
  const glassId = `neotune-glass-${size}-${variant}`;

  /* ══════════════════════════════════════════════════════════════════════ */
  /* 1. SYMBOL ONLY / APP ICON MARK (N + Equalizer + Play Button)           */
  /* ══════════════════════════════════════════════════════════════════════ */
  if (variant === 'icon' || variant === 'symbol' || !showText) {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center select-none cursor-pointer group ${className}`}
        style={{ width: dimensions.iconSize, height: dimensions.iconSize }}
      >
        <svg
          width={dimensions.iconSize}
          height={dimensions.iconSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_16px_rgba(24,216,255,0.35)] transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Primary Brand Gradient: Cyan -> Blue -> Purple -> Magenta */}
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18D8FF" />
              <stop offset="35%" stopColor="#3B82F6" />
              <stop offset="70%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#FF4FD8" />
            </linearGradient>

            {/* 3D Glossy Extrusion Lighting */}
            <linearGradient id={glassId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
            </linearGradient>

            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 3D Soft Container Tile (App Icon Style) */}
          {variant === 'icon' && (
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="24"
              fill={`url(#${gradId})`}
              className="transition-all duration-300"
            />
          )}

          {/* Inner Gloss Overlay */}
          {variant === 'icon' && (
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="24"
              fill={`url(#${glassId})`}
            />
          )}

          {/* Core Symbol Geometry: Iconic N + Equalizer + Integrated Play Triangle */}
          <g transform={variant === 'icon' ? "translate(15, 15) scale(0.7)" : "translate(0, 0)"}>
            
            {/* Stem 1 of N: Equalizer Bars */}
            <rect x="18" y="22" width="9" height="56" rx="4.5" fill={variant === 'icon' ? "#FFFFFF" : `url(#${gradId})`} />
            <rect x="31" y="34" width="7" height="44" rx="3.5" fill={variant === 'icon' ? "rgba(255,255,255,0.75)" : "#18D8FF"} />
            
            {/* Diagonal Motion Bridge of N */}
            <path
              d="M 23 26 L 68 70 A 5 5 0 0 0 76 65 L 76 26 C 76 22 71 20 68 23 Z"
              fill={variant === 'icon' ? "#FFFFFF" : `url(#${gradId})`}
            />

            {/* Stem 2 of N + Play Button O Circle Integration */}
            <circle cx="70" cy="50" r="22" fill="#0A0D14" />
            <circle cx="70" cy="50" r="20" fill={variant === 'icon' ? "#FFFFFF" : `url(#${gradId})`} />
            <circle cx="70" cy="50" r="15" fill="#0A0D14" />
            
            {/* Solid Play Triangle ▶ inside O */}
            <polygon
              points="66,42 66,58 78,50"
              fill="#18D8FF"
            />
          </g>
        </svg>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════ */
  /* 2. MARKETING 3D HERO LOGO VERSION (Landing Pages / Splash Screens)      */
  /* ══════════════════════════════════════════════════════════════════════ */
  if (variant === 'marketing') {
    return (
      <div className={`flex flex-col items-center select-none ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center p-8"
        >
          {/* Ambient Multi-Layer Radial Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#18D8FF]/30 via-[#8B5CF6]/30 to-[#FF4FD8]/30 blur-3xl rounded-full animate-pulse" />
          
          <svg
            viewBox="0 0 540 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${dimensions.textHeight} w-auto filter drop-shadow-[0_12px_32px_rgba(24,216,255,0.4)]`}
          >
            <defs>
              <linearGradient id="mk-cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#18D8FF" />
                <stop offset="30%" stopColor="#3B82F6" />
                <stop offset="65%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#FF4FD8" />
              </linearGradient>

              <linearGradient id="mk-3d-gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
                <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Custom Designed Typographic Wordmark Artwork */}
            {/* N - Equalizer Stem */}
            <rect x="20" y="24" width="12" height="72" rx="6" fill="url(#mk-cyan-purple)" />
            <rect x="36" y="44" width="10" height="52" rx="5" fill="#18D8FF" />
            <path d="M 26 28 L 84 88 C 88 92 96 89 96 83 L 96 28 C 96 22 89 19 85 23 Z" fill="url(#mk-cyan-purple)" />
            <rect x="84" y="24" width="12" height="72" rx="6" fill="url(#mk-cyan-purple)" />

            {/* e */}
            <path d="M 116 60 C 116 42 130 32 148 32 C 166 32 178 44 178 62 C 178 65 175 67 172 67 H 128 C 130 78 138 84 149 84 C 158 84 165 79 168 74 C 170 71 174 71 177 73 L 183 78 C 186 81 185 85 181 88 C 173 96 162 100 148 100 C 128 100 116 84 116 60 Z M 165 56 C 164 47 157 41 148 41 C 139 41 131 47 129 56 H 165 Z" fill="url(#mk-cyan-purple)" />

            {/* O - Integrated Play Button */}
            <circle cx="224" cy="62" r="32" fill="url(#mk-cyan-purple)" />
            <circle cx="224" cy="62" r="23" fill="#0A0D14" />
            <polygon points="218,49 218,75 238,62" fill="url(#mk-cyan-purple)" />

            {/* T - Soundwave Top Bar */}
            <path d="M 276 32 H 324 C 328 32 330 35 328 39 L 322 47 C 320 50 316 52 312 52 H 306 V 90 C 306 94 302 98 298 98 H 292 C 288 98 284 94 284 90 V 52 H 278 C 274 52 270 50 268 47 L 262 39 C 260 35 262 32 266 32 H 276 Z" fill="url(#mk-cyan-purple)" />

            {/* u */}
            <path d="M 338 36 V 74 C 338 82 344 88 354 88 C 364 88 370 82 370 74 V 36 C 370 32 374 28 378 28 H 382 C 386 28 390 32 390 36 V 92 C 390 96 386 100 382 100 H 378 C 374 100 370 96 370 92 V 86 C 364 94 354 98 342 98 C 324 98 316 84 316 68 V 36 C 316 32 320 28 324 28 H 328 C 332 28 336 32 336 36 Z" fill="url(#mk-cyan-purple)" />

            {/* n */}
            <path d="M 404 36 V 92 C 404 96 400 100 396 100 H 392 C 388 100 384 96 384 92 V 36 C 384 32 388 28 392 28 H 396 C 400 28 404 32 404 36 Z M 404 56 C 410 44 422 36 436 36 C 452 36 460 48 460 66 V 92 C 460 96 456 100 452 100 H 448 C 444 100 440 96 440 92 V 68 C 440 58 435 50 426 50 C 417 50 410 57 404 66 V 56 Z" fill="url(#mk-cyan-purple)" />

            {/* e */}
            <path d="M 470 60 C 470 42 484 32 502 32 C 520 32 532 44 532 62 C 532 65 529 67 526 67 H 482 C 484 78 492 84 503 84 C 512 84 519 79 522 74 C 524 71 528 71 531 73 L 537 78 C 540 81 539 85 535 88 C 527 96 516 100 502 100 C 482 100 470 84 470 60 Z" fill="url(#mk-cyan-purple)" />
          </svg>
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
  /* 3. PRIMARY FLAT / RESPONSIVE VECTOR LOGO (Default Header/Navbar)        */
  /* ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-start select-none cursor-pointer ${className}`}
    >
      <div className={`flex items-center gap-1 font-black tracking-tight ${dimensions.font} ${isDark ? 'text-white' : 'text-black'}`}>
        
        {/* N with Equalizer Bars */}
        <span className="relative flex items-center text-[#18D8FF] font-black">
          N
          <span className="inline-flex items-end gap-[1.5px] ml-[1.5px] mr-[1.5px] h-3.5">
            <motion.span
              animate={animated ? { height: ['6px', '14px', '6px'] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              className="w-[2px] h-2 bg-[#18D8FF] rounded-full"
            />
            <motion.span
              animate={animated ? { height: ['14px', '6px', '14px'] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2, ease: 'easeInOut' }}
              className="w-[2px] h-3.5 bg-[#3B82F6] rounded-full"
            />
            <motion.span
              animate={animated ? { height: ['8px', '16px', '8px'] } : {}}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4, ease: 'easeInOut' }}
              className="w-[2px] h-2.5 bg-[#8B5CF6] rounded-full"
            />
          </span>
        </span>

        {/* e */}
        <span className="text-[#18D8FF] font-black">e</span>

        {/* O WITH INTEGRATED PLAY BUTTON ▶ */}
        <span className="relative inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-[#18D8FF] via-[#3B82F6] to-[#8B5CF6] p-[2px] shadow-sm mx-[1px]">
          <span className="h-4 w-4 rounded-full bg-[#0A0D14] flex items-center justify-center">
            <span className="w-0 h-0 border-y-[3.5px] border-y-transparent border-l-[6px] border-l-[#18D8FF] translate-x-[1px]" />
          </span>
        </span>

        {/* Tunes Wordmark */}
        {showText && (
          <span className="relative bg-gradient-to-r from-[#3B82F6] via-[#8B5CF6] to-[#FF4FD8] bg-clip-text text-transparent font-black">
            Tunes
            {/* Sparkle Waveform Accent */}
            <span className="absolute -top-1 -right-2 text-[10px] text-[#FF4FD8] animate-pulse">
              ✨
            </span>
          </span>
        )}
      </div>

      {/* Audio Waveform Underline */}
      <div className="w-full flex items-center gap-0.5 mt-0.5 opacity-80">
        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8] rounded-full" />
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
