'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { useToast } from '@/components/ui/NeoToast';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Pause, Heart, Plus, Share2, ArrowLeft, Music, Disc3, Mic2, Radio } from 'lucide-react';
import { likedSongsService } from '@/services/likedSongsService';

export default function TrackPage() {
  const params = useParams();
  const router = useRouter();
  const { playTrack, currentTrack, isPlaying, setPlaying, addToQueue } = usePlaybackStore();
  const { showToast } = useToast();

  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);

  useEffect(() => {
    async function resolveTrack() {
      const trackId = params?.id as string;
      if (!trackId) {
        setIsLoading(false);
        return;
      }

      try {
        const decoded = decodeURIComponent(trackId).replace(/-/g, ' ');
        const results = await MusicSearchService.searchAll(decoded, { limit: 1 });
        if (results.songs && results.songs.length > 0) {
          const found = results.songs[0];
          setTrack(found);
          setIsLiked(likedSongsService.isLiked(found.id));

          // Fetch real synced lyrics
          fetch(`/api/lyrics?title=${encodeURIComponent(found.title)}&artist=${encodeURIComponent(getArtistName(found.artist))}&durationMs=${found.durationMs || 180000}`)
            .then((res) => res.json())
            .then((data) => {
              if (data?.lyrics) setLyrics(data.lyrics.slice(0, 8));
            })
            .catch(() => {});
        }
      } catch (err) {
        console.warn('Track resolve error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    resolveTrack();
  }, [params]);

  const isCurrentPlaying = track && (currentTrack?.id === track.id || currentTrack?.canonicalId === track.canonicalId) && isPlaying;

  const handlePlayToggle = () => {
    if (!track) return;
    if (isCurrentPlaying) {
      setPlaying(false);
    } else {
      playTrack(track);
    }
  };

  const handleLike = async () => {
    if (!track) return;
    const next = await likedSongsService.toggleLike(track);
    setIsLiked(next);
    showToast(next ? 'Saved to Liked Songs' : 'Removed from Liked Songs');
  };

  const handleShare = () => {
    if (!track) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to "${track.title}" by ${getArtistName(track.artist)} on NeoTunes`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast('Track link copied to clipboard');
    }
  };

  return (
    <FeatureErrorBoundary featureName="Track">
      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen text-[#F5F7FA] font-sans select-none pb-44 md:pb-28">
        
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#9AA1AD] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        {isLoading ? (
          <NeoSkeleton variant="hero" />
        ) : !track ? (
          <NeoEmptyState
            icon={Music}
            title="Track not found"
            description="We couldn't resolve the timeline for this track."
            actionText="Browse Music"
            onAction={() => router.push('/browse')}
          />
        ) : (
          <div className="space-y-8">
            
            {/* ── 1. FOCUSED TRACK HERO ── */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Artwork
                  source={resolveArtwork(track)}
                  size="large"
                  canonicalId={track.id}
                  type="track"
                  className="w-44 h-44 sm:w-56 sm:h-56 rounded-2xl object-cover border border-white/10 shadow-2xl shrink-0"
                />

                <div className="space-y-3 text-center sm:text-left min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25 inline-block">
                      TRACK
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/25">
                      LOSSLESS AUDIO
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {track.title}
                  </h1>

                  <p className="text-sm sm:text-base font-semibold text-[#9AA1AD]">
                    {getArtistName(track.artists || track.artist)}
                  </p>

                  <p className="text-xs text-[#9AA1AD]/70">
                    Album: {typeof track.album === 'string' ? track.album : (track.album as any)?.name || 'Single'}
                  </p>

                  {/* Actions */}
                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <NeoButton
                      variant="primary"
                      size="md"
                      onClick={handlePlayToggle}
                    >
                      {isCurrentPlaying ? (
                        <>
                          <Pause className="h-4 w-4 fill-black text-black" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play Track
                        </>
                      )}
                    </NeoButton>

                    <NeoButton
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        addToQueue(track);
                        showToast('Added to Queue');
                      }}
                    >
                      <Plus className="h-4 w-4" /> Add to Queue
                    </NeoButton>

                    <button
                      onClick={handleLike}
                      className={`p-3 rounded-full border transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-[#DFFF00]/15 border-[#DFFF00]/40 text-[#DFFF00]'
                          : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white'
                      }`}
                      title="Like Track"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
                      title="Share Track"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. LYRICS PREVIEW (If Available) ── */}
            {lyrics && lyrics.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#11141A] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#DFFF00] flex items-center gap-2">
                    <Mic2 className="h-4 w-4 text-[#DFFF00]" /> Synchronized Lyrics Preview
                  </h3>
                  <button
                    onClick={() => router.push('/lyrics')}
                    className="text-xs font-semibold text-[#9AA1AD] hover:text-white cursor-pointer"
                  >
                    Open Full Lyrics
                  </button>
                </div>

                <div className="space-y-2 py-2">
                  {lyrics.slice(0, 5).map((l, i) => (
                    <p key={i} className="text-sm font-medium text-white/80 leading-relaxed">
                      {l.text}
                    </p>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
