'use client';

import React from 'react';
import { RefreshCw, Music } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white flex flex-col items-center justify-center min-h-screen p-6 text-center select-none font-sans">
        <div className="p-4 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 mb-4 animate-pulse">
          <Music className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-white">Application Error</h2>
        <p className="text-sm text-white/50 mt-1 max-w-md">
          A critical system error occurred. Click below to reload the platform.
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:scale-105 transition-transform"
        >
          <RefreshCw className="h-4 w-4" /> Reload NeoTunes
        </button>
      </body>
    </html>
  );
}
