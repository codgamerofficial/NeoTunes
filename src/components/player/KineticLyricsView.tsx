'use client';

import React from 'react';
import SynchronizedLyricsView, { LyricLine } from './SynchronizedLyricsView';

export type { LyricLine };
export type LyricMode = 'classic' | 'kinetic';

interface KineticLyricsViewProps {
  lyrics: LyricLine[];
  currentTimeMs: number;
  mode?: LyricMode;
  onModeChange?: (mode: LyricMode) => void;
  onSeek?: (timeSeconds: number) => void;
}

export default function KineticLyricsView({
  lyrics,
  currentTimeMs,
  onSeek,
}: KineticLyricsViewProps) {
  return (
    <SynchronizedLyricsView
      lyrics={lyrics}
      currentTimeMs={currentTimeMs}
      onSeek={onSeek}
    />
  );
}
