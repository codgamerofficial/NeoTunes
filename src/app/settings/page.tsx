'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Radio,
  Sliders,
  Palette,
  Download,
  Lock,
  Info,
  Check,
  ChevronRight,
  Sparkles,
  Shield,
  Volume2,
  Bell,
  Moon,
  Trash2,
  RefreshCw
} from 'lucide-react';
import SpiderSuitToggle from '@/components/navigation/SpiderSuitToggle';
import { useSettingsStore, AudioQuality, SoundstagePreset, AccentColor } from '@/store/settings-store';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { GlassCard } from '@/components/ui/GlassCard';

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

  const [showQualitySheet, setShowQualitySheet] = useState(false);
  const [showDspSheet, setShowDspSheet] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const qualityLabels: Record<AudioQuality, string> = {
    very_high: 'Very High (320 kbps)',
    high: 'High (256 kbps)',
    data_saver: 'Data Saver (128 kbps)',
  };

  const dspLabels: Record<SoundstagePreset, string> = {
    studio: 'Studio Monitor',
    concert: 'Concert Hall',
    acoustic: 'Acoustic Room',
    bass: 'Bass Arena',
  };

  return (
    <FeatureErrorBoundary featureName="Settings">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none max-w-4xl mx-auto pb-44 md:pb-28 min-h-screen">
        
        {/* Header */}
        <div className="border-b border-white/10 pb-4 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="h-6 w-6 text-[#DFFF00]" /> Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6]">
            Playback, audio DSP, themes, local downloads, and privacy controls.
          </p>
        </div>

        {/* ── 1. PLAYBACK SECTION ── */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-2">PLAYBACK</span>
          
          <div className="rounded-2xl bg-white/[0.045] border border-white/10 divide-y divide-white/5 overflow-hidden">
            {/* Audio Streaming Quality */}
            <div
              onClick={() => setShowQualitySheet(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">Streaming Audio Quality</div>
                  <div className="text-[11px] text-[#A1A1A6]">Optimized stream bitrate delivery</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#DFFF00] font-bold">{qualityLabels[audioQuality]}</span>
                <ChevronRight className="h-4 w-4 text-[#A1A1A6]" />
              </div>
            </div>

            {/* Autoplay Similar Music */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00D9FF]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Autoplay Similar Music</div>
                  <div className="text-[11px] text-[#A1A1A6]">Play recommended tracks when your queue ends</div>
                </div>
              </div>
              <button
                onClick={() => setAutoplay(!autoplay)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoplay ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  autoplay ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Crossfade Duration */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Crossfade Songs</div>
                    <div className="text-[11px] text-[#A1A1A6]">Smoothly blend track transitions</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#DFFF00] font-bold">{crossfadeDuration}s</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                value={crossfadeDuration}
                onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#DFFF00]"
              />
            </div>

            {/* Gapless Playback */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00D9FF]">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Gapless Playback</div>
                  <div className="text-[11px] text-[#A1A1A6]">Eliminate silence between consecutive album tracks</div>
                </div>
              </div>
              <button
                onClick={() => setGaplessPlayback(!gaplessPlayback)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  gaplessPlayback ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  gaplessPlayback ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. AUDIO & DSP SECTION ── */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-2">AUDIO &amp; SOUNDSTAGE DSP</span>
          
          <div className="rounded-2xl bg-white/[0.045] border border-white/10 divide-y divide-white/5 overflow-hidden">
            <div
              onClick={() => setShowDspSheet(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">Soundstage Spatial Preset</div>
                  <div className="text-[11px] text-[#A1A1A6]">Acoustic room &amp; frequency response curve</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#DFFF00] font-bold">{dspLabels[soundstagePreset]}</span>
                <ChevronRight className="h-4 w-4 text-[#A1A1A6]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. DOWNLOADS & STORAGE SECTION ── */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-2">DOWNLOADS &amp; STORAGE</span>
          
          <div className="rounded-2xl bg-white/[0.045] border border-white/10 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00D9FF]">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Download Over Wi-Fi Only</div>
                  <div className="text-[11px] text-[#A1A1A6]">Prevent cellular data usage when caching tracks</div>
                </div>
              </div>
              <button
                onClick={() => setDownloadWifiOnly(!downloadWifiOnly)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  downloadWifiOnly ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  downloadWifiOnly ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div
              onClick={() => router.push('/downloads')}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">Offline Downloads Storage</div>
                  <div className="text-[11px] text-[#A1A1A6]">Manage cached tracks &amp; FLAC files</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#A1A1A6]" />
            </div>
          </div>
        </div>

        {/* ── 4. APPEARANCE SECTION ── */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-2">APPEARANCE &amp; THEMES</span>
          
          <div className="rounded-2xl bg-white/[0.045] border border-white/10 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">NeoThemes &amp; Dimension Suits</div>
                  <div className="text-[11px] text-[#A1A1A6]">Customize the visual theme aesthetic</div>
                </div>
              </div>
              <SpiderSuitToggle />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00D9FF]">
                  <Moon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Pure OLED Dark Mode</div>
                  <div className="text-[11px] text-[#A1A1A6]">Pure black background for AMOLED displays</div>
                </div>
              </div>
              <button
                onClick={() => setOledDarkMode(!oledDarkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  oledDarkMode ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  oledDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 5. PRIVACY SECTION ── */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-2">PRIVACY &amp; SECURITY</span>
          
          <div className="rounded-2xl bg-white/[0.045] border border-white/10 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Private Listening Session</div>
                  <div className="text-[11px] text-[#A1A1A6]">Pause listening history and stats tracking</div>
                </div>
              </div>
              <button
                onClick={() => setPrivateSession(!privateSession)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privateSession ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  privateSession ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── 6. RESET & ABOUT SECTION ── */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider px-2">SYSTEM &amp; ABOUT</span>
          
          <div className="rounded-2xl bg-white/[0.045] border border-white/10 divide-y divide-white/5 overflow-hidden">
            <div
              onClick={() => setShowResetConfirm(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-red-400">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-red-400">Reset All Settings</div>
                  <div className="text-[11px] text-[#A1A1A6]">Restore factory default playback preferences</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#A1A1A6]" />
            </div>

            <div className="p-4 flex items-center justify-between text-xs text-[#A1A1A6]">
              <span className="font-mono">NeoTunes Engine Version</span>
              <span className="font-mono text-white font-bold">2.4.0 (N/OS High-Res)</span>
            </div>
          </div>
        </div>

        {/* QUALITY SELECTION BOTTOM SHEET */}
        {showQualitySheet && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0A0D16] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Select Audio Quality</h3>
                <button onClick={() => setShowQualitySheet(false)} className="p-1 rounded-full text-[#A1A1A6] hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'very_high', label: 'Very High Quality', desc: '320 kbps High-Res AAC' },
                  { id: 'high', label: 'High Quality', desc: '256 kbps Balanced Stream' },
                  { id: 'data_saver', label: 'Data Saver', desc: '128 kbps Low Bandwidth' },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setAudioQuality(q.id as AudioQuality);
                      setShowQualitySheet(false);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      audioQuality === q.id
                        ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-white'
                        : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{q.label}</div>
                      <div className="text-[10px] text-[#A1A1A6] mt-0.5">{q.desc}</div>
                    </div>
                    {audioQuality === q.id && <Check className="h-4 w-4 text-[#DFFF00]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DSP SELECTION BOTTOM SHEET */}
        {showDspSheet && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0A0D16] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white">Soundstage Spatial Preset</h3>
                <button onClick={() => setShowDspSheet(false)} className="p-1 rounded-full text-[#A1A1A6] hover:text-white">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'studio', label: 'Studio Monitor' },
                  { id: 'concert', label: 'Concert Hall' },
                  { id: 'acoustic', label: 'Acoustic Room' },
                  { id: 'bass', label: 'Bass Arena' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSoundstagePreset(mode.id as SoundstagePreset);
                      setShowDspSheet(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      soundstagePreset === mode.id
                        ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-white'
                        : 'bg-white/5 border-white/10 text-[#A1A1A6] hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESET CONFIRMATION SHEET */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0A0D16] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl text-center">
              <div className="p-3 rounded-full bg-red-500/10 text-red-400 w-12 h-12 mx-auto flex items-center justify-center">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Reset All Settings?</h3>
              <p className="text-xs text-[#A1A1A6]">
                This will restore audio quality, DSP presets, and preferences back to factory defaults.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetSettings();
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-red-500 text-black text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-400"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
