'use client';

import { Track, getArtistName } from '@/types';
import { RecommendationCandidate, SmartQueueConfig, SessionTasteProfile } from '@/types/discovery';
import { MusicSearchService } from '../MusicSearchService';
import { RecommendationPipeline } from '../RecommendationPipeline';
import { QueueController } from '../audio/QueueController';
import { usePlaybackStore } from '@/store/playback-store';

export class SmartQueueEngine {
  private static defaultConfig: SmartQueueConfig = {
    noveltyMode: 'BALANCED',
    artistCooldownCount: 3,
    albumCooldownCount: 2,
    allowPreviews: false,
  };

  /**
   * Predicts and prepares next recommended track for continuous Smart Queue (Section 17, 19, 21)
   */
  public static async generateNextTrack(seedTrack?: Track): Promise<RecommendationCandidate | null> {
    const store = usePlaybackStore.getState();
    const currentTrack = seedTrack || store.currentTrack;
    if (!currentTrack) return null;

    const artist = getArtistName(currentTrack.artists || currentTrack.artist);

    // 1. Fetch Candidate Pool via Canonical Search
    const searchRes = await MusicSearchService.searchAll(`${artist} ${currentTrack.genre || ''}`);
    const validCandidates = searchRes.songs.filter((t) => RecommendationPipeline.validateCandidate(t));

    if (validCandidates.length === 0) return null;

    // 2. Cooldown & Repetition Filter (Section 25 & 26)
    const recentArtistNames = store.queue.slice(-3).map((t) => getArtistName(t.artists || t.artist));

    const freshCandidates = validCandidates.filter((cand) => {
      const candArtist = getArtistName(cand.artists || cand.artist);
      // Exclude if artist appeared in last 3 tracks
      return !recentArtistNames.includes(candArtist);
    });

    const candidateToRank = freshCandidates.length > 0 ? freshCandidates[0] : validCandidates[0];

    // 3. Availability & Preview Filter Check (Section 21 & 22)
    const isPreview = candidateToRank.duration && candidateToRank.duration <= 35 && !candidateToRank.isrc;
    if (isPreview && !SmartQueueEngine.defaultConfig.allowPreviews) {
      return null;
    }

    return {
      track: candidateToRank,
      score: 0.92,
      explanation: `Because you listened to ${currentTrack.title} by ${artist}`,
      poolType: 'SIMILAR',
    };
  }

  /**
   * Automatically appends predicted track into authoritative QueueController (Section 79)
   */
  public static async autoAppendNextTrack(): Promise<void> {
    const candidate = await SmartQueueEngine.generateNextTrack();
    if (candidate && candidate.track) {
      QueueController.add(candidate.track);
    }
  }
}
