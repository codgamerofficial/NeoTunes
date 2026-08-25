'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Volume2, 
  Sliders, 
  Sparkles, 
  Headphones, 
  Radio, 
  Activity, 
  Info,
  RotateCcw,
  Check
} from 'lucide-react';
import { AudioCapabilityEngine } from '@/services/audio/AudioCapabilityEngine';
import { AudioOutputManager } from '@/services/audio/AudioOutputManager';
import { SpatialAudioManager } from '@/services/audio/SpatialAudioManager';
import { SoundProfile, SpatialMode, AudioCapabilities } from '@/types/audio-adaptive';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

const PROFILES: { id: SoundProfile; name: string; desc: string }[] = [
  { id: 'IMMERSIVE', name: 'NeoTunes Immersive', desc: 'Default signature. Clean vocals, controlled sub-bass, wide soundstage.' },
  { id: 'NEUTRAL', name: 'Neutral / Studio', desc: 'Flat frequency response preserving original mixing dynamics.' },
  { id: 'BALANCED', name: 'Balanced', desc: 'Slightly enhanced warmth suitable for all genres.' },
  { id: 'BASS', name: 'Bass Boost', desc: 'Deep low-end extension without muddying vocal frequencies.' },
  { id: 'VOCAL', name: 'Vocal Clarity', desc: 'Lifted mid-range frequencies for acoustic tracks and speech.' },
  { id: 'CINEMATIC', name: 'Cinematic', desc: 'Expanded dynamic range for movies and live recordings.' },
  { id: 'NIGHT', name: 'Night Mode', desc: 'Controlled peaks and compressed dynamics for low-volume listening.' },
];

export default function AudioSettingsPage() {
  const router = useRouter();
  const [caps, setCaps] = useState<AudioCapabilities | null>(null);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [activeProfile, setActiveProfile] = useState<SoundProfile>('IMMERSIVE');
  const [spatialMode, setSpatialMode] = useState<SpatialMode>('AUTO');
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const c = AudioCapabilityEngine.getCapabilities();
    setCaps(c);
    setDiagnostics(AudioCapabilityEngine.getDiagnosticsInfo());
    setActiveProfile(AudioOutputManager.getProfileForRoute(c.currentRoute));
    setSpatialMode(SpatialAudioManager.getSpatialMode());
  }, []);

  const handleProfileSelect = (p: SoundProfile) => {
    setActiveProfile(p);
    if (caps) AudioOutputManager.setProfileForRoute(caps.currentRoute, p);
  };

  const handleSpatialSelect = (m: SpatialMode) => {
    setSpatialMode(m);
    SpatialAudioManager.setSpatialMode(m);
  };

  const handleResetEq = () => {
    setEqGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };

  return (
    <FeatureErrorBoundary featureName="Audio Settings">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Volume2 className="h-7 w-7 text-[#00D9FF]" /> Adaptive Audio &amp; Output Engine
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Configure output-specific sound profiles, spatial audio, and system DSP cooperation.
          </p>
        </div>

        {/* Current Route Banner */}
        {caps && (
          <div className="p-5 rounded-3xl bg-[#0A0D14] border border-white/10 flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[#00D9FF]/10 text-[#00D9FF]">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#00D9FF] uppercase font-bold tracking-wider">Active Audio Route</span>
                <h3 className="text-sm font-bold text-white">{caps.routeLabel}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#DFFF00] uppercase font-bold block">Dolby Atmos</span>
              <span className="text-xs font-semibold text-white/80">{caps.dolbyAtmosState === 'AVAILABLE' ? 'System controlled' : 'Output unsupported'}</span>
            </div>
          </div>
        )}

        {/* Sound Profiles */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00D9FF]" /> Sound Profiles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROFILES.map((p) => {
              const isSelected = activeProfile === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleProfileSelect(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-[#00D9FF]/10 border-[#00D9FF] text-white shadow-[0_0_15px_rgba(0,217,255,0.2)]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    {isSelected && <Check className="h-4 w-4 text-[#00D9FF]" />}
                  </div>
                  <p className="text-[11px] text-[#A1A1A6]">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spatial Audio Modes */}
        <div className="p-6 rounded-3xl bg-[#090C12] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00D9FF]" /> Spatial Audio Processing
          </h3>
          <div className="flex flex-wrap gap-2">
            {SpatialAudioManager.getAvailableModes().map((m) => (
              <button
                key={m}
                onClick={() => handleSpatialSelect(m)}
                className={`px-4 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  spatialMode === m
                    ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_rgba(0,217,255,0.4)]'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[#A1A1A6]">
            Spatial processing cooperates with native device DSP and Media3 spatializer APIs.
          </p>
        </div>

        {/* Audio Diagnostics Info */}
        {diagnostics && (
          <div className="p-6 rounded-3xl bg-[#0A0D14] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Info className="h-4 w-4 text-[#00D9FF]" /> Live Audio Diagnostics
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-[10px] font-mono text-[#A1A1A6] uppercase">Codec</span>
                <span className="font-bold text-white">{diagnostics.codec}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-[#A1A1A6] uppercase">Sample Rate</span>
                <span className="font-bold text-white">{diagnostics.sampleRate}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-[#A1A1A6] uppercase">Channels</span>
                <span className="font-bold text-white">{diagnostics.channels}</span>
              </div>
              <div>
                <span className="block text-[10px] font-mono text-[#A1A1A6] uppercase">Quality</span>
                <span className="font-bold text-[#DFFF00]">{diagnostics.quality}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
