'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from '@/services/MusicSearchService';

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const { playTrack } = usePlaybackStore();

  useEffect(() => {
    async function resolveAndPlay() {
      const trackId = params?.id as string;
      if (!trackId) {
        router.push('/');
        return;
      }

      try {
        const decoded = decodeURIComponent(trackId).replace(/-/g, ' ');
        const results = await MusicSearchService.searchAll(decoded);
        if (results.songs && results.songs.length > 0) {
          playTrack(results.songs[0]);
          router.push('/player');
        } else {
          router.push('/player');
        }
      } catch {
        router.push('/player');
      }
    }

    resolveAndPlay();
  }, [params, router, playTrack]);

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center p-6 select-none font-sans">
      <div className="space-y-4 text-center">
        <div className="h-10 w-10 border-4 border-[#00D4FF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono font-bold text-white/60">Resolving track timeline...</p>
      </div>
    </div>
  );
}
