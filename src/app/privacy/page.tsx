'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
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
          <ShieldCheck className="h-3 w-3 text-[#00D4FF]" /> PRIVACY POLICY
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-white/50">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-sm text-white/70 leading-relaxed bg-[#0D101C]/80 p-8 rounded-3xl border border-white/10 shadow-xl">
        <section className="space-y-2">
          <h2 className="text-base font-black text-white">1. Information Collection</h2>
          <p>
            NeoTunes respects your privacy. We collect minimal account data necessary for playback synchronization, playlist persistence, and customized recommendations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white">2. Data Security</h2>
          <p>
            Your listening preferences and queue history are encrypted in transit and stored securely using enterprise database infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-black text-white">3. Third-Party Integrations</h2>
          <p>
            Metadata APIs (Spotify, iTunes, YouTube) are queried client-side without sharing personal identity tokens.
          </p>
        </section>
      </div>
    </div>
  );
}
