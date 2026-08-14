'use client';

import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  Palette,
  Shield,
  Lock,
  Check,
  Radio,
  Sliders,
  Download,
  EyeOff,
  UserCheck,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Moon
} from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function SettingsPage() {
  const {
    audioQuality,
    setAudioQuality,
    crossfade,
    setCrossfade,
    soundstageMode,
    setSoundstageMode,
    eqPreset,
  } = usePlaybackStore();

  const [accentColor, setAccentColor] = useState('#AFC7FF');
  const [gapless, setGapless] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [downloadWifiOnly, setDownloadWifiOnly] = useState(true);
  const [privateSession, setPrivateSession] = useState(false);
  const [oledDark, setOledDark] = useState(true);

  const accentColors = [
    { hex: '#AFC7FF', name: 'Electric Cyan' },
    { hex: '#7A3CFF', name: 'Neon Violet' },
    { hex: '#FF2D95', name: 'Controlled Pink' },
    { hex: '#10B981', name: 'Emerald Wave' },
  ];

  return (
    <FeatureErrorBoundary featureName="Settings">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-[#050507] text-[#F4F1F7] font-sans select-none max-w-4xl mx-auto pb-36">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="h-7 w-7 sm:h-8 sm:w-8 text-[#AFC7FF]" /> Settings &amp; Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A7AF] mt-1">
            Audio quality, Soundstage 3D DSP, appearance, downloads, and privacy controls.
          </p>
        </div>

        {/* ── 1. PLAYBACK & STREAMING ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111217] border border-white/10 space-y-5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#AFC7FF] flex items-center gap-2">
            <Radio className="h-4 w-4" /> Playback &amp; Streaming
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            {/* Streaming Quality */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Audio Streaming Quality</div>
                  <div className="text-[11px] text-[#A8A7AF]">Optimized stream delivery based on source availability</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { id: 'very_high', label: 'Very High Quality', desc: 'Highest available bitrate stream' },
                  { id: 'high', label: 'High Quality', desc: 'Balanced audio and bandwidth' },
                  { id: 'normal', label: 'Data Saver', desc: 'Low bandwidth consumption' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setAudioQuality(q.id as any)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      audioQuality === q.id
                        ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white shadow-[0_0_12px_rgba(175,199,255,0.2)]'
                        : 'bg-[#17191F] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      {q.label}
                      {audioQuality === q.id && <Check className="h-3.5 w-3.5 text-[#AFC7FF]" />}
                    </div>
                    <div className="text-[10px] text-[#A8A7AF] mt-0.5">{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Crossfade Duration */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">Crossfade Songs</div>
                <div className="text-[11px] text-[#A8A7AF]">Smoothly transition between tracks ({crossfade}s)</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={crossfade}
                  onChange={(e) => setCrossfade(parseInt(e.target.value))}
                  className="w-32 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#AFC7FF]"
                />
                <span className="text-xs font-mono font-bold text-[#AFC7FF] w-8 text-right">{crossfade}s</span>
              </div>
            </div>

            {/* Gapless Playback */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Gapless Playback</div>
                <div className="text-[11px] text-[#A8A7AF]">Eliminate silence between album tracks</div>
              </div>
              <button
                onClick={() => setGapless(!gapless)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  gapless ? 'bg-[#AFC7FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  gapless ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Autoplay Similar Tracks */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Autoplay Similar Music</div>
                <div className="text-[11px] text-[#A8A7AF]">Keep playing recommended songs when your queue finishes</div>
              </div>
              <button
                onClick={() => setAutoplay(!autoplay)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoplay ? 'bg-[#AFC7FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  autoplay ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. SOUNDSTAGE & AUDIO ENGINE ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111217] border border-white/10 space-y-5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#AFC7FF] flex items-center gap-2">
            <Sliders className="h-4 w-4" /> Soundstage 3D DSP &amp; Equalizer
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Soundstage Acoustic Environment</div>
                <div className="text-[11px] text-[#A8A7AF]">Current preset: <span className="text-[#AFC7FF] font-bold">{soundstageMode}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Studio Monitor', 'Concert Hall', 'Acoustic Room', 'Bass Arena'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSoundstageMode(mode)}
                  className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    soundstageMode === mode
                      ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white shadow-[0_0_12px_rgba(175,199,255,0.2)]'
                      : 'bg-[#17191F] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. APPEARANCE & THEME ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111217] border border-white/10 space-y-5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#AFC7FF] flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance &amp; Customization
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="space-y-2">
              <div className="text-xs font-bold text-white">Accent Color Theme</div>
              <div className="flex flex-wrap gap-3 pt-1">
                {accentColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => setAccentColor(color.hex)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-[#17191F] hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-bold text-white">{color.name}</span>
                    {accentColor === color.hex && <Check className="h-3.5 w-3.5 text-[#AFC7FF]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Pure OLED Dark Mode</div>
                <div className="text-[11px] text-[#A8A7AF]">Deep black background for AMOLED displays</div>
              </div>
              <button
                onClick={() => setOledDark(!oledDark)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  oledDark ? 'bg-[#AFC7FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  oledDark ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. DOWNLOADS & OFFLINE ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111217] border border-white/10 space-y-5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#AFC7FF] flex items-center gap-2">
            <Download className="h-4 w-4" /> Downloads &amp; Storage
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Download Over Wi-Fi Only</div>
                <div className="text-[11px] text-[#A8A7AF]">Prevent cellular data usage when saving offline tracks</div>
              </div>
              <button
                onClick={() => setDownloadWifiOnly(!downloadWifiOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  downloadWifiOnly ? 'bg-[#AFC7FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  downloadWifiOnly ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. PRIVACY & SECURITY ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111217] border border-white/10 space-y-5">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#AFC7FF] flex items-center gap-2">
            <Lock className="h-4 w-4" /> Privacy &amp; Data
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Private Session Mode</div>
                <div className="text-[11px] text-[#A8A7AF]">Temporarily hide your listening activity from recommendations</div>
              </div>
              <button
                onClick={() => setPrivateSession(!privateSession)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privateSession ? 'bg-[#AFC7FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  privateSession ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">AI Provider Keys</div>
                <div className="text-[11px] text-[#A8A7AF]">Server-side proxy configured securely</div>
              </div>
              <span className="text-xs font-mono font-bold text-[#10B981] px-2.5 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/30">
                ACTIVE &amp; SECURE
              </span>
            </div>
          </div>
        </div>

        {/* ── 6. ABOUT NEOTUNES ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#111217] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#AFC7FF]/10 border border-[#AFC7FF]/30 text-[#AFC7FF] flex items-center justify-center">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">NeoTunes Mobile v2.4.0</div>
              <div className="text-[10px] text-[#A8A7AF]">Engine: Web Audio API 3.0 · Build 2026.08.14</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-white/50 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
            STABLE RELEASE
          </span>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
