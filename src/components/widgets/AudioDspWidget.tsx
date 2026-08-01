'use client';

import React from 'react';
import { Sliders, Zap, Activity, Radio, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlaybackStore } from '@/store/playback-store';

interface AudioDspWidgetProps {
  onOpenEq: () => void;
  onOpenQuality: () => void;
}

export default function AudioDspWidget({ onOpenEq, onOpenQuality }: AudioDspWidgetProps) {
  const { eqPreset, crossfade, audioQuality, isPlaying } = usePlaybackStore();

  return (
    <div className="glass-card-v2 p-5 rounded-[28px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#7A3CFF] to-[#FF2D95] text-white">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">Hardware DSP & Audio Engine</h3>
            <p className="text-[11px] text-white/50">Real-time Web Audio API signal processing</p>
          </div>
        </div>

        <button
          onClick={onOpenEq}
          className="btn-neo-glass px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Sliders className="h-3.5 w-3.5" /> 10-Band EQ
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div 
          onClick={onOpenEq}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <span className="text-[10px] font-mono text-white/40 font-bold block">DSP PRESET</span>
          <span className="text-xs font-black text-[#00D4FF] truncate block">{eqPreset}</span>
        </div>

        <div 
          onClick={onOpenEq}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <span className="text-[10px] font-mono text-white/40 font-bold block">CROSSFADE</span>
          <span className="text-xs font-black text-[#7A3CFF] block">{crossfade}s</span>
        </div>

        <div 
          onClick={onOpenQuality}
          className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center space-y-1 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <span className="text-[10px] font-mono text-white/40 font-bold block">QUALITY</span>
          <span className="text-xs font-black text-[#FF2D95] block">
            {audioQuality === 'lossless' ? 'FLAC' : audioQuality === 'very_high' ? '320k' : audioQuality.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
