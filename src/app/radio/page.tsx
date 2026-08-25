'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Sparkles, Compass, Flame, Play, Info, HelpCircle } from 'lucide-react';
import { RadioEngine } from '@/services/discovery/RadioEngine';
import { RadioSeed, NoveltyMode } from '@/types/discovery';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

const RADIO_STATIONS: RadioSeed[] = [
  { type: 'TRACK', id: 'r_1', name: 'Tum Hi Ho Radio', artistName: 'Arijit Singh' },
  { type: 'ARTIST', id: 'r_2', name: 'The Weeknd Radio' },
  { type: 'GENRE', id: 'r_3', name: 'Bengali Indie Radio' },
  { type: 'GENRE', id: 'r_4', name: 'Hindi Pop Radio' },
  { type: 'MOOD', id: 'r_5', name: 'Focus & Chill Station' },
  { type: 'ACTIVITY', id: 'r_6', name: 'High Energy Gym Mix' },
];

export default function RadioDiscoveryHubPage() {
  const router = useRouter();
  const [noveltyMode, setNoveltyMode] = useState<NoveltyMode>('BALANCED');
  const [loadingSeedId, setLoadingSeedId] = useState<string | null>(null);

  const handleStartStation = async (seed: RadioSeed) => {
    setLoadingSeedId(seed.id);
    try {
      await RadioEngine.startRadio(seed);
    } finally {
      setLoadingSeedId(null);
    }
  };

  return (
    <FeatureErrorBoundary featureName="Radio & Discovery Hub">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Radio className="h-7 w-7 text-[#00D9FF]" /> Smart Radio &amp; Discovery Hub
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Personalized radio stations and next-track intelligence powered by canonical track matching.
          </p>
        </div>

        {/* Novelty Mode Selector */}
        <div className="p-6 rounded-3xl bg-[#090C12] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#00D9FF]" /> Discovery Novelty Mode
            </h3>
            <span className="text-[10px] font-mono text-[#DFFF00] uppercase font-bold">{noveltyMode}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['SAFE', 'BALANCED', 'ADVENTUROUS', 'SURPRISE'] as NoveltyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setNoveltyMode(mode)}
                className={`py-2.5 px-3 rounded-2xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  noveltyMode === mode
                    ? 'bg-[#00D9FF] text-black shadow-[0_0_15px_rgba(0,217,255,0.3)]'
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Radio Stations Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#00D9FF]" /> Curated Radio Stations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {RADIO_STATIONS.map((station) => (
              <div
                key={station.id}
                className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-[#00D9FF]/50 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#00D9FF] uppercase font-bold tracking-wider">{station.type} RADIO</span>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#00D9FF] transition-colors">{station.name}</h4>
                  {station.artistName && <p className="text-xs text-[#A1A1A6]">Based on {station.artistName}</p>}
                </div>

                <button
                  onClick={() => handleStartStation(station)}
                  disabled={loadingSeedId === station.id}
                  className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-[#00D9FF] hover:text-black font-mono font-bold text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="h-3.5 w-3.5 fill-current" /> Start Radio
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
