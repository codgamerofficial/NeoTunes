'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Music } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-6 text-center select-none font-sans">
      <div className="p-4 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/30 mb-4 animate-pulse">
        <Music className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-white">Something went wrong</h2>
      <p className="text-sm text-white/50 mt-1 max-w-md">
        An unhandled UI error occurred. Click below to refresh and re-sync your music player.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-bold text-sm shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:scale-105 transition-transform"
      >
        <RefreshCw className="h-4 w-4" /> Try Again
      </button>
    </div>
  );
}
