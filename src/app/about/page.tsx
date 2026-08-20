'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, Zap, Disc3, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1200px] mx-auto text-white font-sans select-none pb-36">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold w-fit cursor-pointer border border-white/10"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full spider-sense-badge text-[10px] font-black uppercase tracking-widest">
          <Sparkles className="h-3 w-3 text-[#00D4FF]" /> ABOUT NEOTUNES
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
          Next-Generation Multiverse Sound System
        </h1>
        <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
          NeoTunes is a high-fidelity music discovery engine built to bridge audio timelines, canonical metadata resolution, and real-time playback across dimensions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <div className="p-3 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] w-fit">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black">High-Fidelity Engine</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Lossless metadata indexing and dynamic streaming sources guarantee crystal-clear playback.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <div className="p-3 rounded-2xl bg-[#6D3BFF]/10 text-[#6D3BFF] w-fit">
            <Disc3 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black">Canonical Metadata</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Multi-provider resolution ensures every track displays real titles, artists, and 600x600 artwork.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <div className="p-3 rounded-2xl bg-[#FF2D9A]/10 text-[#FF2D9A] w-fit">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black">Multiverse Security</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Built with strict data privacy protocols and instant cross-device state synchronization.
          </p>
        </div>
      </div>
    </div>
  );
}
