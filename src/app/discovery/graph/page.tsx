'use client';

import React, { useState, useEffect } from 'react';
import { Network, Sparkles, Compass, Play, Info, Flame, Moon, Zap, Coffee, Car } from 'lucide-react';
import { NextGenRecommendationEngine } from '@/services/graph/NextGenRecommendationEngine';
import { DiscoveryMode, ListeningContextType, GraphRecommendationResult } from '@/types/music-graph';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { getTrackArtwork } from '@/utils/artwork';
import { getArtistName } from '@/types';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

export default function ContextualDiscoveryGraphPage() {
  const [mode, setMode] = useState<DiscoveryMode>('BALANCED');
  const [context, setContext] = useState<ListeningContextType>('NIGHT');
  const [recs, setRecs] = useState<GraphRecommendationResult[]>([]);
  const { playTrack } = usePlaybackStore();

  const fetchRecs = React.useCallback(async () => {
    const results = await NextGenRecommendationEngine.generateContextualRecommendations('Bengali', mode, context);
    setRecs(results);
  }, [mode, context]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  return (
    <FeatureErrorBoundary featureName="Music Intelligence Graph">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Network className="h-7 w-7 text-[#00D9FF]" /> NeoMusicGraph & Contextual Discovery
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Graph-backed candidate ranking, novelty mode tuning, and "Why This Track?" explainability.
          </p>
        </div>

        {/* Discovery Mode Selector (Section 20-25) */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Discovery Mode</h3>
          <div className="flex flex-wrap gap-2">
            {(['FAMILIAR', 'BALANCED', 'DISCOVERY', 'EXPERIMENTAL'] as DiscoveryMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                  mode === m ? 'bg-[#00D9FF] text-black shadow-[0_0_12px_rgba(0,217,255,0.4)]' : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Context Picker (Section 26-28) */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Listening Context</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { type: 'NIGHT', label: 'Late Night Calm', icon: Moon },
              { type: 'WORKOUT', label: 'High Energy Gym', icon: Zap },
              { type: 'FOCUS', label: 'Deep Focus', icon: Coffee },
              { type: 'TRAVEL', label: 'Roadtrip Travel', icon: Car },
            ].map(({ type, label, icon: Icon }) => (
              <NeoCard
                key={type}
                glass
                interactive
                onClick={() => setContext(type as ListeningContextType)}
                className={`space-y-2 border ${context === type ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-white/10'}`}
              >
                <Icon className={`h-5 w-5 ${context === type ? 'text-[#00D9FF]' : 'text-white/60'}`} />
                <h4 className="text-xs font-bold text-white">{label}</h4>
              </NeoCard>
            ))}
          </div>
        </div>

        {/* Graph Recommendation Feed with Explainability */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Graph Recommendations ({recs.length})</h3>
          <div className="space-y-3">
            {recs.map((item) => {
              const track = item.track;
              const coverUrl = getTrackArtwork(track);
              const artistStr = getArtistName(track.artists || track.artist);

              return (
                <NeoCard key={track.id || track.canonicalId} glass className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <Artwork source={coverUrl} size="small" alt={track.title} type="track" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                      <p className="text-[11px] text-[#A1A1A6] truncate">{artistStr}</p>
                      {/* Why This Track Explanation (Section 40 & 122) */}
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00D9FF]">
                        <Info className="h-3 w-3" /> {item.reason}
                      </span>
                    </div>
                  </div>

                  <NeoButton variant="primary" size="sm" onClick={() => playTrack(track, recs.map(r => r.track))}>
                    <Play className="h-3.5 w-3.5 fill-black" /> Play
                  </NeoButton>
                </NeoCard>
              );
            })}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
