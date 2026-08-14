'use client';

import React, { useState } from 'react';
import { Sliders, Sparkles, RotateCcw } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 3, 0, 0, 1, 2],
  Vocal: [-2, 0, 2, 4, 3, 1, 0],
  Rock: [4, 3, 1, -1, 2, 3, 4],
  Pop: [2, 1, 3, 2, 0, 2, 3],
  'Lo-Fi': [3, 2, 1, 0, -2, -3, -4],
  Classical: [3, 2, 0, 0, 2, 3, 4],
  Custom: [0, 0, 0, 0, 0, 0, 0],
};

const FREQ_LABELS = ['60Hz', '150Hz', '400Hz', '1kHz', '2.4kHz', '6kHz', '12kHz'];

export default function StudioEqPanel({ className = '' }: { className?: string }) {
  const [activePreset, setActivePreset] = useState<string>('Bass Boost');
  const [gains, setGains] = useState<number[]>([6, 5, 3, 0, 0, 1, 2]);

  const [bass, setBass] = useState<number>(65);
  const [treble, setTreble] = useState<number>(50);
  const [reverb, setReverb] = useState<number>(20);
  const [spatialAudio, setSpatialAudio] = useState<boolean>(true);

  const handlePresetSelect = (presetName: string) => {
    setActivePreset(presetName);
    if (EQ_PRESETS[presetName]) {
      setGains([...EQ_PRESETS[presetName]]);
    }
  };

  const handleGainChange = (index: number, val: number) => {
    const updated = [...gains];
    updated[index] = val;
    setGains(updated);
    setActivePreset('Custom');
  };

  const handleReset = () => {
    handlePresetSelect('Flat');
    setBass(50);
    setTreble(50);
    setReverb(0);
    setSpatialAudio(false);
  };

  return (
    <div className={`flex flex-col h-full w-full p-4 sm:p-5 bg-[#07090E]/90 backdrop-blur-2xl rounded-3xl border border-white/10 text-white select-none overflow-y-auto scrollbar-none space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#00D4FF]" />
          <span className="text-xs font-mono font-black text-[#00D4FF] uppercase tracking-widest">
            STUDIO EQ & AUDIO PROCESSING
          </span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* 1. Presets */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          PRESETS
        </span>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(EQ_PRESETS).map((p) => (
            <button
              key={p}
              onClick={() => handlePresetSelect(p)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activePreset === p
                  ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,214,255,0.4)]'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 7-Band Equalizer */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          7-BAND EQUALIZER
        </span>
        <div className="grid grid-cols-7 gap-1.5 bg-black/50 p-3 rounded-2xl border border-white/10 items-end h-40">
          {FREQ_LABELS.map((freq, idx) => {
            const currentGain = gains[idx] ?? 0;
            return (
              <div key={freq} className="flex flex-col items-center gap-2 h-full justify-between">
                <span className="text-[9px] font-mono text-[#00D4FF] font-bold">
                  {currentGain > 0 ? `+${currentGain}` : currentGain}dB
                </span>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={currentGain}
                  onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                  className="h-24 w-1 bg-white/15 rounded-full appearance-none cursor-pointer accent-[#00D4FF] [writing-mode:vertical-lr] [direction:rtl]"
                />
                <span className="text-[9px] font-mono text-white/50">{freq}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Extra Sliders: Bass, Treble, Reverb, Spatial Audio */}
      <div className="space-y-3 pt-1 border-t border-white/10">
        <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider block">
          ENHANCEMENTS
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs font-bold">
              <span>Bass Boost</span>
              <span className="text-[#00D4FF]">{bass}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={bass}
              onChange={(e) => setBass(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#00D4FF]"
            />
          </div>

          <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs font-bold">
              <span>Treble</span>
              <span className="text-[#00D4FF]">{treble}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={treble}
              onChange={(e) => setTreble(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#00D4FF]"
            />
          </div>

          <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between text-xs font-bold">
              <span>Reverb</span>
              <span className="text-[#00D4FF]">{reverb}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={reverb}
              onChange={(e) => setReverb(Number(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#00D4FF]"
            />
          </div>

          <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
            <span className="text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" /> Spatial Audio
            </span>
            <button
              onClick={() => setSpatialAudio(!spatialAudio)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                spatialAudio ? 'bg-[#00D4FF]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-black transition-transform absolute top-0.75 left-0.75 ${
                  spatialAudio ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
