'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { spotifyProvider } from '@/services/providers';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Playlist, Track } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { Play, Heart, Share2, Download, Users, Clock, ArrowLeft, Disc, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SinglePlaylistPage() {
  const router = useRouter();
  const rawParams = useParams();
  const rawId = (rawParams?.id as string || 'chill-hits').toLowerCase();

  const { playTrack, currentTrack } = usePlaybackStore();
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

        if (rawId.startsWith('spotify:') || rawId.length >= 10) {
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
        console.warn('Error loading playlist page:', err);
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
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-[#788094] text-xs font-mono animate-pulse min-h-screen bg-[#050505]">
        Loading playlist catalog...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-10 text-center space-y-4 min-h-screen bg-[#050505] text-white">
        <h2 className="text-xl font-bold">Playlist Not Found</h2>
        <p className="text-xs text-white/50">Unable to locate playlist details for "{rawId}".</p>
        <button
          onClick={() => router.push('/search')}
          className="px-5 py-2 rounded-full bg-[#101010] border border-white/10 hover:border-[#00D4FF]/40 text-xs font-bold"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans select-none pb-36">
      {/* Dynamic Header Backdrop */}
      <div className="relative p-6 md:p-10 bg-gradient-to-b from-[#151226] via-[#0A0A0A] to-[#050505] border-b border-white/10 space-y-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <Artwork
            source={playlist.artworkUrl || playlist.coverUrl}
            size="xlarge"
            canonicalId={playlist.canonicalId || playlist.id}
            type="playlist"
            className="shadow-[0_20px_60px_rgba(0,212,255,0.25)] rounded-[32px]"
          />

          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
                PLAYLIST
              </span>
              {playlist.isCollaborative && (
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FF2D95]/20 text-[#FF2D95] border border-[#FF2D95]/40 flex items-center gap-1">
                  <Users className="h-3 w-3" /> Collaborative
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white capitalize">{playlist.name}</h1>
            {playlist.description && <p className="text-sm text-white/60 max-w-xl">{playlist.description}</p>}

            <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-medium text-white/50 pt-1">
              <span className="font-bold text-white">{playlist.owner || 'NeoTunes'}</span>
              <span>•</span>
              <span>{playlist.totalTracks || tracks.length} songs</span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handlePlayAll}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform cursor-pointer"
          >
            <Play className="h-6 w-6 fill-black ml-0.5" />
          </button>

          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-3.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-[#FF2D95] transition-all cursor-pointer"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
          </button>
        </div>
      </div>

      {/* TRACKS TABLE */}
      {tracks.length > 0 && (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-2">
          <div className="grid grid-cols-12 text-xs font-bold text-white/40 uppercase tracking-widest pb-3 px-4 border-b border-white/10">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-4 hidden md:block">Album</div>
            <div className="col-span-1 text-right"><Clock className="h-4 w-4 inline" /></div>
          </div>

          {tracks.map((tr, idx) => {
            const isCurrent = (currentTrack?.canonicalId || currentTrack?.id) === (tr.canonicalId || tr.id);
            const artistStr = Array.isArray(tr.artists) ? tr.artists.join(', ') : (tr.artist as any)?.name || tr.artist || 'Artist';
            return (
              <motion.div
                key={tr.canonicalId || tr.id + idx}
                onClick={() => playTrack(tr, tracks)}
                whileHover={{ x: 2 }}
                className={`grid grid-cols-12 items-center p-3.5 rounded-2xl cursor-pointer transition-all group ${
                  isCurrent ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30' : 'bg-[#101010] border border-white/5 hover:border-[#00D4FF]/40'
                }`}
              >
                <div className="col-span-1 text-xs font-mono font-bold text-white/40">{idx + 1}</div>
                <div className="col-span-6 flex items-center gap-3 min-w-0">
                  <Artwork
                    source={tr.artworkUrl || tr.coverUrl}
                    size="small"
                    canonicalId={tr.canonicalId || tr.id}
                    type="track"
                  />
                  <div className="min-w-0">
                    <div className={`font-bold text-sm truncate transition-colors ${isCurrent ? 'text-[#00D4FF]' : 'text-white group-hover:text-[#00D4FF]'}`}>{tr.title}</div>
                    <div className="text-xs text-white/50 truncate">{artistStr}</div>
                  </div>
                </div>
                <div className="col-span-4 hidden md:block text-xs text-white/50 truncate">
                  {typeof tr.album === 'string' ? tr.album : tr.album?.name || 'Single'}
                </div>
                <div className="col-span-1 text-right text-xs font-mono text-white/40">
                  {tr.duration > 0 ? `${Math.floor(tr.duration / 60)}:${String(tr.duration % 60).padStart(2, '0')}` : '3:30'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

