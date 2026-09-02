'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Album, Track } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Heart, ArrowLeft, Disc3, Shuffle, Share2 } from 'lucide-react';
import { useToast } from '@/components/ui/NeoToast';

export default function SingleAlbumPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'after-hours').toLowerCase();
  
  const { playTrack } = usePlaybackStore();
  const { showToast } = useToast();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAlbumData() {
      setIsLoading(true);
      try {
        let fetchedAlbum: Album | null = null;
        let fetchedTracks: Track[] = [];

        if (rawId.startsWith('spotify:') || rawId.length >= 10) {
          fetchedAlbum = await spotifyProvider.getAlbum(rawId);
          if (fetchedAlbum) {
            fetchedTracks = await spotifyProvider.getAlbumTracks(fetchedAlbum.sourceId || rawId);
          }
        }

        if (!fetchedAlbum) {
          const queryTerm = rawId.replace(/[-_]/g, ' ');
          const searchRes = await MusicSearchService.searchAll(queryTerm);
          if (searchRes.albums.length > 0) {
            fetchedAlbum = searchRes.albums[0];
            fetchedTracks = searchRes.songs.filter((s) => {
              const albumName = typeof s.album === 'string' ? s.album : s.album?.name || '';
              return albumName.toLowerCase().includes((fetchedAlbum!.title || fetchedAlbum!.name || '').toLowerCase());
            });
            if (fetchedTracks.length === 0) fetchedTracks = searchRes.songs;
          } else if (searchRes.songs.length > 0) {
            const firstSong = searchRes.songs[0];
            const albumName = typeof firstSong.album === 'string' ? firstSong.album : firstSong.album?.name || 'Single';
            const artistNames = firstSong.artists.map((a) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean);
            fetchedAlbum = {
              id: `spotify:album:${firstSong.id}`,
              canonicalId: `spotify:album:${firstSong.id}`,
              source: 'spotify',
              sourceId: firstSong.id,
              title: albumName,
              name: albumName,
              artists: artistNames,
              artistName: artistNames.join(', '),
              artworkUrl: firstSong.artworkUrl || firstSong.coverUrl,
              coverUrl: firstSong.artworkUrl || firstSong.coverUrl,
              releaseDate: '2024',
              totalTracks: searchRes.songs.length,
            };
            fetchedTracks = searchRes.songs;
          }
        }

        if (isMounted) {
          setAlbum(fetchedAlbum);
          setTracks(fetchedTracks);
        }
      } catch (err) {
        console.warn('Album load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAlbumData();
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

  const albumArtwork = album?.artworkUrl || album?.coverUrl || (tracks[0] ? resolveArtwork(tracks[0]) : '');

  return (
    <FeatureErrorBoundary featureName="Album">
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
        ) : !album ? (
          <NeoEmptyState
            icon={Disc3}
            title="Album not found"
            description="We couldn't locate this album in the catalog."
            actionText="Explore Browse"
            onAction={() => router.push('/browse')}
          />
        ) : (
          <>
            {/* ── 1. ALBUM HERO HEADER ── */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#171A21] via-[#11141A] to-[#0B0D12] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-2xl">
              {albumArtwork && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-2/3 bg-cover bg-center filter blur-[80px] opacity-20 pointer-events-none"
                  style={{ backgroundImage: `url(${albumArtwork})` }}
                />
              )}

              <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Artwork
                  source={albumArtwork}
                  size="large"
                  canonicalId={album.id}
                  type="album"
                  className="w-40 h-40 sm:w-52 sm:h-52 rounded-2xl object-cover border border-white/10 shadow-2xl shrink-0"
                />

                <div className="space-y-3 text-center sm:text-left min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5FF] px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/25 inline-block">
                    ALBUM
                  </span>

                  <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {album.title || album.name}
                  </h1>

                  <p className="text-xs sm:text-sm font-semibold text-[#9AA1AD]">
                    {album.artistName || (Array.isArray(album.artists) ? album.artists.join(', ') : 'Artist')}
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-[#9AA1AD] pt-1">
                    {album.releaseDate && <span>{album.releaseDate.substring(0, 4)}</span>}
                    <span>•</span>
                    <span>{tracks.length} tracks</span>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <NeoButton
                      variant="primary"
                      size="md"
                      onClick={handlePlayAll}
                      disabled={tracks.length === 0}
                    >
                      <Play className="h-4 w-4 fill-black text-black ml-0.5" /> Play Album
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
                        setIsSaved(!isSaved);
                        showToast(isSaved ? 'Removed from Library' : 'Saved to Library');
                      }}
                      className={`p-3 rounded-full border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-[#DFFF00]/15 border-[#DFFF00]/40 text-[#DFFF00]'
                          : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white'
                      }`}
                      title="Save Album"
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? 'fill-[#DFFF00]' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. ALBUM TRACKLIST ── */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] px-2">
                Album Tracks ({tracks.length})
              </h3>

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
            </div>
          </>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
