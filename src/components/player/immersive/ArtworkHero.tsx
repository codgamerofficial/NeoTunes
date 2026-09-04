'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Track } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { ArtworkColorTheme } from '@/utils/artworkColorTheme';

interface ArtworkHeroProps {
  track: Track;
  theme: ArtworkColorTheme;
  isDesktop?: boolean;
  className?: string;
}

export default function ArtworkHero({
  track,
  theme,
  isDesktop = false,
  className = '',
}: ArtworkHeroProps) {
  const artworkUrl = resolveArtwork(track);

  return (
    <div
      className={`relative w-full flex-1 min-h-0 flex items-center justify-center px-4 sm:px-6 overflow-hidden select-none ${className}`}
    >
      {/* Ambient halo glow directly beneath the artwork */}
      <div
        className="absolute w-[80%] aspect-square rounded-full filter blur-[50px] opacity-40 pointer-events-none transition-all duration-700 -z-10"
        style={{
          background: theme.glowColor,
        }}
      />

      {/* Main Square Artwork Container */}
      <motion.div
        key={track.id || track.canonicalId}
        initial={{ opacity: 0.85, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className={`relative aspect-square rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)] border border-white/10 ${
          isDesktop
            ? 'w-[clamp(340px,38vw,520px)] max-w-[520px] max-h-[520px]'
            : 'w-full max-w-[min(88vw,calc(100dvh-395px),420px)] max-h-[min(88vw,calc(100dvh-395px),420px)]'
        }`}
      >
        <Artwork
          source={artworkUrl}
          size="full"
          alt={track.title}
          canonicalId={track.id}
          type="track"
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
        />

        {/* Soft bottom edge gradient fade matching ambient color */}
        <div
          className="absolute inset-x-0 bottom-0 h-24 sm:h-32 pointer-events-none transition-all duration-700 opacity-60"
          style={{
            background: `linear-gradient(to top, ${theme.secondaryAmbient} 0%, transparent 100%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
