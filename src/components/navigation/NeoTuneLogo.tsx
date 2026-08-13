'use client';

import React from 'react';

export type LogoVariant =
  | 'full'
  | 'primary'
  | 'mark'
  | 'icon'
  | 'symbol'
  | 'wordmark'
  | 'app-icon'
  | 'marketing';

export type LogoTheme = 'dark' | 'light' | 'monochrome-white' | 'monochrome-black';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | number;

export interface NeoTuneLogoProps {
  className?: string;
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize;
  showTagline?: boolean;
  showText?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

// Map sizes to pixel dimensions for symbol
function getSymbolPxSize(size: LogoSize): number {
  if (typeof size === 'number') return size;
  switch (size) {
    case 'sm':
      return 24;
    case 'md':
      return 36;
    case 'lg':
      return 48;
    case 'xl':
      return 64;
    default:
      return 36;
  }
}

// Component 1: Standalone SVG Symbol Mark
export function NeoTunesMark({
  size = 'md',
  theme = 'dark',
  animated = false,
  className = '',
}: {
  size?: LogoSize;
  theme?: LogoTheme;
  animated?: boolean;
  className?: string;
}) {
  const pxSize = getSymbolPxSize(size);
  const gradId = `neotunes-mark-grad-${React.useId().replace(/:/g, '')}`;

  let fillValue = `url(#${gradId})`;
  if (theme === 'monochrome-white' || theme === 'light') {
    fillValue = '#FFFFFF';
  } else if (theme === 'monochrome-black') {
    fillValue = '#000000';
  }

  return (
    <svg
      width={pxSize}
      height={pxSize}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 transition-transform duration-300 ${
        animated ? 'animate-[neotunesPulse_750ms_ease-out]' : ''
      } ${className}`}
      aria-label="NeoTunes Symbol"
    >
      <defs>
        <linearGradient id={gradId} x1="64" y1="448" x2="448" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D9FF" />
          <stop offset="35%" stopColor="#2563FF" />
          <stop offset="70%" stopColor="#6D3BFF" />
          <stop offset="100%" stopColor="#FF2D9A" />
        </linearGradient>
      </defs>
      {/* Compound N Soundwave Path with EvenOdd Play Cutout */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M112 416 V176 C112 127.399 151.399 88 200 88 H204 C228.471 88 251.815 99.277 267.098 118.527 L336 205.419 V160 C336 111.399 375.399 72 424 72 H432 V336 C432 384.601 392.601 424 344 424 H340 C315.529 424 292.185 412.723 276.902 393.473 L208 306.581 V352 C208 400.601 168.601 440 120 440 H112 V416 Z M228 196 V316 L316 256 L228 196 Z"
        fill={fillValue}
      />
    </svg>
  );
}

// Component 2: Wordmark Typography Component
export function NeoTunesWordmark({
  size = 'md',
  theme = 'dark',
  showTagline = false,
  className = '',
}: {
  size?: LogoSize;
  theme?: LogoTheme;
  showTagline?: boolean;
  className?: string;
}) {
  const fontClasses = {
    sm: 'text-base tracking-[0.14em]',
    md: 'text-xl tracking-[0.14em]',
    lg: 'text-2xl tracking-[0.16em]',
    xl: 'text-3xl tracking-[0.18em]',
  }[typeof size === 'string' ? size : 'md'] || 'text-xl tracking-[0.14em]';

  const taglineClasses = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9px] tracking-[0.24em]',
    lg: 'text-[10px] tracking-[0.26em]',
    xl: 'text-[11px] tracking-[0.28em]',
  }[typeof size === 'string' ? size : 'md'] || 'text-[9px] tracking-[0.24em]';

  const neoTextColor =
    theme === 'monochrome-black' || theme === 'light' ? 'text-[#0A0D14]' : 'text-white';

  return (
    <div className={`flex flex-col justify-center leading-none ${className}`}>
      <div className={`font-black uppercase font-sans select-none flex items-center ${fontClasses}`}>
        <span className={neoTextColor}>NEO</span>
        <span className="ml-[2px] bg-gradient-to-r from-[#00D9FF] via-[#6D3BFF] to-[#FF2D9A] bg-clip-text text-transparent">
          TUNES
        </span>
      </div>
      {showTagline && (
        <span className={`font-bold uppercase mt-1 bg-gradient-to-r from-[#00D9FF] to-[#6D3BFF] bg-clip-text text-transparent ${taglineClasses}`}>
          FEEL EVERY BEAT
        </span>
      )}
    </div>
  );
}

// Component 3: Squircle App Icon Container
export function NeoTunesAppIcon({
  size = 64,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center rounded-[22%] bg-[#07090E] border border-white/10 shadow-lg overflow-hidden shrink-0 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.25)_0%,rgba(109,59,255,0.15)_60%,transparent_100%)] pointer-events-none" />
      <NeoTunesMark size={size * 0.65} />
    </div>
  );
}

// Component 4: Unified NeoTuneLogo Main Component
export default function NeoTuneLogo({
  className = '',
  variant = 'full',
  theme = 'dark',
  size = 'md',
  showTagline = false,
  showText = true,
  animated = false,
  onClick,
}: NeoTuneLogoProps) {
  // Backwards compatibility handling
  const isMarkOnly =
    variant === 'mark' || variant === 'icon' || variant === 'symbol' || (!showText && variant !== 'wordmark');

  if (variant === 'app-icon') {
    const numericSize = typeof size === 'number' ? size : getSymbolPxSize(size) * 1.6;
    return (
      <div onClick={onClick} className={`cursor-pointer inline-block ${className}`}>
        <NeoTunesAppIcon size={numericSize} />
      </div>
    );
  }

  if (isMarkOnly) {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 ${className}`}
      >
        <NeoTunesMark size={size} theme={theme} animated={animated} />
      </div>
    );
  }

  if (variant === 'wordmark') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center cursor-pointer select-none ${className}`}
      >
        <NeoTunesWordmark size={size} theme={theme} showTagline={showTagline} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer select-none group transition-transform duration-300 hover:scale-[1.02] ${className}`}
    >
      <div className="mr-3 transition-shadow duration-300 group-hover:drop-shadow-[0_0_12px_rgba(0,217,255,0.35)]">
        <NeoTunesMark size={size} theme={theme} animated={animated} />
      </div>
      {showText && (
        <NeoTunesWordmark size={size} theme={theme} showTagline={showTagline} />
      )}
    </div>
  );
}
