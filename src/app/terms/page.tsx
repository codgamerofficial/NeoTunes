'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-[1000px] mx-auto text-white font-sans select-none pb-36">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all text-xs font-bold w-fit cursor-pointer border border-white/10"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full spider-sense-badge text-[10px] font-black uppercase tracking-widest">
          <FileText className="h-3 w-3 text-[#00D4FF]" /> LEGAL TERMS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Terms of Service</h1>
        <p className="text-xs text-white/50">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-sm text-white/70 leading-relaxed bg-[#0D101C]/80 p-8 rounded-3xl border border-white/10 shadow-xl">
        <section className="space-y-2">
          <h2 className="text-base font-black text-white">1. Service Usage</h2>
          <p>
            NeoTunes provides a digital audio streaming and metadata discovery platform. By accessing our platform, you agree to comply with all applicable terms and conditions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white">2. Content & Licensing</h2>
          <p>
            All music metadata, artwork, and streaming links are aggregated via authorized public APIs and metadata resolution protocols.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white">3. User Conduct</h2>
          <p>
            Users must not attempt to scrape, alter, or disassemble playback streams or authentication systems.
          </p>
        </section>
      </div>
    </div>
  );
}
