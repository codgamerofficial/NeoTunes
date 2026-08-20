'use client';

import React from 'react';
import { Track, getArtistName } from '@/types';
import KineticLyricsView, { LyricLine } from './KineticLyricsView';
import RealAudioVisualizer from './RealAudioVisualizer';
import StudioEqPanel from './StudioEqPanel';
import QueueDrawer from './QueueDrawer';
import DeviceSelectorModal from './DeviceSelectorModal';

export type ContextTab = 'lyrics' | 'queue' | 'devices';

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

  return (
    <div className={`flex flex-col h-full w-full bg-[#07090E]/90 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header Tab Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-black/50">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(['lyrics', 'queue', 'devices'] as ContextTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,214,255,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-hidden p-2">
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

        {activeTab === 'devices' && (
          <DeviceSelectorModal isOpen={true} onClose={() => {}} inline={true} />
        )}
      </div>
    </div>
  );
}
