'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, Cpu, Activity, ShieldCheck, Zap, Volume2, Radio, Info } from 'lucide-react';
import { AudioQualityEngine } from '@/services/audio/AudioQualityEngine';
import { AudioState, AudioDiagnosticReport, AudioQualitySetting } from '@/types/audio-quality';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoVisualizer } from '@/components/audio/NeoVisualizer';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

export default function AudioDiagnosticsPage() {
  const [audioState, setAudioState] = useState<AudioState | null>(null);
  const [report, setReport] = useState<AudioDiagnosticReport | null>(null);

  useEffect(() => {
    setAudioState(AudioQualityEngine.getAudioState());
    setReport(AudioQualityEngine.generateDiagnosticReport());
  }, []);

  const handleQualityChange = (setting: AudioQualitySetting) => {
    const updated = AudioQualityEngine.setQualitySetting(setting);
    setAudioState(updated);
    setReport(AudioQualityEngine.generateDiagnosticReport());
  };

  const handleCrossfadeChange = (val: number) => {
    const updated = AudioQualityEngine.setCrossfadeDuration(val);
    setAudioState(updated);
  };

  const handleNormalizationToggle = () => {
    if (!audioState) return;
    const updated = AudioQualityEngine.toggleNormalization(!audioState.normalizationEnabled);
    setAudioState(updated);
  };

  return (
    <FeatureErrorBoundary featureName="Audio Engine & Diagnostics">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sliders className="h-7 w-7 text-[#00D9FF]" /> Immersive Audio Engine & Diagnostics
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Hardware-aware spatial capabilities, quality streaming policy, and real-time audio diagnostics.
          </p>
        </div>

        {/* Live Audio Visualizer Preview (Section 68-72) */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Live Real-time Visualizer (`NeoVisualizer`)</h3>
          <NeoVisualizer mode="spectrum" isPlaying={true} className="h-24" />
        </div>

        {/* Audio Quality Settings (Section 19-21) */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Streaming Audio Quality Policy</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['AUTO', 'STANDARD', 'HIGH', 'LOSSLESS'] as AudioQualitySetting[]).map((setting) => {
              const isSelected = audioState?.qualitySetting === setting;
              return (
                <NeoCard
                  key={setting}
                  glass
                  interactive
                  onClick={() => handleQualityChange(setting)}
                  className={`space-y-2 border ${isSelected ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-white/10'}`}
                >
                  <Zap className={`h-5 w-5 ${isSelected ? 'text-[#00D9FF]' : 'text-white/60'}`} />
                  <h4 className="text-xs font-bold text-white">{setting}</h4>
                  <p className="text-[10px] text-[#A1A1A6]">
                    {setting === 'LOSSLESS' ? 'Up to 24-bit/96kHz FLAC' : 'Adaptive Bitrate'}
                  </p>
                </NeoCard>
              );
            })}
          </div>
        </div>

        {/* Hardware Status Badges (Section 7 & 10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NeoCard glass className="space-y-2">
            <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Spatial Audio Status</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Spatial Audio</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold uppercase border border-blue-500/40">
                {audioState?.spatialState}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1A6]">Controlled by device audio stack • Hardware widening active</p>
          </NeoCard>

          <NeoCard glass className="space-y-2">
            <span className="text-[10px] font-mono text-[#A1A1A6] uppercase">Dolby Atmos Status</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">Dolby Atmos</span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold uppercase border border-indigo-500/40">
                {audioState?.dolbyState}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1A6]">Hardware verified • System controlled processing</p>
          </NeoCard>
        </div>

        {/* Real-time Diagnostics Inspector Panel (Section 49) */}
        {report && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#00D9FF]" /> Real-time Audio Diagnostics
            </h3>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs space-y-2 text-[#A1A1A6]">
              <div className="flex justify-between"><span>Source Codec:</span> <span className="text-white">{report.sourceCodec}</span></div>
              <div className="flex justify-between"><span>Sample Rate:</span> <span className="text-white">{report.sampleRate}</span></div>
              <div className="flex justify-between"><span>Channel Info:</span> <span className="text-white">{report.channelInfo}</span></div>
              <div className="flex justify-between"><span>Output Route:</span> <span className="text-white">{report.outputRoute}</span></div>
              <div className="flex justify-between"><span>Bluetooth Codec:</span> <span className="text-white">{report.bluetoothCodec}</span></div>
              <div className="flex justify-between"><span>Buffer State:</span> <span className="text-emerald-400">{report.bufferState}</span></div>
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
