'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import SynchronizedLyricsView from '@/components/player/SynchronizedLyricsView';
import { ArrowLeft, Sparkles, Music } from 'lucide-react';
import { resolveArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';
import { NeoButton } from '@/components/ui/NeoButton';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function LyricsPage() {
  const router = useRouter();
  const { currentTrack, progress, duration, setProgress } = usePlaybackStore();
  const [lyrics, setLyrics] = useState<{ timeMs: number; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentTrack) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    const title = currentTrack.title;
    const artist = getArtistName(currentTrack.artists || currentTrack.artist);
    const durationMs = currentTrack.durationMs || (duration ? duration * 1000 : 180000);

    fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&durationMs=${durationMs}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (data && data.lyrics && data.lyrics.length > 0) {
            setLyrics(
              data.lyrics.map((l: any) => ({
                timeMs: typeof l.time === 'number' ? l.time * 1000 : (l.timeMs || 0),
                text: l.text || '',
              }))
            );
          } else {
            setLyrics([]);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLyrics([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentTrack, duration]);

  if (!currentTrack) {
    return (
      <div className="p-8 text-center min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-2xl bg-white/5 text-[#DFFF00]">
          <Music className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-bold text-white">No active track playing</h2>
        <p className="text-xs text-[#9AA1AD]">Play a song to view synchronized lyrics.</p>
        <NeoButton variant="primary" size="sm" onClick={() => router.push('/browse')}>
          Browse Music
        </NeoButton>
      </div>
    );
  }

  const currentTimeMs = progress * 1000;

  return (
    <FeatureErrorBoundary featureName="Lyrics">
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col space-y-4 font-sans select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img
              src={resolveArtwork(currentTrack)}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-white truncate">
                {currentTrack.title}
              </h1>
              <p className="text-xs text-[#9AA1AD] truncate font-medium">
                {getArtistName(currentTrack.artists || currentTrack.artist)}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25">
            SYNCED LYRICS
          </span>
        </div>

        {/* Synchronized Lyrics Container */}
        <div className="flex-1 min-h-0">
          <SynchronizedLyricsView
            lyrics={lyrics}
            currentTimeMs={currentTimeMs}
            onSeek={(t) => {
              setProgress(t);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: t } }));
              }
            }}
          />
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
