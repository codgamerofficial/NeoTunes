'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Radio,
  Sliders,
  Palette,
  Download,
  Lock,
  Info,
  Check,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useSettingsStore, AudioQuality, SoundstagePreset, AccentColor } from '@/store/settings-store';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function SettingsPage() {
  const router = useRouter();
  const {
    audioQuality,
    setAudioQuality,
    crossfadeEnabled,
    setCrossfadeEnabled,
    crossfadeDuration,
    setCrossfadeDuration,
    gaplessPlayback,
    setGaplessPlayback,
    autoplay,
    setAutoplay,
    soundstagePreset,
    setSoundstagePreset,
    accentColor,
    setAccentColor,
    oledDarkMode,
    setOledDarkMode,
    downloadWifiOnly,
    setDownloadWifiOnly,
    privateSession,
    setPrivateSession,
    resetSettings,
  } = useSettingsStore();

  const accentColors: Array<{ id: AccentColor; hex: string; name: string }> = [
    { id: 'cyan', hex: '#00D4FF', name: 'Electric Cyan' },
    { id: 'violet', hex: '#7A3CFF', name: 'Neon Violet' },
    { id: 'pink', hex: '#FF2D95', name: 'Controlled Pink' },
    { id: 'emerald', hex: '#10B981', name: 'Emerald Wave' },
  ];

  return (
    <FeatureErrorBoundary featureName="Settings">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F5] font-sans select-none max-w-4xl mx-auto pb-36 relative z-10">
        
        {/* Header */}
        <div className="border-b border-[#292929] pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111111] border border-[#292929] text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
            <Settings className="h-3.5 w-3.5 text-[#DFFF00]" /> NEOTUNES N/OS // SYSTEM PREFERENCES
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3 font-mono">
            Settings &amp; System Configuration
          </h1>
          <p className="text-xs sm:text-sm text-[#A0A0A0]">
            Audio streaming quality, Soundstage DSP, appearance tokens, local storage, and privacy controls.
          </p>
        </div>

        {/* ── 1. PLAYBACK & STREAMING (Specs 2-5) ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-5 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF] flex items-center gap-2">
            <Radio className="h-4 w-4" /> Playback &amp; Streaming
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            {/* Streaming Quality */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Audio Streaming Quality</div>
                  <div className="text-[11px] text-white/60">Optimized stream delivery based on source availability</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { id: 'very_high', label: 'Very High Quality', desc: 'Highest available bitrate stream' },
                  { id: 'high', label: 'High Quality', desc: 'Balanced audio and bandwidth' },
                  { id: 'data_saver', label: 'Data Saver', desc: 'Low bandwidth consumption' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setAudioQuality(q.id as AudioQuality)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                      audioQuality === q.id
                        ? 'bg-[#00D4FF]/15 border-[#00D4FF] text-white shadow-[0_0_12px_rgba(0,214,255,0.25)]'
                        : 'bg-[#111524] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      {q.label}
                      {audioQuality === q.id && <Check className="h-3.5 w-3.5 text-[#00D4FF]" />}
                    </div>
                    <div className="text-[10px] text-white/60 mt-0.5">{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Crossfade Duration */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white">Crossfade Songs</div>
                <div className="text-[11px] text-white/60">Smoothly transition between tracks ({crossfadeDuration}s)</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={crossfadeDuration}
                  onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
                  className="w-32 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#00D4FF]"
                />
                <span className="text-xs font-mono font-bold text-[#00D4FF] w-8 text-right">{crossfadeDuration}s</span>
              </div>
            </div>

            {/* Gapless Playback */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Gapless Playback</div>
                <div className="text-[11px] text-white/60">Eliminate silence between album tracks</div>
              </div>
              <button
                onClick={() => setGaplessPlayback(!gaplessPlayback)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  gaplessPlayback ? 'bg-[#00D4FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  gaplessPlayback ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Autoplay Similar Tracks */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Autoplay Similar Music</div>
                <div className="text-[11px] text-white/60">Keep playing recommended songs when your queue finishes</div>
              </div>
              <button
                onClick={() => setAutoplay(!autoplay)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoplay ? 'bg-[#00D4FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  autoplay ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. SOUNDSTAGE & AUDIO ENGINE (Specs 6, 7, 8) ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-5 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF] flex items-center gap-2">
            <Sliders className="h-4 w-4" /> Soundstage 3D DSP &amp; Equalizer
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Soundstage Acoustic Environment</div>
                <div className="text-[11px] text-white/60">Current preset: <span className="text-[#00D4FF] font-bold capitalize">{soundstagePreset}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'studio', label: 'Studio Monitor' },
                { id: 'concert', label: 'Concert Hall' },
                { id: 'acoustic', label: 'Acoustic Room' },
                { id: 'bass', label: 'Bass Arena' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSoundstagePreset(mode.id as SoundstagePreset)}
                  className={`p-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    soundstagePreset === mode.id
                      ? 'bg-[#00D4FF]/15 border-[#00D4FF] text-white shadow-[0_0_12px_rgba(0,214,255,0.25)]'
                      : 'bg-[#111524] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3. APPEARANCE & THEME (Specs 9, 10) ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-5 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF] flex items-center gap-2">
            <Palette className="h-4 w-4" /> Appearance &amp; Customization
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="space-y-2">
              <div className="text-xs font-bold text-white">Accent Color Theme</div>
              <div className="flex flex-wrap gap-3 pt-1">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-[#111524] hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="text-xs font-bold text-white">{color.name}</span>
                    {accentColor === color.id && <Check className="h-3.5 w-3.5 text-[#00D4FF]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Pure OLED Dark Mode</div>
                <div className="text-[11px] text-white/60">Deep black background for AMOLED displays</div>
              </div>
              <button
                onClick={() => setOledDarkMode(!oledDarkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  oledDarkMode ? 'bg-[#00D4FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  oledDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. DOWNLOADS & STORAGE (Specs 13, 14, 15) ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-5 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF] flex items-center gap-2">
            <Download className="h-4 w-4" /> Downloads &amp; Storage
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Download Over Wi-Fi Only</div>
                <div className="text-[11px] text-white/60">Prevent cellular data usage when saving offline tracks</div>
              </div>
              <button
                onClick={() => setDownloadWifiOnly(!downloadWifiOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  downloadWifiOnly ? 'bg-[#00D4FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  downloadWifiOnly ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. PRIVACY & TRUTHFUL STATUS (Specs 16, 17, 20, 21) ── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0D101C]/90 border border-white/10 space-y-5 shadow-xl">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#00D4FF] flex items-center gap-2">
            <Lock className="h-4 w-4" /> Privacy &amp; Data
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Private Session Mode</div>
                <div className="text-[11px] text-white/60">Temporarily hide your listening activity from recommendations</div>
              </div>
              <button
                onClick={() => setPrivateSession(!privateSession)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privateSession ? 'bg-[#00D4FF]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  privateSession ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Truthful AI Status (Spec 20 & 21) */}
            <div className="pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">AI Assistant &amp; Recommendations</div>
                <div className="text-[11px] text-white/60">Server-side proxy configured securely</div>
              </div>
              <span className="text-xs font-mono font-bold text-[#00D4FF] px-3 py-1 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30">
                Server-Side Proxy
              </span>
            </div>
          </div>
        </div>

        {/* ── 6. RESET & ABOUT ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#0D101C]/90 border border-white/10 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] flex items-center justify-center">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">NeoTunes System v2.5.0</div>
              <div className="text-[10px] text-white/60">Web Audio Engine · Canonical Resolution Active</div>
            </div>
          </div>

          <button
            onClick={resetSettings}
            className="px-4 py-2 rounded-full border border-white/10 hover:border-red-400 text-xs font-bold text-white/70 hover:text-red-400 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Preferences
          </button>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
