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
  HardDrive
} from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { useSettingsStore, AudioQuality, SoundstagePreset } from '@/store/settings-store';
import { usePlaybackStore } from '@/store/playback-store';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { useToast } from '@/components/ui/NeoToast';
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

  const [showQualitySheet, setShowQualitySheet] = useState(false);
  const [showEqModal, setShowEqModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const qualityLabels: Record<AudioQuality, string> = {
    very_high: 'Very High (320 kbps)',
    high: 'High (256 kbps)',
    data_saver: 'Data Saver (128 kbps)',
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
    { name: 'Solar Amber', hex: '#FFB703' },
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
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-4xl mx-auto pb-44 md:pb-28 min-h-screen">
        
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SettingsIcon className="h-6 w-6 text-[#DFFF00]" /> Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD]">
            Playback preferences, audio quality, soundstage DSP, and account privacy.
          </p>
        </div>

        {/* 1. Playback & Stream Quality */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider px-1">
            Playback &amp; Audio Quality
          </h2>
          
          <NeoCard className="p-0 divide-y divide-white/5 overflow-hidden">
            {/* Audio Quality Selection */}
            <div
              onClick={() => setShowQualitySheet(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">
                    Streaming Audio Quality
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD]">Optimized high-resolution audio streaming</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#DFFF00]">{qualityLabels[audioQuality]}</span>
                <ChevronRight className="h-4 w-4 text-[#9AA1AD]" />
              </div>
            </div>

            {/* Autoplay Similar Music */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00E5FF]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Autoplay Similar Music</h3>
                  <p className="text-[11px] text-[#9AA1AD]">Continuously play recommendations when queue finishes</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAutoplay(!autoplay);
                  showToast(autoplay ? 'Autoplay disabled' : 'Autoplay enabled');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  autoplay ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
                aria-label="Toggle Autoplay"
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  autoplay ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Crossfade Duration Slider */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Crossfade Duration</h3>
                    <p className="text-[11px] text-[#9AA1AD]">Smoothly blend track transitions</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#DFFF00]">{crossfadeDuration}s</span>
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
                <div className="p-2 rounded-xl bg-white/5 text-[#00E5FF]">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Gapless Playback</h3>
                  <p className="text-[11px] text-[#9AA1AD]">Eliminate silence between consecutive album tracks</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setGaplessPlayback(!gaplessPlayback);
                  showToast(gaplessPlayback ? 'Gapless playback disabled' : 'Gapless playback enabled');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  gaplessPlayback ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
                aria-label="Toggle Gapless Playback"
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  gaplessPlayback ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </NeoCard>
        </div>

        {/* 2. Studio Equalizer & DSP */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider px-1">
            Studio DSP &amp; Equalizer
          </h2>
          
          <NeoCard className="p-0 divide-y divide-white/5 overflow-hidden">
            <div
              onClick={() => setShowEqModal(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                    Studio Equalizer &amp; Soundstage
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD]">
                    Active Preset: {soundstageLabels[soundstagePreset]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#00E5FF] uppercase">{soundstagePreset}</span>
                <ChevronRight className="h-4 w-4 text-[#9AA1AD]" />
              </div>
            </div>
          </NeoCard>
        </div>

        {/* 3. Downloads & Storage */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider px-1">
            Downloads &amp; Cache
          </h2>
          
          <NeoCard className="p-0 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00E5FF]">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Download Over Wi-Fi Only</h3>
                  <p className="text-[11px] text-[#9AA1AD]">Prevent mobile cellular data consumption</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDownloadWifiOnly(!downloadWifiOnly);
                  showToast(downloadWifiOnly ? 'Wi-Fi only downloads disabled' : 'Wi-Fi only downloads enabled');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  downloadWifiOnly ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
                aria-label="Toggle Download Over Wi-Fi Only"
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
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">
                    Manage Offline Storage
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD]">View cached songs &amp; free device space</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#9AA1AD]" />
            </div>

            <div
              onClick={handleClearCache}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#9AA1AD]">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-white transition-colors">
                    Clear Local Search &amp; Temp Cache
                  </h3>
                  <p className="text-[11px] text-[#9AA1AD]">Clear search history and temporary state</p>
                </div>
              </div>
              <NeoButton variant="ghost" size="sm" onClick={handleClearCache}>
                Clear
              </NeoButton>
            </div>
          </NeoCard>
        </div>

        {/* 4. Appearance */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider px-1">
            Appearance
          </h2>
          
          <NeoCard className="p-0 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#00E5FF]">
                  <Moon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Pure OLED Dark Mode</h3>
                  <p className="text-[11px] text-[#9AA1AD]">True pitch black background for OLED screens</p>
                </div>
              </div>
              <button
                onClick={() => setOledDarkMode(!oledDarkMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  oledDarkMode ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
                aria-label="Toggle OLED Dark Mode"
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  oledDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </NeoCard>
        </div>

        {/* 5. Privacy & Reset */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider px-1">
            Privacy &amp; Reset
          </h2>
          
          <NeoCard className="p-0 divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 text-[#DFFF00]">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Private Listening Session</h3>
                  <p className="text-[11px] text-[#9AA1AD]">Do not record stream activity to listening history</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPrivateSession(!privateSession);
                  showToast(privateSession ? 'Private session disabled' : 'Private session enabled');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  privateSession ? 'bg-[#DFFF00]' : 'bg-white/20'
                }`}
                aria-label="Toggle Private Listening Session"
              >
                <span className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-black transition-transform ${
                  privateSession ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div
              onClick={() => setShowResetConfirm(true)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
                  <RotateCcw className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-400">Reset All Settings</h3>
                  <p className="text-[11px] text-[#9AA1AD]">Restore default audio &amp; app preferences</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#9AA1AD]" />
            </div>
          </NeoCard>
        </div>

        {/* Quality Selection Modal */}
        {showQualitySheet && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white">Streaming Quality</h3>
                <button onClick={() => setShowQualitySheet(false)} className="text-[#9AA1AD] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-2">
                {(['very_high', 'high', 'data_saver'] as AudioQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setAudioQuality(q);
                      setShowQualitySheet(false);
                      showToast(`Audio quality set to ${qualityLabels[q]}`);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                      audioQuality === q
                        ? 'bg-[#DFFF00]/10 border-[#DFFF00] text-white font-bold'
                        : 'bg-white/5 border-white/5 text-[#9AA1AD] hover:text-white'
                    }`}
                  >
                    <span className="text-xs">{qualityLabels[q]}</span>
                    {audioQuality === q && <Check className="h-4 w-4 text-[#DFFF00]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Studio Equalizer Modal */}
        {showEqModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <h3 className="text-base font-bold text-white">Studio Equalizer</h3>
                <button onClick={() => setShowEqModal(false)} className="text-[#9AA1AD] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <StudioEqPanel />
            </div>
          </div>
        )}

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-[#11141A] border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Reset Settings?</h3>
              <p className="text-xs text-[#9AA1AD] leading-relaxed">
                This will reset your audio bitrate, soundstage DSP, and display settings back to system defaults.
              </p>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <NeoButton variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </NeoButton>
                <NeoButton variant="danger" size="sm" onClick={handleConfirmReset}>
                  Reset Defaults
                </NeoButton>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
