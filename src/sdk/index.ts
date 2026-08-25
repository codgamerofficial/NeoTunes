'use client';

import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService } from '@/services/MusicSearchService';
import { RecommendationPipeline } from '@/services/RecommendationPipeline';
import { MusicIntelligenceEngine } from '@/services/MusicIntelligenceEngine';
import { ExtensionRegistry } from '@/services/extensions/ExtensionRegistry';

export const NeoTunesSDK = {
  version: '1.0.0',

  player: {
    playTrack: (track: any, queue?: any[]) => usePlaybackStore.getState().playTrack(track, queue),
    pause: () => usePlaybackStore.getState().setPlaying(false),
    resume: () => usePlaybackStore.getState().setPlaying(true),
    next: () => usePlaybackStore.getState().nextTrack(),
    prev: () => usePlaybackStore.getState().prevTrack(),
    getCurrentTrack: () => usePlaybackStore.getState().currentTrack,
  },

  search: {
    searchAll: (query: string, options?: any) => MusicSearchService.searchAll(query, options),
    validateTrack: (track: any) => RecommendationPipeline.validateCandidate(track),
  },

  intelligence: {
    getProfile: (userId?: string) => MusicIntelligenceEngine.getProfile(userId),
    getWeeklySummary: (userId?: string) => MusicIntelligenceEngine.getWeeklySummary(userId),
  },

  extensions: {
    register: (manifest: any) => ExtensionRegistry.registerExtension(manifest),
    executeSafely: (id: string, fn: () => Promise<any>) => ExtensionRegistry.executeSafely(id, fn),
  },
};
