'use client';

import React, { useState, useEffect } from 'react';
import { Track, getArtistName } from '@/types';
import SynchronizedLyricsView, { LyricLine } from './SynchronizedLyricsView';
import QueueDrawer from './QueueDrawer';
import DeviceSelectorModal from './DeviceSelectorModal';
import { Artwork } from '@/components/ui/Artwork';
import { usePlaybackStore } from '@/store/playback-store';
import { resolveArtwork } from '@/utils/artwork';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Plus, ListMusic, Mic2, Sparkles, Headphones, Play, Check } from 'lucide-react';

export type ContextTab = 'queue' | 'lyrics' | 'recs' | 'devices';

interface PlayerContextPanelProps {
  activeTab: ContextTab;
  onSelectTab: (tab: ContextTab) => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  lyrics: { time: number; text: string }[] | null;
  lyricsLoading: boolean;
  onSeek: (time: number) => void;
  className?: string;
  onOpenFullQueue?: () => void;
}

function UpNextTab({ onOpenFullQueue }: { onOpenFullQueue?: () => void }) {
  const { queue, currentTrack, playTrack, addToQueue } = usePlaybackStore();

  const upNextTracks = queue.length > 0 ? queue : (currentTrack ? [currentTrack] : []);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-full flex flex-col justify-between p-3 select-none">
      <div className="space-y-1.5 overflow-y-auto scrollbar-none flex-1 pr-1">
        {upNextTracks.slice(0, 7).map((item, idx) => {
          const isCurrent = currentTrack?.id === item.id;
          const art = resolveArtwork(item);
          const artist = getArtistName(item.artists || item.artist);

          return (
            <div
              key={`${item.id}-${idx}`}
              onClick={() => playTrack(item)}
              className={`p-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer group ${
                isCurrent
                  ? 'bg-[#DFFF00]/10 border border-[#DFFF00]/30 text-white'
                  : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-white/5 border border-white/5">
                  <Artwork
                    source={art}
                    size="small"
                    canonicalId={item.id}
                    className="w-full h-full object-cover"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#DFFF00] animate-ping" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold truncate ${isCurrent ? 'text-[#DFFF00]' : 'text-[#F5F7FA] group-hover:text-[#DFFF00] transition-colors'}`}>
                    {item.title}
                  </div>
                  <div className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                    {artist}
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-[#9AA1AD] font-medium shrink-0">
                {formatTime(item.duration || 180)}
              </span>
            </div>
          );
        })}
      </div>

      {onOpenFullQueue && (
        <button
          onClick={onOpenFullQueue}
          className="mt-3 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#F5F7FA] hover:text-[#DFFF00] transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
        >
          <ListMusic className="h-3.5 w-3.5" /> View Full Queue
        </button>
      )}
    </div>
  );
}

function RecommendationsTab({ track }: { track: Track | null }) {
  const { playTrack, addToQueue } = usePlaybackStore();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const artistName = track ? getArtistName(track.artists || track.artist) : 'Artist';

  useEffect(() => {
    if (!track?.title) return;
    let isMounted = true;
    setLoading(true);

    const query = `${artistName} ${track.title}`;
    MusicSearchService.searchAll(query)
      .then((res) => {
        if (isMounted) {
          if (res && res.songs && res.songs.length > 1) {
            setRecommendations(res.songs.filter((s) => s.id !== track.id).slice(0, 8));
          } else {
            setRecommendations([]);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [track?.id, track?.title, artistName]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-none p-3 space-y-2 select-none">
      {loading ? (
        <div className="text-xs text-[#9AA1AD] animate-pulse py-8 text-center">
          Discovering similar tracks...
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-xs text-[#9AA1AD] py-8 text-center">
          No recommendations found for this track.
        </div>
      ) : (
        recommendations.map((rec, idx) => {
          const recArtwork = resolveArtwork(rec);
          const recArtist = getArtistName(rec.artists || rec.artist);

          return (
            <div
              key={`${rec.id}_${idx}`}
              onClick={() => playTrack(rec)}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.04] flex items-center justify-between gap-2.5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Artwork
                  source={recArtwork}
                  size="small"
                  canonicalId={rec.id}
                  type="track"
                  className="h-10 w-10 rounded-lg shrink-0 object-cover border border-white/5"
                />

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#DFFF00] transition-colors truncate">
                    {rec.title}
                  </div>
                  <div className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                    {recArtist}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(rec);
                }}
                aria-label="Add to Queue"
                className="p-1.5 text-[#9AA1AD] hover:text-[#DFFF00] transition-colors cursor-pointer shrink-0"
                title="Add to Queue"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function PlayerContextPanel({
  activeTab,
  onSelectTab,
  track,
  isPlaying,
  currentTime,
  lyrics,
  lyricsLoading,
  onSeek,
  className = '',
  onOpenFullQueue,
}: PlayerContextPanelProps) {
  const formattedLyrics: LyricLine[] | null = lyrics && lyrics.length > 0
    ? lyrics.map((l) => ({ timeMs: l.time * 1000, text: l.text }))
    : null;

  const tabOptions = [
    { id: 'queue', label: 'Up Next', icon: ListMusic },
    { id: 'lyrics', label: 'Lyrics', icon: Mic2 },
    { id: 'recs', label: 'Recs', icon: Sparkles },
    { id: 'devices', label: 'Devices', icon: Headphones },
  ] as const;

  return (
    <div className={`flex flex-col h-full w-full bg-[#11141A]/95 rounded-3xl border border-white/[0.08] backdrop-blur-xl overflow-hidden shadow-2xl ${className}`}>
      
      {/* Header Tab Controls */}
      <div className="px-2.5 py-2 border-b border-white/[0.06] shrink-0 bg-[#0B0D12]/60">
        <div className="grid grid-cols-4 gap-1 w-full">
          {tabOptions.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as ContextTab)}
                className={`py-1.5 px-1 rounded-full text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer truncate ${
                  isActive
                    ? 'bg-[#DFFF00] text-black font-bold shadow-sm'
                    : 'text-[#9AA1AD] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Body */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'queue' && (
          <UpNextTab onOpenFullQueue={onOpenFullQueue} />
        )}

        {activeTab === 'lyrics' && (
          <SynchronizedLyricsView
            lyrics={formattedLyrics}
            currentTimeMs={currentTime * 1000}
            onSeek={onSeek}
          />
        )}

        {activeTab === 'recs' && (
          <RecommendationsTab track={track} />
        )}

        {activeTab === 'devices' && (
          <DeviceSelectorModal isOpen={true} onClose={() => {}} inline={true} />
        )}
      </div>

    </div>
  );
}
