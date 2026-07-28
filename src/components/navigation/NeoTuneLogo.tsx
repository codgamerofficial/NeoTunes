'use client';

import React from 'react';

interface NeoTuneLogoProps {
  className?: string;
  showTagline?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function NeoTuneLogo({ className = '', showTagline = false, showText = true, size = 'md' }: NeoTuneLogoProps) {
  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-20',
  };

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      {/* 3D NeoTunes Wordmark SVG with Play Button inside 'o' */}
      <svg
        viewBox="0 0 350 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heights[size]} w-auto drop-shadow-[0_4px_12px_rgba(0,214,255,0.25)]`}
      >
        <defs>
          {/* Main Brand Gradient: Cyan -> Blue -> Purple -> Magenta */}
          <linearGradient id="neotunes-cyan-purple" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D6FF" />
            <stop offset="25%" stopColor="#00A3FF" />
            <stop offset="55%" stopColor="#4B6BFF" />
            <stop offset="80%" stopColor="#7A3CFF" />
            <stop offset="100%" stopColor="#FF4DDB" />
          </linearGradient>

          <linearGradient id="neotunes-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D6FF" />
            <stop offset="100%" stopColor="#0088FF" />
          </linearGradient>

          <linearGradient id="neotunes-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF4DDB" />
            <stop offset="100%" stopColor="#7A3CFF" />
          </linearGradient>

          {/* 3D Soft Inner Shadow Filter */}
          <filter id="neo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. LETTER 'N' - Clean Bold N */}
        <path
          d="M 14 58 V 16 H 24 L 40 46 V 16 H 50 V 58 H 40 L 24 28 V 58 H 14 Z"
          fill="url(#neotunes-cyan)"
        />
        {/* Equalizer lines inside N left stem */}
        <line x1="16" y1="46" x2="16" y2="54" stroke="#0B0E14" strokeWidth="2" strokeLinecap="round" />
        <line x1="19" y1="40" x2="19" y2="54" stroke="#0B0E14" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="44" x2="22" y2="54" stroke="#0B0E14" strokeWidth="2" strokeLinecap="round" />

        {/* 2. LETTER 'e' */}
        <path
          d="M 64 40 C 64 29 72 23 83 23 C 94 23 101 29 101 40 C 101 42 101 43 100 44 H 74 C 75 49 79 52 84 52 C 88 52 92 50 94 47 H 101 C 98 54 92 59 83 59 C 72 59 64 51 64 40 Z M 74 38 H 91 C 90 33 87 30 83 30 C 78 30 75 33 74 38 Z"
          fill="url(#neotunes-cyan)"
        />

        {/* 3. LETTER 'o' WITH SOLID PLAY BUTTON INSIDE ▶ */}
        <circle cx="124" cy="41" r="18" fill="url(#neotunes-cyan)" />
        <circle cx="124" cy="41" r="11" fill="#0B0E14" />
        {/* Solid White/Cyan Triangle Play Icon Inside 'o' */}
        <path
          d="M 121 34.5 C 121 33.7 121.9 33.2 122.6 33.6 L 129.8 39.1 C 130.4 39.5 130.4 40.5 129.8 40.9 L 122.6 46.4 C 121.9 46.8 121 46.3 121 45.5 V 34.5 Z"
          fill="#00D6FF"
        />

        {/* 4. LETTER 'T' */}
        <path
          d="M 152 14 H 178 C 180 14 182 16 182 18 V 23 C 182 25 180 27 178 27 H 170 V 55 C 170 57 168 59 166 59 H 160 C 158 59 156 57 156 55 V 27 H 152 C 150 27 148 25 148 23 V 18 C 148 16 150 14 152 14 Z"
          fill="url(#neotunes-cyan-purple)"
        />

        {/* 5. LETTER 'u' */}
        <path
          d="M 190 25 V 45 C 190 53 195 59 204 59 C 213 59 218 53 218 45 V 25 H 210 V 45 C 210 49 208 52 204 52 C 200 52 198 49 198 45 V 25 H 190 Z"
          fill="url(#neotunes-cyan-purple)"
        />

        {/* 6. LETTER 'n' */}
        <path
          d="M 228 25 V 59 H 236 V 38 C 236 32 240 29 245 29 C 250 29 253 32 253 38 V 59 H 261 V 36 C 261 28 255 23 247 23 C 241 23 237 26 235 30 V 25 H 228 Z"
          fill="url(#neotunes-cyan-purple)"
        />

        {/* 7. LETTER 'e' */}
        <path
          d="M 270 40 C 270 29 278 23 289 23 C 300 23 307 29 307 40 C 307 42 307 43 306 44 H 280 C 281 49 285 52 290 52 C 294 52 298 50 300 47 H 307 C 304 54 298 59 289 59 C 278 59 270 51 270 40 Z M 280 38 H 297 C 296 33 293 30 289 30 C 284 30 281 33 280 38 Z"
          fill="url(#neotunes-cyan-purple)"
        />

        {/* 8. LETTER 's' WITH MAGENTA SPARKLE STAR ✨ */}
        <path
          d="M 314 52 C 316 54 320 55 324 55 C 329 55 332 53 332 50 C 332 47 329 46 324 44 L 319 43 C 314 41 312 37 312 32 C 312 26 317 23 324 23 C 329 23 333 24 336 27 L 333 32 C 330 30 327 29 324 29 C 320 29 318 30 318 32 C 318 34 320 35 325 37 L 330 38 C 335 40 338 44 338 49 C 338 56 332 59 324 59 C 318 59 314 57 311 54 L 314 52 Z"
          fill="url(#neotunes-magenta)"
        />

        {/* Magenta Sparkle 4-pointed Star perched on top right of 's' */}
        <path
          d="M 334 14 C 334 18 332 20 328 20 C 332 20 334 22 334 26 C 334 22 336 20 340 20 C 336 20 334 18 334 14 Z"
          fill="#FF4DDB"
          filter="url(#neo-glow)"
        />

        {/* Audio Waveform Underline Pulse */}
        <path
          d="M 14 66 H 180 L 184 62 L 188 70 L 192 60 L 196 68 L 200 66 H 338"
          stroke="url(#neotunes-cyan-purple)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>

      {/* Optional Tagline */}
      {showTagline && (
        <p className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#B3B3B3] mt-1 uppercase">
          <span className="text-[#00D6FF]">FEEL</span> THE MUSIC. <span className="text-[#FF4DDB]">LIVE</span> THE MOMENT.
        </p>
      )}
    </div>
  );
}
