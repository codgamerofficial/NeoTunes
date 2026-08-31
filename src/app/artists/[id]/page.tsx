'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artist, Track } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { useToast } from '@/components/ui/NeoToast';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Heart, ArrowLeft, User, Shuffle, Check } from 'lucide-react';

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

  return (
    <FeatureErrorBoundary featureName="Artist Profile">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Artist Hero Header */}
        {isLoading ? (
          <NeoSkeleton variant="card" count={1} className="h-48" />
        ) : artist ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-white/[0.06]">
            <Artwork
              source={artist.imageUrl || artist.avatarUrl}
              size="large"
              aspectRatio="circle"
              type="artist"
              alt={artist.name}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover border-2 border-[#DFFF00]/30 shadow-2xl shrink-0"
            />

            <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] px-2.5 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
                  Verified Artist
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {artist.name}
              </h1>

              <p className="text-xs text-[#9AA1AD] font-medium">
                {artist.genres ? artist.genres.join(' • ') : 'Pop / Regional'}
              </p>

              <div className="pt-3 flex items-center justify-center sm:justify-start gap-3">
                {topTracks.length > 0 && (
                  <>
                    <NeoButton variant="primary" size="md" onClick={handlePlayAll}>
                      <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play Top Tracks
                    </NeoButton>
                    <NeoButton variant="secondary" size="md" onClick={handleShuffle}>
                      <Shuffle className="h-4 w-4" /> Shuffle
                    </NeoButton>
                  </>
                )}

                <NeoButton
                  variant={isFollowing ? 'secondary' : 'ghost'}
                  size="md"
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                    showToast(isFollowing ? `Unfollowed ${artist.name}` : `Following ${artist.name}`);
                  }}
                >
                  {isFollowing ? <Check className="h-4 w-4 text-[#DFFF00]" /> : <Heart className="h-4 w-4" />}
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </NeoButton>
              </div>
            </div>
          </div>
        ) : (
          <NeoEmptyState
            icon={User}
            title="Artist not found"
            description="The requested artist could not be loaded."
            actionLabel="Return to Search"
            onAction={() => router.push('/search')}
          />
        )}

        {/* Popular Songs */}
        {!isLoading && topTracks.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold text-[#DFFF00] uppercase tracking-wider px-1">
              Popular Tracks
            </h2>
            <div className="space-y-1">
              {topTracks.map((trk, idx) => (
                <NeoTrackRow
                  key={trk.id}
                  track={trk}
                  index={idx}
                  showIndex={true}
                  playlistContext={topTracks}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
