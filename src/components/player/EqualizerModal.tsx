'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Zap, Volume2, RotateCcw } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { audioDspEngine } from '@/services/audioDspEngine';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EQ_BANDS = ['60Hz', '170Hz', '310Hz', '600Hz', '1kHz', '3kHz', '6kHz', '12kHz', '14kHz', '16kHz'];

const EQ_PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 6, 4, 2, 0, 0, 1, 2, 3, 4],
  'Vocal Boost': [-2, -1, 0, 3, 6, 6, 4, 2, 0, -1],
  'Treble Boost': [-2, -1, 0, 0, 2, 4, 6, 8, 9, 10],
  'Electronic': [6, 5, 2, 0, -2, 2, 4, 6, 5, 4],
  'Pop': [-1, 2, 5, 6, 4, 0, -1, -2, -2, -1],
  'Rock': [5, 4, 2, 0, -1, 1, 3, 5, 6, 6],
  'Acoustic': [4, 3, 1, 2, 2, 3, 4, 4, 3, 2],
};

export default function EqualizerModal({ isOpen, onClose }: EqualizerModalProps) {
  const {
    eqPreset,
    eqGains,
    setEqPreset,
    setEqGain,
    crossfade,
    setCrossfade,
    playbackRate,
    setPlaybackRate,
  } = usePlaybackStore();

  const handlePresetSelect = (presetKey: string, gains: number[]) => {
    setEqPreset(presetKey, gains);
    audioDspEngine.setEqGains(gains);
  };

  const handleGainChange = (bandIdx: number, dB: number) => {
    setEqGain(bandIdx, dB);
    const updatedGains = [...eqGains];
    updatedGains[bandIdx] = dB;
    audioDspEngine.setEqGains(updatedGains);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-[#0A0A0F]/98 border border-[#7A3CFF]/30 rounded-[28px] shadow-[0_0_80px_rgba(122,60,255,0.2)] flex flex-col overflow-hidden p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-[#7A3CFF] to-[#FF2D95] shadow-lg">
                <Sliders className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  Studio Equalizer & Audio FX
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/30">
                    10-BAND EQ
                  </span>
                </h2>
                <p className="text-xs text-white/40">Spotify-Grade Hardware DSP & Audio Processing</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Presets Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white/60">
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-[#00D4FF]" /> Equalizer Presets</span>
              <button 
                onClick={() => handlePresetSelect('Flat', EQ_PRESETS['Flat'])}
                className="text-[11px] text-white/40 hover:text-[#00D4FF] flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset Flat
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {Object.keys(EQ_PRESETS).map((presetKey) => (
                <button
                  key={presetKey}
                  onClick={() => handlePresetSelect(presetKey, EQ_PRESETS[presetKey])}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    eqPreset === presetKey
                      ? 'bg-gradient-to-r from-[#7A3CFF] to-[#FF2D95] text-white shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {presetKey}
                </button>
              ))}
            </div>
          </div>

          {/* 10-Band Sliders */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 items-end h-44 pt-4 pb-2">
              {EQ_BANDS.map((bandLabel, idx) => {
                const gainVal = eqGains[idx] || 0;
                return (
                  <div key={bandLabel} className="flex flex-col items-center gap-2 h-full justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#00D4FF]">
                      {gainVal > 0 ? `+${gainVal}` : gainVal}dB
                    </span>
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={1}
                      value={gainVal}
                      onChange={(e) => handleGainChange(idx, parseInt(e.target.value))}
                      className="h-28 w-1.5 appearance-none bg-white/10 rounded-full cursor-pointer accent-[#7A3CFF] write-vertical-slider"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                    <span className="text-[9px] font-mono text-white/40 truncate">{bandLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crossfade & Playback Speed Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crossfade */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5"><Volume2 className="h-3.5 w-3.5 text-[#FF2D95]" /> Crossfade</span>
                <span className="text-xs font-mono text-[#FF2D95] font-bold">{crossfade}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={crossfade}
                onChange={(e) => setCrossfade(parseInt(e.target.value))}
                className="w-full h-1.5 appearance-none bg-white/10 rounded-full accent-[#FF2D95] cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/30">
                <span>Off (0s)</span>
                <span>Gapless (3s)</span>
                <span>Max (12s)</span>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Playback Speed</span>
                <span className="text-xs font-mono text-[#00D4FF] font-bold">{playbackRate}x</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                      playbackRate === rate
                        ? 'bg-[#00D4FF] text-black font-black'
                        : 'bg-white/5 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
