'use client';

import React, { useState } from 'react';
import { Settings, Volume2, Palette, Shield, Lock, Check } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

export default function SettingsPage() {
  const { audioQuality, setAudioQuality } = usePlaybackStore();
  const [accentColor, setAccentColor] = useState('#AFC7FF');
  const [spatialAudio, setSpatialAudio] = useState(true);

  const accentColors = [
    { hex: '#AFC7FF', name: 'Electric Cyan' },
    { hex: '#7A3CFF', name: 'Neon Indigo' },
    { hex: '#FF2D95', name: 'Controlled Magenta' },
    { hex: '#10B981', name: 'Emerald' },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#000000] text-[#F4F1F7] font-sans select-none max-w-4xl pb-36">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#AFC7FF]" /> Settings &amp; Preferences
        </h1>
        <p className="text-sm text-[#A8A7AF] mt-1">Audio quality, Soundstage DSP, appearance, and privacy options.</p>
      </div>

      {/* 1. ACCENT COLOR PICKER */}
      <div className="p-6 rounded-3xl bg-[#121318] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#AFC7FF]" /> Accent Color Theme
        </h3>

        <div className="flex flex-wrap gap-4">
          {accentColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => setAccentColor(color.hex)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-[#17181D] hover:bg-white/10 transition-all cursor-pointer"
            >
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color.hex }} />
              <span className="text-xs font-bold text-white">{color.name}</span>
              {accentColor === color.hex && <Check className="h-3.5 w-3.5 text-[#AFC7FF]" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. STREAMING AUDIO QUALITY */}
      <div className="p-6 rounded-3xl bg-[#121318] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[#AFC7FF]" /> Audio Streaming Quality
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'very_high', label: 'Very High (320 kbps)', desc: 'High Fidelity AAC/Opus' },
            { id: 'high', label: 'High (256 kbps)', desc: 'Balanced Quality' },
            { id: 'normal', label: 'Normal (160 kbps)', desc: 'Data Saver' },
          ].map((q) => (
            <div
              key={q.id}
              onClick={() => setAudioQuality(q.id as any)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                audioQuality === q.id
                  ? 'bg-[#AFC7FF]/15 border-[#AFC7FF] text-white'
                  : 'bg-[#17181D] border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-white">{q.label}</div>
              <div className="text-[11px] text-[#A8A7AF]">{q.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PRIVACY & SECURITY */}
      <div className="p-6 rounded-3xl bg-[#121318] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="h-4 w-4 text-[#AFC7FF]" /> Privacy &amp; Server Credentials
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#17181D]">
          <div>
            <div className="text-xs font-bold text-white">AI Provider Keys</div>
            <div className="text-[11px] text-[#A8A7AF]">Server-side proxy configured securely</div>
          </div>
          <span className="text-xs font-mono font-bold text-[#10B981] px-2.5 py-1 rounded-full bg-[#10B981]/20">
            SECURE
          </span>
        </div>
      </div>

    </div>
  );
}
