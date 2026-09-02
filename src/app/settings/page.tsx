'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings as SettingsIcon, 
  Volume2, 
  Radio, 
  Sparkles, 
  Sliders, 
  Download, 
  Palette, 
  Moon, 
  Shield, 
  RotateCcw, 
  ChevronRight, 
  Check, 
  X,
  HardDrive,
  CheckCircle2
} from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { useSettingsStore, AudioQuality, SoundstagePreset } from '@/store/settings-store';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { useToast } from '@/components/ui/NeoToast';
import EqualizerModal from '@/components/player/EqualizerModal';
import StudioEqPanel from '@/components/player/StudioEqPanel';

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const {
    audioQuality,
    setAudioQuality,
    autoplay,
    setAutoplay,
    crossfadeDuration,
    setCrossfadeDuration,
    gaplessPlayback,
    setGaplessPlayback,
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

  const [showEqModal, setShowEqModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const qualityLabels: Record<AudioQuality, string> = {
    very_high: 'Very High (320 kbps Lossless)',
    high: 'High (256 kbps AAC)',
    data_saver: 'Data Saver (128 kbps Opus)',
  };

  const soundstageLabels: Record<SoundstagePreset, string> = {
    studio: 'Studio Monitor',
    concert: 'Concert Hall',
    acoustic: 'Acoustic Room',
    bass: 'Bass Arena',
  };

  const accentColors = [
    { name: 'Electric Lime', hex: '#DFFF00' },
    { name: 'Cyan Glow', hex: '#00E5FF' },
    { name: 'Neon Rose', hex: '#FF2D95' },
    { name: 'Cyber Violet', hex: '#9D4EDD' },
  ];

  const handleClearCache = () => {
    try {
      localStorage.removeItem('neotunes_recent_searches');
      showToast('Cache and temporary search data cleared');
    } catch {
      showToast('Error clearing cache', 'error');
    }
  };

  const handleConfirmReset = () => {
    resetSettings();
    setShowResetConfirm(false);
    showToast('All settings restored to defaults');
  };

  return (
    <FeatureErrorBoundary featureName="Settings">
      <div className="p-4 sm:p-6 md:p-8 space-y-6 text-[#F5F7FA] font-sans select-none max-w-4xl mx-auto pb-44 md:pb-28 min-h-screen">
        
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="h-6 w-6 text-[#DFFF00]" /> Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] font-medium">
            Customize your audio engine, playback options, and application preferences.
          </p>
        </div>

        {/* ── 1. PLAYBACK & AUDIO STREAMING ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[#DFFF00]" /> Playback &amp; Audio Quality
          </h2>

          <NeoCard className="p-4 sm:p-5 space-y-4 divide-y divide-white/[0.06]">
            
            {/* Streaming Quality */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">Streaming Audio Quality</div>
                  <div className="text-[11px] text-[#9AA1AD]">Set default stream bitrate and audio resolution</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {(['very_high', 'high', 'data_saver'] as AudioQuality[]).map((q) => {
                  const isSelected = audioQuality === q;
                  return (
                    <button
                      key={q}
                      onClick={() => setAudioQuality(q)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#171A21] border-[#DFFF00] text-white shadow-sm'
                          : 'bg-white/[0.02] border-white/5 text-[#9AA1AD] hover:text-white hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{qualityLabels[q].split(' ')[0]}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#DFFF00]" />}
                      </div>
                      <div className="text-[10px] text-[#9AA1AD] mt-1">{qualityLabels[q]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gapless Playback */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Gapless Playback</div>
                <div className="text-[11px] text-[#9AA1AD]">Eliminate silence between consecutive album tracks</div>
              </div>
              <input
                type="checkbox"
                checked={gaplessPlayback}
                onChange={(e) => setGaplessPlayback(e.target.checked)}
                className="w-5 h-5 accent-[#DFFF00] cursor-pointer rounded"
                aria-label="Gapless Playback"
              />
            </div>

            {/* Autoplay */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Autoplay Recommended Music</div>
                <div className="text-[11px] text-[#9AA1AD]">Continue playing similar music when queue ends</div>
              </div>
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
                className="w-5 h-5 accent-[#DFFF00] cursor-pointer rounded"
                aria-label="Autoplay"
              />
            </div>

            {/* Crossfade Duration */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">Crossfade Duration</div>
                  <div className="text-[11px] text-[#9AA1AD]">Seamless transition between tracks</div>
                </div>
                <span className="text-xs font-mono font-bold text-[#DFFF00]">{crossfadeDuration}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={1}
                value={crossfadeDuration}
                onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#DFFF00]"
                aria-label="Crossfade Duration"
              />
            </div>

          </NeoCard>
        </div>

        {/* ── 2. EQUALIZER & SOUNDSTAGE ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
            <Sliders className="h-4 w-4 text-[#00E5FF]" /> Equalizer &amp; Soundstage
          </h2>

          <NeoCard className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Spatial Soundstage Preset</div>
                <div className="text-[11px] text-[#9AA1AD]">Active acoustic impulse response simulation</div>
              </div>
              <NeoButton
                variant="outline"
                size="sm"
                onClick={() => setShowEqModal(true)}
              >
                Open Equalizer
              </NeoButton>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {(['studio', 'concert', 'acoustic', 'bass'] as SoundstagePreset[]).map((preset) => {
                const isSelected = soundstagePreset === preset;
                return (
                  <button
                    key={preset}
                    onClick={() => setSoundstagePreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#171A21] border-[#00E5FF] text-white shadow-sm'
                        : 'bg-white/[0.02] border-white/5 text-[#9AA1AD] hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{soundstageLabels[preset]}</div>
                    <div className="text-[10px] text-[#9AA1AD] mt-0.5">{isSelected ? 'Active' : 'Preset'}</div>
                  </button>
                );
              })}
            </div>
          </NeoCard>
        </div>

        {/* ── 3. DOWNLOADS & STORAGE ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
            <Download className="h-4 w-4 text-[#DFFF00]" /> Offline &amp; Storage
          </h2>

          <NeoCard className="p-4 sm:p-5 space-y-4 divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Download Over Wi-Fi Only</div>
                <div className="text-[11px] text-[#9AA1AD]">Prevent cellular data usage when saving offline audio</div>
              </div>
              <input
                type="checkbox"
                checked={downloadWifiOnly}
                onChange={(e) => setDownloadWifiOnly(e.target.checked)}
                className="w-5 h-5 accent-[#DFFF00] cursor-pointer rounded"
                aria-label="Download Over Wi-Fi Only"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Clear Temporary Cache</div>
                <div className="text-[11px] text-[#9AA1AD]">Clear temporary artwork and search caches</div>
              </div>
              <NeoButton variant="secondary" size="sm" onClick={handleClearCache}>
                Clear Cache
              </NeoButton>
            </div>
          </NeoCard>
        </div>

        {/* ── 4. PRIVACY & RESET ── */}
        <div className="space-y-3">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" /> Privacy &amp; Reset
          </h2>

          <NeoCard className="p-4 sm:p-5 space-y-4 divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between pt-1">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Private Session</div>
                <div className="text-[11px] text-[#9AA1AD]">Pause listening history and recommendation tracking</div>
              </div>
              <input
                type="checkbox"
                checked={privateSession}
                onChange={(e) => setPrivateSession(e.target.checked)}
                className="w-5 h-5 accent-emerald-400 cursor-pointer rounded"
                aria-label="Private Session"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <div className="text-xs sm:text-sm font-bold text-white">Reset All Settings</div>
                <div className="text-[11px] text-[#9AA1AD]">Restore default playback and audio configurations</div>
              </div>
              <NeoButton variant="danger" size="sm" onClick={() => setShowResetConfirm(true)}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </NeoButton>
            </div>
          </NeoCard>
        </div>

        {/* Equalizer Modal */}
        <EqualizerModal isOpen={showEqModal} onClose={() => setShowEqModal(false)} />

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
            <div className="w-full max-w-sm p-6 rounded-3xl bg-[#11141A] border border-white/10 shadow-2xl space-y-4 text-center">
              <h3 className="text-base font-bold text-white">Reset All Preferences?</h3>
              <p className="text-xs text-[#9AA1AD]">
                This will restore all playback, audio quality, and soundstage settings to factory defaults.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <NeoButton variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </NeoButton>
                <NeoButton variant="danger" size="sm" onClick={handleConfirmReset}>
                  Confirm Reset
                </NeoButton>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
