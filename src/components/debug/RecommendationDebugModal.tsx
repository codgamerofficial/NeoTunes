'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Brain, Sliders, ShieldCheck, Activity, RefreshCw } from 'lucide-react';
import { TasteProfileManager, UserTasteProfile } from '@/services/TasteProfileManager';
import { RecommendationPipeline, ScoredRecommendation } from '@/services/RecommendationPipeline';
import { Artwork } from '@/components/ui/Artwork';

interface RecommendationDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecommendationDebugModal({ isOpen, onClose }: RecommendationDebugModalProps) {
  const [profile, setProfile] = useState<UserTasteProfile | null>(null);
  const [scoredTracks, setScoredTracks] = useState<ScoredRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDiagnostics = async () => {
    setIsLoading(true);
    const userProf = TasteProfileManager.computeProfile();
    setProfile(userProf);

    try {
      const feed = await RecommendationPipeline.generatePersonalizedFeed();
      const allScored = feed.flatMap((sec) => sec.tracks);
      setScoredTracks(allScored.slice(0, 15));
    } catch {
      setScoredTracks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none font-sans text-white">
      <div className="relative w-full max-w-2xl bg-[#090C12] border border-white/15 rounded-3xl p-6 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Brain className="h-5 w-5 text-[#DFFF00]" />
            <div>
              <h3 className="text-sm font-mono font-black uppercase text-white tracking-wider flex items-center gap-2">
                NEOTUNES RECOMMENDATION DIAGNOSTICS
              </h3>
              <p className="text-[11px] text-[#A1A1A6]">
                Transparent Scoring &amp; Taste Profile Inspection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDiagnostics}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Taste Profile Stats */}
        {profile && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-wider">
              Computed User Taste Profile
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#A1A1A6] block text-[10px]">PREFERRED ARTISTS</span>
                <span className="text-white font-bold">
                  {profile.preferredArtists.length > 0
                    ? profile.preferredArtists.map((a) => `${a.name} (${a.score})`).join(', ')
                    : 'No dominant artists'}
                </span>
              </div>
              <div>
                <span className="text-[#A1A1A6] block text-[10px]">NOT INTERESTED COUNT</span>
                <span className="text-red-400 font-bold">{profile.notInterestedTrackIds.length} tracks</span>
              </div>
            </div>
          </div>
        )}

        {/* Candidate Scored List */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold text-[#00D9FF] uppercase tracking-wider">
            Scored Candidates Breakdown
          </h4>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-white/50 animate-pulse">
              Computing candidate scores...
            </div>
          ) : scoredTracks.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-white/50">
              No candidates generated.
            </div>
          ) : (
            scoredTracks.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Artwork source={item.artworkUrl || item.coverUrl} size="small" type="track" className="w-10 h-10 rounded-xl" />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{item.title}</p>
                    <p className="text-[10px] text-[#A1A1A6] truncate">{item.recommendationReason}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#DFFF00] bg-[#DFFF00]/10 px-2 py-0.5 rounded-full border border-[#DFFF00]/30">
                    Score: {item.scoreBreakdown.totalScore}
                  </span>
                  <div className="text-[9px] text-[#A1A1A6] mt-1 space-x-1">
                    <span>Artist: +{item.scoreBreakdown.artistAffinity}</span>
                    <span>Skip: -{item.scoreBreakdown.skipPenalty}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
