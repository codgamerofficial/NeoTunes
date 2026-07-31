'use client';

import React from 'react';
import { Sparkles, Disc, Radio } from 'lucide-react';

interface AudioFormatBadgeProps {
  format: 'dolby' | 'lossless' | 'spatial' | 'flac';
  size?: 'sm' | 'md';
}

export default function AudioFormatBadge({ format, size = 'sm' }: AudioFormatBadgeProps) {
  if (format === 'dolby') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40 tracking-wider shadow-[0_0_10px_rgba(122,60,255,0.2)]">
        <Sparkles className="h-2.5 w-2.5" /> Dolby Atmos
      </span>
    );
  }

  if (format === 'spatial') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 tracking-wider shadow-[0_0_10px_rgba(255,45,149,0.2)]">
        <Radio className="h-2.5 w-2.5" /> Spatial Audio
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40 tracking-wider shadow-[0_0_10px_rgba(0,212,255,0.2)]">
      <Disc className="h-2.5 w-2.5" /> 24-Bit FLAC Lossless
    </span>
  );
}
