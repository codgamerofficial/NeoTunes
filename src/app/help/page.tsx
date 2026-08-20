'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle, Search, MessageSquare, Zap } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1100px] mx-auto text-white font-sans select-none pb-36">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold w-fit cursor-pointer border border-white/10"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full spider-sense-badge text-[10px] font-black uppercase tracking-widest">
          <HelpCircle className="h-3 w-3 text-[#00D4FF]" /> SUPPORT & HELP
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">How can we help?</h1>
        <p className="text-sm text-white/70">Find quick answers to common questions about NeoTunes playback and discovery.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-base font-black text-[#00D4FF]">How does song search work?</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Our search engine performs multi-level matching across canonical song titles, artists, and transliterated queries to return exact tracks with high-res artwork.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-base font-black text-[#00D4FF]">What is Ask Neo AI?</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Ask Neo is our AI music assistant. Click the "Ask Neo" button in the top bar to ask for custom playlists, mood switches, or song recommendations.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-base font-black text-[#00D4FF]">How to sync lyrics?</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Open the player or click the Lyrics icon in the bottom player bar to switch between Classic scrollable lyrics and Kinetic animated line mode.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0D101C]/80 border border-white/10 space-y-3 shadow-xl">
          <h3 className="text-base font-black text-[#00D4FF]">Audio Devices & Casting</h3>
          <p className="text-xs text-white/60 leading-relaxed">
            Click the Headphones icon in the bottom bar to inspect connected audio output devices and local casting options.
          </p>
        </div>
      </div>
    </div>
  );
}
