'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artist, Track } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { useToast } from '@/components/ui/NeoToast';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Heart, ArrowLeft, User, Shuffle, Check, Sparkles } from 'lucide-react';

export default function SingleArtistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'arijit-singh').toLowerCase();
  
  const { playTrack } = usePlaybackStore();
  const { showToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadArtistData() {
      setIsLoading(true);
      try {
        let fetchedArtist: Artist | null = null;
        let fetchedTracks: Track[] = [];

        if (rawId.startsWith('spotify:') || rawId.length >= 10) {
          fetchedArtist = await spotifyProvider.getArtist(rawId);
          if (fetchedArtist) {
            fetchedTracks = await spotifyProvider.getArtistTopTracks(fetchedArtist.sourceId || rawId);
          }
        }

        if (!fetchedArtist) {
          const queryTerm = rawId.replace(/[-_]/g, ' ');
          const searchRes = await MusicSearchService.searchAll(queryTerm);
          if (searchRes.artists.length > 0) {
            fetchedArtist = searchRes.artists[0];
            fetchedTracks = searchRes.songs.filter((s) =>
              s.artists.some((a) => {
                const nameStr = typeof a === 'string' ? a : (a as any)?.name || '';
                return nameStr.toLowerCase().includes(fetchedArtist!.name.toLowerCase());
              })
            );
            if (fetchedTracks.length === 0) {
              fetchedTracks = searchRes.songs;
            }
          } else if (searchRes.songs.length > 0) {
            const firstSong = searchRes.songs[0];
            const firstArt = firstSong.artists[0];
            const artistName = typeof firstArt === 'string' ? firstArt : (firstArt as any)?.name || 'Artist';
            fetchedArtist = {
              id: `spotify:artist:${firstSong.id}`,
              canonicalId: `spotify:artist:${firstSong.id}`,
              source: 'spotify',
              sourceId: firstSong.id,
              name: artistName,
              imageUrl: firstSong.artworkUrl || firstSong.coverUrl,
              avatarUrl: firstSong.artworkUrl || firstSong.coverUrl,
              followers: 1250000,
              genres: ['Pop', 'Bollywood', 'Indie'],
            };
            fetchedTracks = searchRes.songs;
          }
        }

        if (isMounted) {
          setArtist(fetchedArtist);
          setTopTracks(fetchedTracks);
        }
      } catch (err) {
        console.warn('Artist load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadArtistData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const handlePlayAll = () => {
    if (topTracks.length > 0) playTrack(topTracks[0], topTracks);
  };

  const handleShuffle = () => {
    if (topTracks.length > 0) {
      const shuffled = [...topTracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  const artistAvatar = artist?.imageUrl || artist?.avatarUrl || (topTracks[0] ? resolveArtwork(topTracks[0]) : '');

  return (
    <FeatureErrorBoundary featureName="Artist">
      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen text-[#F5F7FA] font-sans select-none pb-44 md:pb-28">
        
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#9AA1AD] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        {isLoading ? (
          <div className="space-y-6">
            <NeoSkeleton variant="hero" />
            <NeoSkeleton variant="track" count={6} />
          </div>
        ) : !artist ? (
          <NeoEmptyState
            icon={User}
            title="Artist not found"
            description="We couldn't locate this artist in the catalog."
            actionText="Explore Browse"
            onAction={() => router.push('/browse')}
          />
        ) : (
          <>
            {/* ── 1. ARTIST HERO HEADER ── */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
              {artistAvatar && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-2/3 bg-cover bg-center filter blur-[80px] opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url(${artistAvatar})` }}
                />
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Artwork
                  source={artistAvatar}
                  size="large"
                  aspectRatio="circle"
                  alt={artist.name}
                  type="artist"
                  className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-2 border-white/15 shadow-2xl shrink-0"
                />

                <div className="space-y-3 text-center sm:text-left min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25">
                    <Sparkles className="h-3 w-3 text-[#DFFF00]" /> VERIFIED ARTIST
                  </span>

                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                    {artist.name}
                  </h1>

                  {artist.genres && artist.genres.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      {artist.genres.map((g) => (
                        <span key={g} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-[#9AA1AD]">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <NeoButton
                      variant="primary"
                      size="md"
                      onClick={handlePlayAll}
                      disabled={topTracks.length === 0}
                    >
                      <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play Artist
                    </NeoButton>

                    <NeoButton
                      variant="secondary"
                      size="md"
                      onClick={handleShuffle}
                      disabled={topTracks.length === 0}
                    >
                      <Shuffle className="h-4 w-4" /> Shuffle
                    </NeoButton>

                    <NeoButton
                      variant={isFollowing ? 'secondary' : 'outline'}
                      size="md"
                      onClick={() => {
                        setIsFollowing(!isFollowing);
                        showToast(isFollowing ? `Unfollowed ${artist.name}` : `Following ${artist.name}`);
                      }}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="h-4 w-4 text-[#DFFF00]" /> Following
                        </>
                      ) : (
                        'Follow'
                      )}
                    </NeoButton>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. POPULAR TRACKS ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] px-2">
                Popular Tracks ({topTracks.length})
              </h3>

              <div className="space-y-1">
                {topTracks.map((trk, idx) => (
                  <NeoTrackRow
                    key={`${trk.id}_${idx}`}
                    track={trk}
                    index={idx}
                    showIndex={true}
                    playlistContext={topTracks}
                  />
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
