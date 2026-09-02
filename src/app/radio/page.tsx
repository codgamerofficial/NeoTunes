'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Radio, Sparkles, Compass, Play, Loader2 } from 'lucide-react';
import { RadioEngine } from '@/services/discovery/RadioEngine';
import { RadioSeed, NoveltyMode } from '@/types/discovery';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';
import { useToast } from '@/components/ui/NeoToast';

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
  const { showToast } = useToast();
  const [noveltyMode, setNoveltyMode] = useState<NoveltyMode>('BALANCED');
  const [loadingSeedId, setLoadingSeedId] = useState<string | null>(null);

  const handleStartStation = async (seed: RadioSeed) => {
    setLoadingSeedId(seed.id);
    try {
      await RadioEngine.startRadio(seed);
      showToast(`Starting ${seed.name}...`);
    } catch (err) {
      showToast(`Unable to start ${seed.name}`, 'error');
    } finally {
      setLoadingSeedId(null);
    }
  };

  return (
    <FeatureErrorBoundary featureName="Radio & Discovery Hub">
      <div className="p-4 sm:p-6 md:p-8 space-y-8 text-[#F5F7FA] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-1 border-b border-white/[0.06] pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Radio className="h-6 w-6 text-[#DFFF00]" /> Smart Radio &amp; Discovery Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD]">
            Endless personalized radio stations and recommendation algorithms seeded from your favorite songs and artists.
          </p>
        </div>

        {/* Novelty Mode Selector */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#11141A] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#00E5FF]" /> Discovery Novelty Mode
            </h3>
            <span className="text-[10px] font-mono text-[#DFFF00] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25">
              {noveltyMode}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['SAFE', 'BALANCED', 'ADVENTUROUS', 'SURPRISE'] as NoveltyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setNoveltyMode(mode)}
                className={`py-2.5 px-3 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  noveltyMode === mode
                    ? 'bg-[#DFFF00] text-black shadow-md'
                    : 'bg-white/5 text-[#9AA1AD] border border-white/5 hover:text-white hover:bg-white/10'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Radio Stations Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#DFFF00]" /> Curated Radio Stations
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {RADIO_STATIONS.map((station) => (
              <NeoCard
                key={station.id}
                className="p-5 flex flex-col justify-between gap-4 group bg-[#11141A] border-white/10"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#00E5FF] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/25 inline-block">
                    {station.type} RADIO
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#DFFF00] transition-colors pt-1">
                    {station.name}
                  </h4>
                  {station.artistName && (
                    <p className="text-xs text-[#9AA1AD]">Based on {station.artistName}</p>
                  )}
                </div>

                <NeoButton
                  variant="secondary"
                  size="sm"
                  className="w-full group-hover:border-[#DFFF00]/40"
                  onClick={() => handleStartStation(station)}
                  disabled={loadingSeedId === station.id}
                  isLoading={loadingSeedId === station.id}
                >
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" /> Start Radio
                </NeoButton>
              </NeoCard>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
