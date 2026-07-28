'use client';

import React, { useState } from 'react';
import { Settings, Sliders, Shield, Volume2, HardDrive, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [audioQuality, setAudioQuality] = useState('flac');
  const [crossfade, setCrossfade] = useState(3);
  const [normalizeVolume, setNormalizeVolume] = useState(true);

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none max-w-4xl">
      <div className="pb-6 border-b border-[#181818]">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-[#29B6F6]" /> Settings
        </h1>
        <p className="text-sm text-[#B3B3B3] mt-1">Configure playback quality, audio processing, and application preferences.</p>
      </div>

      {/* Audio Quality */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[#29B6F6]" /> Streaming Audio Quality
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'flac', label: 'Hi-Res Lossless (FLAC)', desc: '24-bit / 96kHz Master' },
            { id: 'high', label: 'Very High (320 kbps)', desc: 'AAC High Quality' },
            { id: 'normal', label: 'Normal (160 kbps)', desc: 'Standard Bandwidth' },
          ].map((q) => (
            <div
              key={q.id}
              onClick={() => setAudioQuality(q.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                audioQuality === q.id
                  ? 'bg-[#29B6F6]/10 border-[#29B6F6] text-white font-bold'
                  : 'bg-[#181818] border-[#282828] text-[#B3B3B3] hover:text-white'
              }`}
            >
              <p className="text-xs font-bold text-white">{q.label}</p>
              <p className="text-[10px] mt-1 text-[#B3B3B3]">{q.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Crossfade */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#282828] space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Crossfade Songs</h3>
            <p className="text-xs text-[#B3B3B3]">Smooth transition duration between track changes.</p>
          </div>
          <span className="text-xs font-mono font-bold text-[#29B6F6]">{crossfade} seconds</span>
        </div>
        <input
          type="range" min={0} max={12} value={crossfade} onChange={(e) => setCrossfade(parseInt(e.target.value))}
          className="w-full h-1.5 bg-[#282828] rounded-full outline-none accent-[#29B6F6]"
        />
      </div>

      {/* Normalize Volume */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#282828] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Normalize Volume Level</h3>
          <p className="text-xs text-[#B3B3B3]">Set the same volume level for all tracks automatically.</p>
        </div>
        <button
          onClick={() => setNormalizeVolume(!normalizeVolume)}
          className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${normalizeVolume ? 'bg-[#29B6F6]' : 'bg-[#282828]'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${normalizeVolume ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  );
}
