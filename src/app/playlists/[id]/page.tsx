'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Playlist, Track } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { useToast } from '@/components/ui/NeoToast';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Heart, Share2, ArrowLeft, Music, Shuffle } from 'lucide-react';

export default function SinglePlaylistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'chill-hits').toLowerCase();

  const { playTrack } = usePlaybackStore();
  const { showToast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPlaylistData() {
      setIsLoading(true);
      try {
        let fetchedPlaylist: Playlist | null = null;

        // 1. Check API endpoint
        try {
          const apiRes = await fetch(`/api/playlists/${rawId}`);
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            if (apiData && !apiData.error) {
              fetchedPlaylist = {
                id: apiData.id,
                canonicalId: apiData.id,
                source: 'local',
                sourceId: apiData.id,
                name: apiData.name,
                description: apiData.description || 'User playlist on NeoTunes.',
                owner: 'You',
                artworkUrl: apiData.cover_url || apiData.tracks?.[0]?.artworkUrl || apiData.tracks?.[0]?.coverUrl || '',
                coverUrl: apiData.cover_url || apiData.tracks?.[0]?.artworkUrl || apiData.tracks?.[0]?.coverUrl || '',
                totalTracks: apiData.tracks?.length || 0,
                tracks: apiData.tracks || [],
              };
            }
          }
        } catch {}

        // 2. Check local storage
        if (!fetchedPlaylist) {
          try {
            const localPlaylists = JSON.parse(localStorage.getItem('neotunes_local_playlists') || '[]');
            const found = localPlaylists.find((p: any) => p.id === rawId);
            const storedTracks = JSON.parse(localStorage.getItem(`neotunes_playlist_tracks_${rawId}`) || '[]');
            if (found || storedTracks.length > 0) {
              fetchedPlaylist = {
                id: rawId,
                canonicalId: rawId,
                source: 'local',
                sourceId: rawId,
                name: found?.name || rawId.replace(/[-_]/g, ' '),
                description: found?.description || 'Custom playlist on NeoTunes.',
                owner: 'You',
                artworkUrl: found?.coverUrl || storedTracks[0]?.artworkUrl || storedTracks[0]?.coverUrl || '',
                coverUrl: found?.coverUrl || storedTracks[0]?.artworkUrl || storedTracks[0]?.coverUrl || '',
                totalTracks: storedTracks.length,
                tracks: storedTracks,
              };
            }
          } catch {}
        }

        if (!fetchedPlaylist && (rawId.startsWith('spotify:') || rawId.length >= 10)) {
          fetchedPlaylist = await spotifyProvider.getPlaylist(rawId);
        }

        if (!fetchedPlaylist) {
          const queryTerm = rawId.replace(/[-_]/g, ' ');
          const searchRes = await MusicSearchService.searchAll(queryTerm);
          if (searchRes.playlists.length > 0) {
            fetchedPlaylist = searchRes.playlists[0];
          } else if (searchRes.songs.length > 0) {
            const firstSong = searchRes.songs[0];
            fetchedPlaylist = {
              id: `spotify:playlist:${firstSong.id}`,
              canonicalId: `spotify:playlist:${firstSong.id}`,
              source: 'spotify',
              sourceId: firstSong.id,
              name: rawId.replace(/[-_]/g, ' ').toUpperCase(),
              description: `Curated audio compilation on NeoTunes.`,
              owner: 'NeoTunes Editors',
              artworkUrl: firstSong.artworkUrl || firstSong.coverUrl,
              coverUrl: firstSong.artworkUrl || firstSong.coverUrl,
              totalTracks: searchRes.songs.length,
              tracks: searchRes.songs,
            };
          }
        }

        if (isMounted) {
          setPlaylist(fetchedPlaylist);
          setTracks(fetchedPlaylist?.tracks || []);
        }
      } catch (err) {
        console.warn('Playlist load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPlaylistData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const handlePlayAll = () => {
    if (tracks.length > 0) playTrack(tracks[0], tracks);
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  };

  return (
    <FeatureErrorBoundary featureName="Playlist Detail">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Top Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Playlist Hero Header */}
        {isLoading ? (
          <NeoSkeleton variant="card" count={1} className="h-48" />
        ) : playlist ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-white/[0.06]">
            <Artwork
              source={playlist.artworkUrl || playlist.coverUrl}
              size="large"
              alt={playlist.name}
              className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl object-cover border border-white/10 shadow-2xl shrink-0"
            />

            <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00]">
                Playlist
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {playlist.name}
              </h1>
              <p className="text-xs text-[#9AA1AD] leading-relaxed line-clamp-2">
                {playlist.description || `Curated collection with ${tracks.length} songs.`}
              </p>
              <p className="text-xs text-[#9AA1AD] font-medium">
                Created by <span className="text-white">{playlist.owner || 'NeoTunes'}</span> • {tracks.length} songs
              </p>

              {tracks.length > 0 && (
                <div className="pt-3 flex items-center justify-center sm:justify-start gap-3">
                  <NeoButton variant="primary" size="md" onClick={handlePlayAll}>
                    <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play
                  </NeoButton>
                  <NeoButton variant="secondary" size="md" onClick={handleShuffle}>
                    <Shuffle className="h-4 w-4" /> Shuffle
                  </NeoButton>
                  <NeoButton
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setIsLiked(!isLiked);
                      showToast(isLiked ? 'Removed from Library' : 'Saved playlist to Library');
                    }}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#DFFF00] text-[#DFFF00]' : ''}`} />
                  </NeoButton>
                </div>
              )}
            </div>
          </div>
        ) : (
          <NeoEmptyState
            icon={Music}
            title="Playlist not found"
            description="The requested playlist could not be loaded."
            actionLabel="Return to Library"
            onAction={() => router.push('/library')}
          />
        )}

        {/* Tracks List */}
        {!isLoading && tracks.length > 0 && (
          <div className="space-y-1">
            {tracks.map((trk, idx) => (
              <NeoTrackRow
                key={trk.id}
                track={trk}
                index={idx}
                showIndex={true}
                playlistContext={tracks}
              />
            ))}
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
