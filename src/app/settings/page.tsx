'use client';

import React, { useState } from 'react';
import { Settings, Volume2, Sparkles, Shield, Palette, HardDrive, Bell, Key, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [accentColor, setAccentColor] = useState('#00D4FF');
  const [audioQuality, setAudioQuality] = useState('flac');
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [crossfade, setCrossfade] = useState(4);
  const [apiKey, setApiKey] = useState('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');

  const accentColors = [
    { hex: '#00D4FF', name: 'Electric Blue' },
    { hex: '#7A3CFF', name: 'Neon Purple' },
    { hex: '#FF2D95', name: 'Magenta' },
    { hex: '#10B981', name: 'Emerald' },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none max-w-4xl pb-28">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#00D4FF]" /> Preferences &amp; Settings
        </h1>
        <p className="text-sm text-white/50 mt-1">Customize playback quality, audio spatialization, theme accent colors, and AI configuration.</p>
      </div>

      {/* 1. ACCENT COLOR PICKER */}
      <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#00D4FF]" /> Accent Color Theme
        </h3>

        <div className="flex gap-4">
          {accentColors.map((color) => (
            <button
              key={color.hex}
              onClick={() => setAccentColor(color.hex)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <span className="h-4 w-4 rounded-full" style={{ backgroundColor: color.hex }} />
              <span className="text-xs font-bold text-white">{color.name}</span>
              {accentColor === color.hex && <Check className="h-3.5 w-3.5 text-[#00D4FF]" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. STREAMING AUDIO QUALITY */}
      <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[#00D4FF]" /> Audio Streaming Quality
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'flac', label: 'Hi-Res Lossless (FLAC)', desc: '24-bit / 96kHz Master Audio' },
            { id: 'high', label: 'Very High (320 kbps)', desc: 'AAC High Fidelity' },
            { id: 'normal', label: 'Normal (160 kbps)', desc: 'Optimized Data Saver' },
          ].map((q) => (
            <div
              key={q.id}
              onClick={() => setAudioQuality(q.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1 ${
                audioQuality === q.id
                  ? 'bg-gradient-to-r from-[#00D4FF]/20 to-[#7A3CFF]/20 border-[#00D4FF] text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              <div className="text-xs font-bold text-white">{q.label}</div>
              <div className="text-[11px] text-white/50">{q.desc}</div>
            </div>
          ))}
        </div>

        {/* Spatial Audio Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div>
            <div className="text-xs font-bold text-white">Dolby Atmos &amp; Spatial Audio</div>
            <div className="text-[11px] text-white/50">Simulate 3D multi-dimensional sound field</div>
          </div>
          <button
            onClick={() => setSpatialAudio(!spatialAudio)}
            className={`w-12 h-6 rounded-full transition-colors relative ${spatialAudio ? 'bg-[#00D4FF]' : 'bg-white/20'}`}
          >
            <span className={`absolute top-1 h-4 w-4 rounded-full bg-black transition-transform ${spatialAudio ? 'right-1' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* 3. AI API CONFIGURATION */}
      <div className="p-6 rounded-3xl bg-[#101010] border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-[#FF2D95]" /> Ask Neo — NVIDIA Neural AI Key
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-white/50 font-mono">NVIDIA AI Foundation Key</label>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white font-mono outline-none"
            />
            <span className="text-xs font-bold text-[#00D4FF] uppercase">CONNECTED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
