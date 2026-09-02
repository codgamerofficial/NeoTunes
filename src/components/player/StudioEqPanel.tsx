'use client';

import React, { useState, useEffect, useId } from 'react';
import { Sliders, Sparkles, RotateCcw, Volume2, ShieldCheck, Activity } from 'lucide-react';
import { audioDspEngine, SEVEN_BAND_FREQUENCIES } from '@/services/audioDspEngine';
import { useSettingsStore } from '@/store/settings-store';
import { NeoButton } from '@/components/ui/NeoButton';

const EQ_PRESETS: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 5, 3, 0, 0, 1, 2],
  'Vocal Clarity': [-2, 0, 2, 4, 3, 1, 0],
  'Rock Drive': [4, 3, 1, -1, 2, 3, 4],
  'Pop Vibrant': [2, 1, 3, 2, 0, 2, 3],
  'Lo-Fi Warmth': [3, 2, 1, 0, -2, -3, -4],
  'Concert Hall': [3, 2, 0, 0, 2, 3, 4],
  'Acoustic Room': [2, 3, 1, 0, 1, 3, 3],
  'Electronic Club': [5, 4, 1, 0, 2, 4, 5],
  'Custom': [0, 0, 0, 0, 0, 0, 0],
};

const FREQ_LABELS = ['60Hz', '150Hz', '400Hz', '1kHz', '2.4kHz', '6kHz', '12kHz'];

export default function StudioEqPanel({ className = '' }: { className?: string }) {
  const gradientId = useId();
  const [activePreset, setActivePreset] = useState<string>('Bass Boost');
  const [gains, setGains] = useState<number[]>([6, 5, 3, 0, 0, 1, 2]);

  const [bass, setBass] = useState<number>(65);
  const [treble, setTreble] = useState<number>(50);
  const [reverb, setReverb] = useState<number>(20);
  const [spatialAudio, setSpatialAudio] = useState<boolean>(true);

  // Sync to DSP Engine on mount & changes
  useEffect(() => {
    audioDspEngine.set7BandEqGains(gains);
  }, [gains]);

  useEffect(() => {
    audioDspEngine.setBassBoost((bass / 100) * 12);
  }, [bass]);

  useEffect(() => {
    audioDspEngine.setTrebleClarity(((treble - 50) / 50) * 8);
  }, [treble]);

  const handlePresetSelect = (presetName: string) => {
    setActivePreset(presetName);
    if (EQ_PRESETS[presetName]) {
      const newGains = [...EQ_PRESETS[presetName]];
      setGains(newGains);
      audioDspEngine.set7BandEqGains(newGains);
    }
  };

  const handleGainChange = (index: number, val: number) => {
    const updated = [...gains];
    updated[index] = val;
    setGains(updated);
    setActivePreset('Custom');
    audioDspEngine.setEqGain(index, val);
  };

  const handleReset = () => {
    handlePresetSelect('Flat');
    setBass(50);
    setTreble(50);
    setReverb(0);
    setSpatialAudio(false);
  };

  // Generate SVG curve points across the 7 frequencies
  // Width: 100%, Height: 80px. Zero line at y = 40.
  const svgWidth = 600;
  const svgHeight = 90;
  const zeroY = svgHeight / 2;

  const points = gains.map((g, idx) => {
    const x = (idx / (gains.length - 1)) * (svgWidth - 60) + 30;
    // Map -12dB -> zeroY + 34, +12dB -> zeroY - 34
    const y = zeroY - (g / 12) * 34;
    return { x, y };
  });

  // Construct smooth SVG cubic path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (pt.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (pt.x - prev.x) / 2;
    const cpY2 = pt.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${pt.x},${pt.y}`;
  }, '');

  const areaPathD = `${pathD} L ${points[points.length - 1].x},${svgHeight} L ${points[0].x},${svgHeight} Z`;

  return (
    <div className={`flex flex-col h-full w-full p-5 sm:p-7 bg-[#0B0D12]/95 backdrop-blur-2xl rounded-3xl border border-white/10 text-white select-none overflow-y-auto scrollbar-none space-y-6 font-sans ${className}`}>
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#DFFF00] text-black shadow-md">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Studio Graphic Equalizer &amp; DSP Engine
            </h3>
            <p className="text-[11px] text-[#9AA1AD] font-medium">
              Real-time 7-band biquad parametric curve &amp; acoustic modeling
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[#9AA1AD] hover:text-white text-xs font-semibold transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Curve
        </button>
      </div>

      {/* 1. Interactive Frequency Response Curve Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[#DFFF00]" /> FREQUENCY RESPONSE CURVE
          </span>
          <span className="text-[10px] font-mono text-[#9AA1AD]">
            ±12dB Headroom • 20Hz–20kHz
          </span>
        </div>

        <div className="relative w-full h-24 sm:h-28 bg-[#11141A] rounded-2xl border border-white/10 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Grid Background Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-20 pointer-events-none">
            <div className="border-b border-dashed border-white/40 w-full" />
            <div className="border-b border-solid border-[#DFFF00]/50 w-full" />
            <div className="border-b border-dashed border-white/40 w-full" />
          </div>

          {/* SVG Response Spline */}
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DFFF00" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill under curve */}
            <path d={areaPathD} fill={`url(#${gradientId})`} />

            {/* Glowing Spline Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#DFFF00"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(223,255,0,0.8)]"
            />

            {/* Frequency Control Points */}
            {points.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#050608"
                stroke="#DFFF00"
                strokeWidth="2"
                className="drop-shadow-[0_0_6px_rgba(223,255,0,0.9)]"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 2. Curated Sound Profiles (Presets) */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-[#9AA1AD] font-bold uppercase tracking-wider block">
          CURATED SOUND PROFILES
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(EQ_PRESETS).map((p) => {
            const isSelected = activePreset === p;
            return (
              <button
                key={p}
                onClick={() => handlePresetSelect(p)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#DFFF00] text-black shadow-[0_4px_16px_rgba(223,255,0,0.35)] scale-105'
                    : 'bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:border-white/20'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 7-Band Vertical Faders */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#9AA1AD] font-bold uppercase tracking-wider block">
            7-BAND FREQUENCY FADERS
          </span>
          <span className="text-[10px] font-mono text-[#DFFF00]">0dB Neutral Center</span>
        </div>

        <div className="grid grid-cols-7 gap-2 bg-[#11141A] p-4 sm:p-5 rounded-3xl border border-white/10 items-end min-h-[200px]">
          {FREQ_LABELS.map((freq, idx) => {
            const currentGain = gains[idx] ?? 0;
            const isBoost = currentGain > 0;
            const isCut = currentGain < 0;

            return (
              <div key={freq} className="flex flex-col items-center justify-between h-full space-y-3">
                {/* Value Pill */}
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                    isBoost
                      ? 'bg-[#DFFF00]/15 text-[#DFFF00] border-[#DFFF00]/30'
                      : isCut
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30'
                      : 'bg-white/5 text-[#9AA1AD] border-white/10'
                  }`}
                >
                  {currentGain > 0 ? `+${currentGain}` : currentGain}
                </span>

                {/* Vertical Slider Track Container */}
                <div className="relative flex items-center justify-center h-32 w-8 group">
                  {/* Center Line Marker (0dB) */}
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/20 z-0 pointer-events-none" />

                  {/* Slider Control */}
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={1}
                    value={currentGain}
                    onChange={(e) => handleGainChange(idx, parseFloat(e.target.value))}
                    aria-label={`${freq} equalizer gain`}
                    className="h-32 w-2 bg-white/10 hover:bg-white/20 rounded-full appearance-none cursor-pointer accent-[#DFFF00] [writing-mode:vertical-lr] [direction:rtl] transition-all z-10"
                  />
                </div>

                {/* Frequency Label */}
                <span className="text-[10px] font-mono font-semibold text-[#9AA1AD]">{freq}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Acoustic Enhancements */}
      <div className="space-y-3 pt-2 border-t border-white/[0.08]">
        <span className="text-[10px] font-mono text-[#9AA1AD] font-bold uppercase tracking-wider block">
          ACOUSTIC MODELING &amp; ENHANCEMENTS
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Sub-Bass Boost */}
          <div className="space-y-2 bg-[#171A21] p-3.5 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-[#DFFF00]" /> Sub-Bass Punch
              </span>
              <span className="text-[#DFFF00] font-mono">{bass}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={bass}
              onChange={(e) => setBass(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-[#DFFF00] cursor-pointer"
            />
          </div>

          {/* Treble Sparkle */}
          <div className="space-y-2 bg-[#171A21] p-3.5 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#00E5FF]" /> Treble Air &amp; Clarity
              </span>
              <span className="text-[#00E5FF] font-mono">{treble}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={treble}
              onChange={(e) => setTreble(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-[#00E5FF] cursor-pointer"
            />
          </div>

          {/* Acoustic Reverb */}
          <div className="space-y-2 bg-[#171A21] p-3.5 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex justify-between items-center text-xs font-bold text-white">
              <span>Room Spatial Reverb</span>
              <span className="text-white/80 font-mono">{reverb}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={reverb}
              onChange={(e) => setReverb(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-white cursor-pointer"
            />
          </div>

          {/* Spatial Soundstage Toggle */}
          <div className="flex items-center justify-between bg-[#171A21] p-3.5 rounded-2xl border border-white/5 shadow-sm">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#DFFF00]" /> Spatial Soundstage
              </span>
              <p className="text-[10px] text-[#9AA1AD] mt-0.5">Expanded 3D soundfield</p>
            </div>
            <button
              onClick={() => setSpatialAudio(!spatialAudio)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                spatialAudio ? 'bg-[#DFFF00]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 left-1 ${
                  spatialAudio ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
