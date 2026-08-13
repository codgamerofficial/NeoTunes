'use client';

import React from 'react';
import { Sparkles, Music, Sliders, Volume2, Headphones, Check } from 'lucide-react';
import { Track } from '@/types';
import KineticLyricsView, { LyricLine } from './KineticLyricsView';
import RealAudioVisualizer from './RealAudioVisualizer';
import StudioEqPanel from './StudioEqPanel';
import QueueDrawer from './QueueDrawer';

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
  // Convert API lyrics format to LyricLine array for KineticLyricsView
  const formattedLyrics: LyricLine[] = lyrics
    ? lyrics.map((l) => ({ timeMs: l.time * 1000, text: l.text }))
    : [];

  return (
    <div className={`flex flex-col h-full w-full bg-[#07090E]/80 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden ${className}`}>
      {/* Context Panel Header Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0 bg-black/40">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(['lyrics', 'visualizer', 'equalizer', 'queue', 'devices'] as ContextTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => onSelectTab(tab)}
              className={`px-3 py-1.2 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#00D9FF] text-black shadow-[0_0_12px_rgba(0,217,255,0.4)]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab === 'equalizer' ? 'Studio EQ' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-hidden p-2">
        {activeTab === 'lyrics' && (
          <div className="h-full w-full">
            {lyricsLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-white/50">
                <Sparkles className="h-6 w-6 animate-spin text-[#00D9FF]" />
                <span className="text-xs font-mono">Fetching synchronized lyrics...</span>
              </div>
            ) : formattedLyrics.length > 0 ? (
              <KineticLyricsView
                lyrics={formattedLyrics}
                currentTimeMs={currentTime * 1000}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2 text-white/40">
                <Sparkles className="h-8 w-8 text-white/20" />
                <p className="text-sm font-bold text-white/70">Lyrics aren&apos;t available for this track.</p>
                <p className="text-xs">We couldn&apos;t find synchronized lyrics for this song.</p>
              </div>
            )}
          </div>
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
          <div className="h-full w-full p-5 space-y-4 text-white select-none overflow-y-auto">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Headphones className="h-5 w-5 text-[#00D9FF]" />
              <span className="text-xs font-mono font-black uppercase text-[#00D9FF] tracking-widest">
                PLAYING ON
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-4 rounded-2xl bg-[#00D9FF]/10 border border-[#00D9FF]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="h-5 w-5 text-[#00D9FF]" />
                  <div>
                    <div className="text-sm font-bold text-white">This Device (Browser Audio Output)</div>
                    <div className="text-xs text-[#00D9FF]">Active Web Audio Engine</div>
                  </div>
                </div>
                <Check className="h-5 w-5 text-[#00D9FF]" />
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/50">
                To connect to external Bluetooth speakers or AirPlay/Cast devices, use your OS or browser standard media routing settings.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
