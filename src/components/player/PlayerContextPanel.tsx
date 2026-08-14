'use client';

import React from 'react';
import { Track } from '@/types';
import KineticLyricsView, { LyricLine } from './KineticLyricsView';
import RealAudioVisualizer from './RealAudioVisualizer';
import StudioEqPanel from './StudioEqPanel';
import QueueDrawer from './QueueDrawer';
import DeviceSelectorModal from './DeviceSelectorModal';

export type ContextTab = 'lyrics' | 'visualizer' | 'equalizer' | 'queue' | 'devices';

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
  const formattedLyrics: LyricLine[] = lyrics
    ? lyrics.map((l) => ({ timeMs: l.time * 1000, text: l.text }))
    : [
        { timeMs: 0, text: 'Jihde Lamba Lamba Silky Jehe Baal' },
        { timeMs: 4000, text: 'Oh Kudi Kaun Nachdi, Kaun Nachdi?' },
        { timeMs: 8000, text: 'Jihdi Kamar Te Tattoo Ae Kamaal' },
        { timeMs: 12000, text: 'Oh Kudi Kaun Nachdi, Kaun Nachdi?' },
        { timeMs: 16000, text: 'High Rated Gabru Nu Maare' },
        { timeMs: 20000, text: 'Kudiye Tu Haan Karde' },
        { timeMs: 24000, text: 'Baby Tu Haan Karde' },
      ];

  return (
    <div className={`flex flex-col h-full w-full bg-[#07090E]/90 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header Tab Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-black/50">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(['lyrics', 'visualizer', 'equalizer', 'queue', 'devices'] as ContextTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#00D4FF] text-black shadow-[0_0_12px_rgba(0,214,255,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'equalizer' ? 'Studio EQ' : tab}
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

        {activeTab === 'visualizer' && (
          <RealAudioVisualizer isPlaying={isPlaying} />
        )}

        {activeTab === 'equalizer' && <StudioEqPanel />}

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
