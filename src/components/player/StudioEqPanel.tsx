'use client';

import React, { useState } from 'react';
import { Sliders, Sparkles, RotateCcw, Volume2 } from 'lucide-react';
import { audioDspEngine, FIVE_BAND_FREQUENCIES } from '@/services/audioDspEngine';
import { usePlaybackStore } from '@/store/playback-store';

const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  'Bass Boost': [6, 4, 0, 0, 1],
  Vocal: [-2, 1, 4, 3, 1],
  Electronic: [5, 3, 0, 2, 4],
  Rock: [4, 2, -1, 3, 4],
  'Lo-Fi': [2, 1, 0, -2, -4],
  Podcast: [-3, 2, 4, 1, -2],
};

const SOUNDSTAGE_PRESETS: Record<string, string> = {
  Studio: 'off',
  Concert: 'concert_hall',
  Cinema: 'stereo_expand',
  Night: 'night_mode',
  Focus: 'vocal_boost',
};

export default function StudioEqPanel({ className = '' }: { className?: string }) {
  const { eqPreset, eqGains, setEqPreset, setEqGain, soundstageMode, setSoundstageMode } =
    usePlaybackStore();

  const [preamp, setPreamp] = useState<number>(0);

  const handlePresetSelect = (presetName: string) => {
    const gains = EQ_PRESETS[presetName] || [0, 0, 0, 0, 0];
    setEqPreset(presetName, gains);
    gains.forEach((dB, i) => {
      audioDspEngine.setEqGain(i, dB);
    });
  };

  const handleGainChange = (index: number, dB: number) => {
    setEqGain(index, dB);
    audioDspEngine.setEqGain(index, dB);
  };

  const handleSoundstageSelect = (modeKey: string) => {
    const internalMode = SOUNDSTAGE_PRESETS[modeKey] || 'off';
    setSoundstageMode(modeKey);
    audioDspEngine.setSoundstagePreset(internalMode as any);
  };

  const handleReset = () => {
    handlePresetSelect('Flat');
    handleSoundstageSelect('Studio');
    setPreamp(0);
  };

  return (
    <div className={`flex flex-col h-full w-full p-5 bg-[#07090E]/90 rounded-3xl border border-white/10 text-white select-none overflow-y-auto scrollbar-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#00D9FF]" />
          <span className="text-xs font-mono font-black text-[#00D9FF] uppercase tracking-widest">
            STUDIO EQ & SOUNDSTAGE
          </span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* 1. EQ Presets Pill Switcher */}
      <div className="space-y-2 mb-5">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          PRESETS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(EQ_PRESETS).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetSelect(p)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                eqPreset === p
                  ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 5-Band Equalizer Faders */}
      <div className="space-y-2 mb-6">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          5-BAND FREQUENCY EQUALIZER
        </span>
        <div className="grid grid-cols-5 gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 items-end h-40">
          {FIVE_BAND_FREQUENCIES.map((freq, idx) => {
            const currentGain = eqGains[idx] ?? 0;
            const freqLabel = freq >= 1000 ? `${freq / 1000}kHz` : `${freq}Hz`;

            return (
              <div key={freq} className="flex flex-col items-center gap-2 h-full justify-between">
                <span className="text-[10px] font-mono text-[#00D9FF] font-bold">
                  {currentGain > 0 ? `+${currentGain}` : currentGain}dB
                </span>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={currentGain}
                  onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                  className="h-24 w-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#00D9FF] [writing-mode:vertical-lr] [direction:rtl]"
                />
                <span className="text-[10px] font-mono text-white/50">{freqLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. NEO SOUNDSTAGE Spatial Presets */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#6D3BFF]" />
          <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">
            NEO SOUNDSTAGE SPATIAL PROCESSING
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Object.keys(SOUNDSTAGE_PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => handleSoundstageSelect(key)}
              className={`py-2 text-center rounded-xl text-xs font-black transition-all cursor-pointer ${
                soundstageMode === key
                  ? 'bg-gradient-to-r from-[#6D3BFF] to-[#FF2D9A] text-white shadow-[0_0_12px_rgba(109,59,255,0.4)]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
