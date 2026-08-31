'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import { useRouter } from 'next/navigation';
import { Track, getArtistName } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { 
  Play, 
  Heart, 
  Shuffle, 
  Search, 
  ArrowUpDown, 
  X,
  Music
} from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { resolveArtwork } from '@/utils/artwork';
import { likedSongsService } from '@/services/likedSongsService';

type SortMode = 'recently_added' | 'alphabetical' | 'artist';

export default function LikedPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack } = usePlaybackStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recently_added');

  const { data: tracks = [], isLoading } = useQuery<Track[]>({
    queryKey: ['liked-songs'],
    queryFn: async () => {
      return likedSongsService.getLikedTracks();
    },
  });

  useEffect(() => {
    const handleLikedChange = () => {
      queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
    };

    window.addEventListener('neotunes_liked_change', handleLikedChange);
    return () => {
      window.removeEventListener('neotunes_liked_change', handleLikedChange);
    };
  }, [queryClient]);

  const filteredTracks = tracks
    .filter((tr) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tr.title.toLowerCase().includes(q) ||
        getArtistName(tr.artists || tr.artist).toLowerCase().includes(q) ||
        (typeof tr.album === 'string' ? tr.album.toLowerCase().includes(q) : false)
      );
    })
    .sort((a, b) => {
      if (sortMode === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortMode === 'artist') return getArtistName(a.artists || a.artist).localeCompare(getArtistName(b.artists || b.artist));
      return 0;
    });

  const totalDurationSeconds = filteredTracks.reduce((acc, t) => acc + (t.duration || 180), 0);
  const totalMinutes = Math.floor(totalDurationSeconds / 60);

  const handlePlayAll = () => {
    if (filteredTracks.length === 0) return;
    playTrack(filteredTracks[0], filteredTracks);
  };

  const handleShufflePlay = () => {
    if (filteredTracks.length === 0) return;
    const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <FeatureErrorBoundary featureName="Liked Songs">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 pb-6 border-b border-white/[0.06]">
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-2xl bg-gradient-to-br from-[#DFFF00] via-[#00E5FF] to-[#171A21] flex items-center justify-center shadow-2xl shrink-0 border border-white/10">
            <Heart className="h-16 w-16 text-black fill-black" />
          </div>

          <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00]">
              Playlist
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Liked Songs
            </h1>
            <p className="text-xs text-[#9AA1AD]">
              {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • {totalMinutes > 0 ? `${totalMinutes} min` : '0 min'}
            </p>

            {tracks.length > 0 && (
              <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
                <NeoButton
                  variant="primary"
                  size="md"
                  onClick={handlePlayAll}
                >
                  <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play All
                </NeoButton>

                <NeoButton
                  variant="secondary"
                  size="md"
                  onClick={handleShufflePlay}
                >
                  <Shuffle className="h-4 w-4" /> Shuffle
                </NeoButton>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Sort Bar */}
        {tracks.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex items-center bg-[#11141A] border border-white/10 rounded-2xl px-3.5 py-2 flex-1 sm:max-w-xs">
              <Search className="h-3.5 w-3.5 text-[#9AA1AD] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search liked songs..."
                className="bg-transparent text-xs text-white placeholder-[#9AA1AD] focus:outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#9AA1AD] hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#9AA1AD]" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-[#11141A] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="recently_added" className="bg-[#11141A] text-white">Recently Added</option>
                <option value="alphabetical" className="bg-[#11141A] text-white">A–Z Title</option>
                <option value="artist" className="bg-[#11141A] text-white">Artist Name</option>
              </select>
            </div>
          </div>
        )}

        {/* Tracks List */}
        {isLoading ? (
          <NeoSkeleton variant="track" count={6} />
        ) : tracks.length === 0 ? (
          <NeoEmptyState
            icon={Heart}
            title="Save the songs that stay with you"
            description="Tap the heart icon on any song to save it here for instant listening."
            actionLabel="Discover Music"
            onAction={() => router.push('/browse')}
          />
        ) : filteredTracks.length === 0 ? (
          <NeoEmptyState
            icon={Search}
            title="No songs found"
            description={`No liked songs match "${searchQuery}".`}
            actionLabel="Clear Filter"
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <div className="space-y-1">
            {filteredTracks.map((trk, idx) => (
              <NeoTrackRow
                key={trk.id}
                track={trk}
                index={idx}
                showIndex={true}
                playlistContext={filteredTracks}
              />
            ))}
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
