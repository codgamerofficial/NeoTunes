'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Playlist, Track } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { useToast } from '@/components/ui/NeoToast';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Heart, Share2, ArrowLeft, Music, Shuffle, Clock, ListMusic } from 'lucide-react';

export default function SinglePlaylistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'chill-hits').toLowerCase();

  const { playTrack, currentTrack, isPlaying } = usePlaybackStore();
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
            const found = localPlaylists.find((p: any) => p.id === rawId || p.name.toLowerCase() === rawId.toLowerCase());
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
              description: `A collection of tracks featuring ${firstSong.title} and related music.`,
              owner: 'NeoTunes Curator',
              artworkUrl: firstSong.artworkUrl || firstSong.coverUrl,
              coverUrl: firstSong.artworkUrl || firstSong.coverUrl,
              totalTracks: searchRes.songs.length,
              tracks: searchRes.songs,
            };
          }
        }

        if (isMounted) {
          setPlaylist(fetchedPlaylist);
          if (fetchedPlaylist?.tracks && fetchedPlaylist.tracks.length > 0) {
            setTracks(fetchedPlaylist.tracks);
          } else if (fetchedPlaylist) {
            const songRes = await MusicSearchService.searchAll(fetchedPlaylist.name || rawId);
            setTracks(songRes.songs);
          }
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

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: playlist?.name || 'NeoTunes Playlist',
        text: `Listen to "${playlist?.name}" on NeoTunes`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      showToast('Playlist link copied to clipboard');
    }
  };

  const totalDurationSeconds = tracks.reduce((acc, t) => acc + (t.duration || 180), 0);
  const totalMins = Math.floor(totalDurationSeconds / 60);

  const playlistArtwork = playlist?.artworkUrl || playlist?.coverUrl || (tracks[0] ? resolveArtwork(tracks[0]) : '');

  return (
    <FeatureErrorBoundary featureName="Playlist">
      <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen text-[#F5F7FA] font-sans select-none pb-44 md:pb-28">
        
        {/* Top Back Navigation */}
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
        ) : !playlist ? (
          <NeoEmptyState
            icon={ListMusic}
            title="Playlist not found"
            description="We couldn't retrieve this playlist. It may have been removed or is temporarily unavailable."
            actionText="Go to Library"
            onAction={() => router.push('/library')}
          />
        ) : (
          <>
            {/* ── 1. IMMERSIVE PLAYLIST HERO HEADER ── */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
              {playlistArtwork && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-2/3 bg-cover bg-center filter blur-[80px] opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url(${playlistArtwork})` }}
                />
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Artwork
                  source={playlistArtwork}
                  size="large"
                  canonicalId={playlist.id}
                  type="playlist"
                  className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl object-cover border border-white/10 shadow-2xl shrink-0"
                />

                <div className="space-y-3 text-center sm:text-left min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20 inline-block">
                    PLAYLIST
                  </span>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {playlist.name}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#9AA1AD] leading-relaxed max-w-xl">
                    {playlist.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#9AA1AD] pt-1">
                    <span>By {playlist.owner || 'You'}</span>
                    <span>•</span>
                    <span>{tracks.length} songs</span>
                    {totalMins > 0 && (
                      <>
                        <span>•</span>
                        <span>about {totalMins} min</span>
                      </>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <NeoButton
                      variant="primary"
                      size="md"
                      onClick={handlePlayAll}
                      disabled={tracks.length === 0}
                    >
                      <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play All
                    </NeoButton>

                    <NeoButton
                      variant="secondary"
                      size="md"
                      onClick={handleShuffle}
                      disabled={tracks.length === 0}
                    >
                      <Shuffle className="h-4 w-4" /> Shuffle
                    </NeoButton>

                    <button
                      onClick={() => {
                        setIsLiked(!isLiked);
                        showToast(isLiked ? 'Removed from Library' : 'Saved to Library');
                      }}
                      className={`p-3 rounded-full border transition-all cursor-pointer ${
                        isLiked
                          ? 'bg-[#DFFF00]/15 border-[#DFFF00]/40 text-[#DFFF00]'
                          : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white'
                      }`}
                      title="Save Playlist"
                    >
                      <Heart className={`h-4 w-4 ${isLiked ? 'fill-[#DFFF00]' : ''}`} />
                    </button>

                    <button
                      onClick={handleShare}
                      className="p-3 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
                      title="Share Playlist"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. TRACK LIST ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] px-2">
                Tracks ({tracks.length})
              </h3>

              {tracks.length === 0 ? (
                <NeoEmptyState
                  icon={Music}
                  title="No tracks in playlist"
                  description="This playlist currently contains no audio tracks."
                />
              ) : (
                <div className="space-y-1">
                  {tracks.map((trk, idx) => (
                    <NeoTrackRow
                      key={`${trk.id}_${idx}`}
                      track={trk}
                      index={idx}
                      showIndex={true}
                      playlistContext={tracks}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
