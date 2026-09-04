'use client';

import React from 'react';
import { ArtworkColorTheme } from '@/utils/artworkColorTheme';

interface ArtworkAmbientBackgroundProps {
  artworkUrl?: string | null;
  theme: ArtworkColorTheme;
}

export default function ArtworkAmbientBackground({
  artworkUrl,
  theme,
}: ArtworkAmbientBackgroundProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* Layer 1: Base Atmospheric Gradient (Top dark vignette -> middle ambient -> deep bottom base) */}
      <div
        className="absolute inset-0 transition-colors duration-1000 ease-out"
        style={{
          background: `linear-gradient(180deg, ${theme.backgroundTone} 0%, ${theme.secondaryAmbient} 40%, ${theme.backgroundTone} 100%)`,
        }}
      />

      {/* Layer 2: Radial Artwork Color Burst (Simulating ambient light bleed) */}
      <div
        className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140vw] max-w-[900px] h-[65vh] rounded-full filter blur-[100px] opacity-45 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${theme.primaryAmbient} 0%, ${theme.secondaryAmbient} 45%, transparent 75%)`,
        }}
      />

      {/* Layer 3: Low-frequency heavily blurred artwork color cloud */}
      {artworkUrl && (
        <div
          className="absolute top-0 left-0 right-0 h-[65vh] bg-cover bg-center filter blur-[130px] opacity-25 scale-110 pointer-events-none transition-all duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}

      {/* Layer 4: Dark Vignette & Edge Shadow for Maximum Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/85 pointer-events-none" />

      {/* Layer 5: Subtle Noise/Grain texture overlay for analog depth */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
