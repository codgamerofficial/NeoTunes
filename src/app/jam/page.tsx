'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Users, Sparkles, Plus, ArrowRight, Play, Globe, ShieldCheck } from 'lucide-react';
import { jamSessionManager } from '@/services/jamSessionManager';

export default function JamLobbyPage() {
  const router = useRouter();
  const [jamCode, setJamCode] = useState('');

  const handleCreateJam = () => {
    const session = jamSessionManager.createSession("Saswata's Multiverse Jam", 'Saswata');
    router.push(`/jam/${session.id}`);
  };

  const handleJoinJam = (e: React.FormEvent) => {
    e.preventDefault();
    if (jamCode.trim()) {
      router.push(`/jam/${encodeURIComponent(jamCode.trim())}`);
    }
  };

  const activePublicJams = [
    { id: 'JAM-SPIDEY-01', name: 'Peter Parker timeline jam', listeners: 142, currentTrack: 'Maney Na - Nish' },
    { id: 'JAM-LOFI-02', name: 'Late Night Multiverse Lo-Fi', listeners: 89, currentTrack: 'Chill Beats 2026' },
    { id: 'JAM-BOLLYWOOD-03', name: 'Arijit Singh Full Discography', listeners: 310, currentTrack: 'Tujhe Kitna Chahne Lage' },
  ];

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-[1400px] mx-auto text-white font-sans select-none pb-36">
      
      {/* ── HERO BANNER ── */}
      <div className="relative p-8 sm:p-12 rounded-[36px] bg-gradient-to-br from-[#0D101C] via-[#121624] to-[#0A0D18] border border-white/15 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-4 max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full spider-sense-badge text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-[#00D4FF]" /> REAL-TIME SOCIAL LISTENING
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Multiverse Jam Sessions
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            Listen together in perfect real-time synchronization. Host your own room, invite friends across parallel timelines, and chat live.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
            <button
              onClick={handleCreateJam}
              className="px-8 py-3.5 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,214,255,0.4)] hover:scale-105 transition-all"
            >
              <Plus className="h-4 w-4" /> Start New Jam Room
            </button>
          </div>
        </div>

        {/* Quick Join Input Box */}
        <div className="p-6 rounded-3xl bg-[#07090E]/90 border border-white/15 w-full md:w-80 space-y-4 shadow-2xl z-10">
          <h3 className="text-sm font-black flex items-center gap-2 text-white">
            <Radio className="h-4 w-4 text-[#00D4FF]" /> Join an Existing Jam
          </h3>
          <form onSubmit={handleJoinJam} className="space-y-3">
            <input
              type="text"
              placeholder="Enter Jam Code (e.g. JAM123)"
              value={jamCode}
              onChange={(e) => setJamCode(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#00D4FF]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join Room</span> <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ── LIVE PUBLIC JAMS ── */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#00D4FF]" /> Active Multiverse Rooms
          </h2>
          <p className="text-xs text-white/60">Tune into live synchronized public jams happening right now.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePublicJams.map((jam) => (
            <div
              key={jam.id}
              onClick={() => router.push(`/jam/${jam.id}`)}
              className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 space-y-4 cursor-pointer group transition-all shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30">
                  LIVE
                </span>
                <span className="text-xs font-mono font-bold text-white/60 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-[#00D4FF]" /> {jam.listeners} listening
                </span>
              </div>

              <div>
                <h3 className="text-sm font-black text-white group-hover:text-[#00D4FF] transition-colors truncate">
                  {jam.name}
                </h3>
                <p className="text-xs text-white/60 truncate pt-0.5 font-medium">Now: {jam.currentTrack}</p>
              </div>

              <button className="w-full py-2 rounded-xl bg-white/5 group-hover:bg-[#00D4FF] text-white group-hover:text-black text-xs font-bold transition-all flex items-center justify-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" /> Tune In
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
