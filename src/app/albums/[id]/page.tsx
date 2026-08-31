'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Album, Track } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { Play, Heart, ArrowLeft, Disc3, Shuffle } from 'lucide-react';
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

  return (
    <FeatureErrorBoundary featureName="Album Detail">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Back Navigation */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Album Hero Header */}
        {isLoading ? (
          <NeoSkeleton variant="card" count={1} className="h-48" />
        ) : album ? (
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-white/[0.06]">
            <Artwork
              source={album.artworkUrl || album.coverUrl}
              size="large"
              alt={album.title || album.name}
              className="w-36 h-36 sm:w-48 sm:h-48 rounded-2xl object-cover border border-white/10 shadow-2xl shrink-0"
            />

            <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00E5FF]">
                Album
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {album.title || album.name}
              </h1>
              <p className="text-sm font-semibold text-[#9AA1AD]">
                {album.artistName || (album.artists ? album.artists.join(', ') : 'Artist')} • {album.releaseDate ? album.releaseDate.substring(0, 4) : '2024'} • {tracks.length} songs
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
                      setIsSaved(!isSaved);
                      showToast(isSaved ? 'Removed from Library' : 'Saved album to Library');
                    }}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-[#DFFF00] text-[#DFFF00]' : ''}`} />
                  </NeoButton>
                </div>
              )}
            </div>
          </div>
        ) : (
          <NeoEmptyState
            icon={Disc3}
            title="Album not found"
            description="The requested album could not be found."
            actionLabel="Return to Browse"
            onAction={() => router.push('/browse')}
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
