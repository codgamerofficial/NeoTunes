'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artist, Track } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { Play, CheckCircle2, Heart, ArrowLeft, Users, Sparkles, Disc, ListPlus, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

function SingleArtistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'shakira').toLowerCase();
  
  const { playTrack, addToQueue, currentTrack } = usePlaybackStore();
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

        // 1. Try Spotify getArtist
        if (rawId.startsWith('spotify:') || rawId.length >= 10) {
          fetchedArtist = await spotifyProvider.getArtist(rawId);
          if (fetchedArtist) {
            fetchedTracks = await spotifyProvider.getArtistTopTracks(fetchedArtist.sourceId || rawId);
          }
        }

        // 2. If not found, search via MusicSearchService
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
              genres: ['Pop', 'Music'],
              followers: 5000000,
            };
            fetchedTracks = searchRes.songs;
          }
        }

        if (isMounted) {
          setArtist(fetchedArtist);
          setTopTracks(fetchedTracks);
        }
      } catch (err) {
        console.warn('Error loading artist page:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadArtistData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const handlePlayPopular = () => {
    if (topTracks.length === 0) return;
    playTrack(topTracks[0], topTracks);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-[#788094] text-xs font-mono animate-pulse min-h-screen bg-[#05060A]">
        Loading real artist catalog...
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-10 text-center space-y-4 min-h-screen bg-[#05060A] text-white">
        <h2 className="text-xl font-bold">Artist Not Found</h2>
        <p className="text-xs text-white/50">Unable to locate artist details for "{rawId}".</p>
        <button
          onClick={() => router.push('/search')}
          className="px-5 py-2 rounded-full bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 text-xs font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05060A] text-white font-sans select-none pb-36">
      {/* Hero Banner */}
      <div className="relative h-96 w-full overflow-hidden">
        {artist.imageUrl || artist.avatarUrl ? (
          <img
            src={artist.imageUrl || artist.avatarUrl}
            alt={artist.name}
            className="h-full w-full object-cover filter brightness-75"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#121620] to-[#05060A]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#05060A] via-[#05060A]/50 to-transparent" />

        <div className="absolute bottom-8 left-6 right-6 space-y-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#00D9FF]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#00D9FF]">VERIFIED ARTIST</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">{artist.name}</h1>
          {artist.followers ? (
            <p className="text-sm font-semibold text-white/70">
              {artist.followers.toLocaleString()} followers
            </p>
          ) : null}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPopular}
            className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#00D9FF] via-[#7657FF] to-[#FF2E9A] text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,217,255,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="h-5 w-5 fill-black ml-0.5" />
            <span>Play Popular</span>
          </button>

          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-3 rounded-full border text-xs font-bold transition-all cursor-pointer ${
              isFollowing
                ? 'bg-white/20 border-white text-white'
                : 'border-white/20 hover:border-white text-white/80 hover:text-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Popular Tracks Section */}
        {topTracks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white tracking-wide">Popular Tracks</h2>

            <div className="space-y-2">
              {topTracks.map((tr, idx) => {
                const isCurrent = (currentTrack?.canonicalId || currentTrack?.id) === (tr.canonicalId || tr.id);
                return (
                  <div
                    key={tr.canonicalId || tr.id}
                    onClick={() => playTrack(tr, topTracks)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                      isCurrent
                        ? 'bg-[#171B26] border-[#00D9FF]/40 shadow-lg'
                        : 'bg-[#121620] border-white/5 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <span className="text-xs font-mono font-bold text-white/40 w-5 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <Artwork
                        source={tr.artworkUrl || tr.coverUrl}
                        size="medium"
                        canonicalId={tr.canonicalId || tr.id}
                        type="track"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <h3
                          className={`font-bold text-sm truncate ${
                            isCurrent ? 'text-[#00D9FF]' : 'text-white group-hover:text-[#00D9FF]'
                          }`}
                        >
                          {tr.title}
                        </h3>
                        <p className="text-xs text-white/50 truncate mt-0.5 font-medium">
                          {typeof tr.album === 'string' ? tr.album : tr.album?.name || 'Single'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {tr.duration > 0 && (
                        <span className="text-xs font-mono text-white/40 hidden sm:block">
                          {Math.floor(tr.duration / 60)}:{String(tr.duration % 60).padStart(2, '0')}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(tr);
                        }}
                        className="p-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                      >
                        <ListPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Artist Genres */}
        {artist.genres && artist.genres.length > 0 && (
          <div className="p-5 rounded-3xl bg-[#121620] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#00D9FF]">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Genres & Style</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {artist.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Suspense } from 'react';

export default function ArtistPage() {
  return (
    <FeatureErrorBoundary featureName="Artist">
      <Suspense fallback={<div className="p-10 text-[#9298A8] text-xs font-mono animate-pulse">Loading Artist...</div>}>
        <SingleArtistPage />
      </Suspense>
    </FeatureErrorBoundary>
  );
}

