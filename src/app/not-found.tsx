'use client';

import React from 'react';
import Link from 'next/link';
import { Disc3, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white/[0.045] border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-6">
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-4 rounded-2xl bg-[#DFFF00] text-black">
            <Disc3 className="h-8 w-8 text-black animate-spin-slow" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white">404</h1>
          <h2 className="text-lg font-bold text-[#DFFF00]">
            Page Not Found
          </h2>

          <p className="text-xs text-[#A1A1A6] leading-relaxed">
            The page or frequency you are looking for shifted or doesn't exist.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/"
              className="py-3 px-5 text-xs font-mono font-bold uppercase tracking-wider rounded-full bg-[#DFFF00] text-black flex items-center justify-center gap-2 w-full hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
