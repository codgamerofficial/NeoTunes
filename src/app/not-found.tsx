'use client';

import React from 'react';
import Link from 'next/link';
import { Disc3, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#030306] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="glass-card-v2 max-w-md w-full p-8 rounded-[32px] space-y-6 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00D4FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#FF2D95]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] text-black animate-spin-slow">
            <Disc3 className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white">404</h1>
          <h2 className="text-lg font-bold bg-gradient-to-r from-[#00D4FF] to-[#FF2D95] bg-clip-text text-transparent">
            Track Not Found
          </h2>

          <p className="text-sm text-white/60 leading-relaxed">
            The frequency or page you are looking for has shifted or doesn't exist in our catalog.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="btn-neo-primary py-3 px-5 text-sm flex items-center justify-center gap-2 w-full font-bold cursor-pointer"
            >
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
