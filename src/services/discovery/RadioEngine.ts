'use client';

import { Track } from '@/types';
import { RadioSeed, RadioType } from '@/types/discovery';
import { MusicSearchService } from '../MusicSearchService';
import { RecommendationPipeline } from '../RecommendationPipeline';
import { usePlaybackStore } from '@/store/playback-store';

export class RadioEngine {
  /**
   * Starts continuous Smart Radio session for seed (Section 11 - 16)
   */
  public static async startRadio(seed: RadioSeed): Promise<{ success: boolean; tracksCount: number }> {
    let query = seed.name;
    if (seed.type === 'TRACK') query = `${seed.name} ${seed.artistName || ''}`;
    if (seed.type === 'ARTIST') query = `${seed.name} similar songs`;
    if (seed.type === 'GENRE') query = `${seed.name} top hits`;

    const searchRes = await MusicSearchService.searchAll(query);
    const validTracks = searchRes.songs.filter((t) => RecommendationPipeline.validateCandidate(t));

    if (validTracks.length === 0) {
      return { success: false, tracksCount: 0 };
    }

    const store = usePlaybackStore.getState();
    store.playTrack(validTracks[0], validTracks);

    return {
      success: true,
      tracksCount: validTracks.length,
    };
  }
}
