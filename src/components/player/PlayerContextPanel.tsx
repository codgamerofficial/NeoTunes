'use client';

import React, { useState, useEffect } from 'react';
import { Track, getArtistName } from '@/types';
import KineticLyricsView, { LyricLine } from './KineticLyricsView';
import QueueDrawer from './QueueDrawer';
import DeviceSelectorModal from './DeviceSelectorModal';
import { Artwork } from '@/components/ui/Artwork';
import { usePlaybackStore } from '@/store/playback-store';
import { resolveArtwork } from '@/utils/artwork';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Plus, Check, Sparkles, Headphones, Radio } from 'lucide-react';

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
}

const AUTOPLAY_FILTERS = ['All', 'Familiar', 'Popular', 'Discover', 'Deep Cuts'];

function RecommendationsPanel({ track }: { track: Track | null }) {
  const { playTrack, addToQueue } = usePlaybackStore();
  const [savedSource, setSavedSource] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [autoplayFilter, setAutoplayFilter] = useState('All');
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const artistName = track ? getArtistName(track.artists || track.artist) : 'Artist';
  const albumTitle = track ? (typeof track.album === 'string' ? track.album : (track.album as any)?.name || 'Album') : 'Album';

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
            // Fallback real tracks
            setRecommendations([
              {
                id: 'rec_starboy',
                canonicalId: 'rec_starboy',
                source: 'spotify',
                sourceId: 'starboy',
                title: 'Starboy',
                artists: ['The Weeknd', 'Daft Punk'],
                artist: 'The Weeknd & Daft Punk',
                album: 'Starboy',
                artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
                duration: 230,
                durationMs: 230000,
                playable: true,
              },
              {
                id: 'rec_belly_dancer',
                canonicalId: 'rec_belly_dancer',
                source: 'spotify',
                sourceId: 'belly_dancer',
                title: 'Belly Dancer',
                artists: ['Imanbek', 'BYOR'],
                artist: 'Imanbek and BYOR',
                album: 'Belly Dancer Single',
                artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
                duration: 152,
                durationMs: 152000,
                playable: true,
              },
              {
                id: 'rec_softly',
                canonicalId: 'rec_softly',
                source: 'spotify',
                sourceId: 'softly',
                title: 'Softly',
                artists: ['Karan Aujla', 'Ikky'],
                artist: 'Karan Aujla & Ikky',
                album: 'Making Memories',
                artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
                duration: 155,
                durationMs: 155000,
                playable: true,
              },
            ]);
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
  }, [track?.title, artistName]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-full w-full overflow-y-auto scrollbar-none p-4 space-y-5 select-none">
      {/* PLAYING FROM HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292929]">
        <div>
          <div className="text-[10px] font-mono font-bold text-[#A0A0A0] uppercase tracking-[0.2em]">
            PLAYING FROM
          </div>
          <div className="text-sm font-bold text-white truncate max-w-[240px]">
            {albumTitle}
          </div>
        </div>

        <button
          onClick={() => setSavedSource(!savedSource)}
          className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            savedSource
              ? 'bg-[#DFFF00]/15 border-[#DFFF00]/50 text-[#DFFF00]'
              : 'bg-white/5 border-[#292929] text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {savedSource ? <Check className="w-3.5 h-3.5 text-[#DFFF00]" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{savedSource ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* AUTOPLAY TOGGLE & FILTER CHIPS */}
      <div className="space-y-3 bg-[#151515] p-3.5 rounded-xl border border-[#292929]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              AUTO-PLAY
            </div>
            <div className="text-[11px] text-[#A0A0A0]">
              Add similar content for endless listening
            </div>
          </div>

          <button
            onClick={() => setAutoplayEnabled(!autoplayEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${
              autoplayEnabled ? 'bg-[#DFFF00]' : 'bg-white/20'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-black shadow-md transition-transform duration-300 ${
                autoplayEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {autoplayEnabled && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
            {AUTOPLAY_FILTERS.map((chip) => {
              const isSelected = autoplayFilter === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setAutoplayFilter(chip)}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-white/5 text-[#A0A0A0] hover:text-white border border-[#292929]'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* RECOMMENDED TRACKS LIST */}
      <div className="space-y-3">
        <div className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
          RECOMMENDED FOR YOU
        </div>

        {loading ? (
          <div className="text-xs font-mono text-[#A0A0A0] animate-pulse py-4 text-center">
            Loading recommendations...
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const recArtwork = resolveArtwork(rec);
              const recArtist = getArtistName(rec.artists || rec.artist);

              return (
                <div
                  key={rec.id}
                  onClick={() => playTrack(rec)}
                  className="h-[76px] p-2.5 rounded-xl bg-[#111111] border border-[#292929] hover:border-white/40 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Artwork
                      source={recArtwork}
                      size="medium"
                      canonicalId={rec.id}
                      type="track"
                      className="h-14 w-14 rounded-lg shrink-0 object-cover border border-[#292929]"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors truncate">
                        {rec.title}
                      </div>
                      <div className="text-[11px] text-[#A0A0A0] truncate">
                        {recArtist} • {formatTime(rec.duration || 152)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(rec);
                    }}
                    className="p-2 text-white/50 hover:text-[#DFFF00] transition-colors cursor-pointer shrink-0"
                    title="Add to Queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
}: PlayerContextPanelProps) {
  const formattedLyrics: LyricLine[] = lyrics && lyrics.length > 0
    ? lyrics.map((l) => ({ timeMs: l.time * 1000, text: l.text }))
    : [
        { timeMs: 0, text: `Synced lyrics unavailable for "${track?.title || 'this track'}"` },
        { timeMs: 4000, text: `Artist: ${getArtistName(track?.artist || 'Unknown Artist')}` },
        { timeMs: 8000, text: `Album: ${typeof track?.album === 'string' ? track.album : track?.album?.name || 'Single'}` },
      ];

  const tabLabels: Record<ContextTab, string> = {
    queue: 'Up Next',
    lyrics: 'Lyrics',
    recs: 'Recommended',
    devices: 'Devices',
  };

  return (
    <div className={`flex flex-col h-full w-full bg-[#111111] rounded-2xl border border-[#292929] overflow-hidden ${className}`}>
      {/* Header Tab Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#292929] shrink-0 bg-[#090909]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full">
          {(['queue', 'lyrics', 'recs', 'devices'] as ContextTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'lyrics' && (
          <KineticLyricsView
            lyrics={formattedLyrics}
            currentTimeMs={currentTime * 1000}
          />
        )}

        {activeTab === 'queue' && (
          <div className="h-full w-full overflow-hidden">
            <QueueDrawer isOpen={true} onClose={() => {}} inline={true} />
          </div>
        )}

        {activeTab === 'recs' && (
          <RecommendationsPanel track={track} />
        )}

        {activeTab === 'devices' && (
          <DeviceSelectorModal isOpen={true} onClose={() => {}} inline={true} />
        )}
      </div>
    </div>
  );
}
