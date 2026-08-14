'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Album, Track } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { Play, Heart, ArrowLeft, Disc, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SingleAlbumPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'after-hours').toLowerCase();
  
  const { playTrack, currentTrack } = usePlaybackStore();
  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            };
            fetchedTracks = searchRes.songs;
          }
        }

        if (isMounted) {
          setAlbum(fetchedAlbum);
          setTracks(fetchedTracks);
        }
      } catch (err) {
        console.warn('Error loading album page:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadAlbumData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const handlePlayAlbum = () => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-[#788094] text-xs font-mono animate-pulse min-h-screen bg-[#050505]">
        Loading album catalog...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-10 text-center space-y-4 min-h-screen bg-[#050505] text-white">
        <h2 className="text-xl font-bold">Album Not Found</h2>
        <p className="text-xs text-white/50">Unable to locate album details for "{rawId}".</p>
        <button
          onClick={() => router.push('/search')}
          className="px-5 py-2 rounded-full bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 text-xs font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const artistStr = Array.isArray(album.artists) ? album.artists.join(', ') : album.artistName || 'Artist';

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans select-none pb-36">
      {/* Header Backdrop */}
      <div className="relative p-6 md:p-10 bg-gradient-to-b from-[#1A1026] via-[#0A0A0A] to-[#050505] border-b border-white/10 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <Artwork
            source={album.artworkUrl || album.coverUrl}
            size="xlarge"
            canonicalId={album.canonicalId || album.id}
            type="album"
            className="shadow-[0_20px_60px_rgba(122,60,255,0.25)] rounded-[32px]"
          />

          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                ALBUM
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Hi-Res Lossless
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">{album.title || album.name}</h1>
            <p className="text-base font-medium text-[#00D4FF]">{artistStr}</p>

            <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-white/50 pt-1">
              {album.releaseDate && <span>{album.releaseDate.substring(0, 4)}</span>}
              <span>•</span>
              <span>{tracks.length} tracks</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handlePlayAlbum}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black font-extrabold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform cursor-pointer"
          >
            <Play className="h-4 w-4 fill-black" /> Play Album
          </button>
        </div>
      </div>

      {/* Tracklist */}
      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-3">
        <h3 className="text-lg font-bold text-white mb-4">Tracklist</h3>

        {tracks.map((tr, idx) => {
          const isCurrent = (currentTrack?.canonicalId || currentTrack?.id) === (tr.canonicalId || tr.id);
          return (
            <motion.div
              key={tr.canonicalId || tr.id}
              onClick={() => playTrack(tr, tracks)}
              whileHover={{ x: 2 }}
              className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all group ${
                isCurrent ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30' : 'bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-mono font-bold text-white/40 w-5">{idx + 1}</span>
                <div>
                  <div className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-[#00D4FF]' : 'text-white group-hover:text-[#00D4FF]'}`}>
                    {tr.title}
                  </div>
                  <div className="text-xs text-white/40">{artistStr}</div>
                </div>
              </div>
              {tr.duration > 0 && (
                <div className="text-xs font-mono text-white/40">
                  {Math.floor(tr.duration / 60)}:{String(tr.duration % 60).padStart(2, '0')}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

