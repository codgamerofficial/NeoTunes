'use client';

import { usePlaybackStore } from '@/store/playback-store';
import { SmartRecommender } from './SmartRecommender';
import { EventCollector } from './EventCollector';
import { getArtistName } from '@/types';

export class AutoplayCoordinator {
  private static isInitialized = false;
  private static isResolving = false;
  private static prefetchTimeout: NodeJS.Timeout | null = null;

  /**
   * Initializes the Autoplay Coordinator singleton and subscribes to store updates.
   * Safe to call multiple times (idempotent).
   */
  public static init(): void {
    if (AutoplayCoordinator.isInitialized) return;
    AutoplayCoordinator.isInitialized = true;

    usePlaybackStore.subscribe((state, prevState) => {
      // 1. Detect when a track has finished playback ('ended' state)
      if (state.playbackStatus === 'ended' && prevState.playbackStatus !== 'ended') {
        AutoplayCoordinator.handleTrackEnded();
      }

      // 2. When a new track starts playing, schedule background recommendation prefetching
      if (
        state.currentTrack?.id &&
        state.currentTrack.id !== prevState.currentTrack?.id
      ) {
        AutoplayCoordinator.schedulePrefetch();
      }
    });

    console.log('[AutoplayCoordinator] Global autoplay coordinator initialized.');
  }

  /**
   * Handles track-ended events when the queue reaches the end.
   */
  public static async handleTrackEnded(): Promise<void> {
    const store = usePlaybackStore.getState();

    // Check if autoplay is active and we are not already advancing/resolving
    if (!store.autoplayEnabled) {
      console.log('[AutoplayCoordinator] Autoplay is disabled. Stopping playback.');
      return;
    }

    if (AutoplayCoordinator.isResolving || store.isAdvancingTrack) {
      console.log('[AutoplayCoordinator] Autoplay transition already in progress.');
      return;
    }

    // Check if there are still user tracks remaining in the queue
    const currentIdx = store.currentTrack
      ? store.queue.findIndex((t) => t.id === store.currentTrack?.id)
      : -1;

    if (currentIdx >= 0 && currentIdx + 1 < store.queue.length) {
      console.log('[AutoplayCoordinator] User queue has remaining tracks, advancing to next.');
      store.nextTrack();
      return;
    }

    AutoplayCoordinator.isResolving = true;
    store.setIsAdvancingTrack(true);

    try {
      // Check if we already have pre-fetched autoplay candidates ready
      if (store.autoplayQueue.length > 0) {
        const [nextTrack, ...remaining] = store.autoplayQueue;
        console.log('[AutoplayCoordinator] Playing pre-fetched autoplay track:', nextTrack.title);
        
        store.setAutoplayQueue(remaining);
        const newQueue = [...store.queue, nextTrack];
        store.setQueue(newQueue);
        store.playTrack(nextTrack, newQueue);
        return;
      }

      // No pre-fetched tracks in queue, generate one on-the-fly
      console.log('[AutoplayCoordinator] Autoplay queue empty. Generating smart recommendation...');
      const candidate = await SmartRecommender.getNextTrack({
        currentTrack: store.currentTrack,
        history: store.history,
        sessionPlayedIds: store.sessionPlayedIds,
        sessionSkippedIds: store.sessionSkippedIds,
        mode: store.autoplayMode,
        diversityLevel: store.diversityLevel,
      });

      if (candidate) {
        console.log('[AutoplayCoordinator] Selected smart recommendation:', candidate.title, 'by', getArtistName(candidate.artists || candidate.artist));
        const newQueue = [...store.queue, candidate];
        store.setQueue(newQueue);
        store.playTrack(candidate, newQueue);
      } else {
        console.warn('[AutoplayCoordinator] Could not generate smart recommendation. Halting.');
        store.setPlaybackStatus('idle');
      }
    } catch (err) {
      console.error('[AutoplayCoordinator] Error during autoplay resolution:', err);
      store.setPlaybackStatus('idle');
    } finally {
      setTimeout(() => {
        AutoplayCoordinator.isResolving = false;
        usePlaybackStore.getState().setIsAdvancingTrack(false);
      }, 400);
    }
  }

  /**
   * Schedules a background pre-fetch for upcoming autoplay tracks.
   * Debounced by 2 seconds after track start to avoid network contention during initial playback.
   */
  public static schedulePrefetch(): void {
    if (AutoplayCoordinator.prefetchTimeout) {
      clearTimeout(AutoplayCoordinator.prefetchTimeout);
    }

    AutoplayCoordinator.prefetchTimeout = setTimeout(async () => {
      const store = usePlaybackStore.getState();
      if (!store.autoplayEnabled || !store.currentTrack) return;

      // Only prefetch if we have fewer than 3 upcoming autoplay recommendations
      if (store.autoplayQueue.length >= 3) return;

      try {
        const needed = 3 - store.autoplayQueue.length;
        const recommendations = await SmartRecommender.prefetchNextTracks(
          {
            currentTrack: store.currentTrack,
            history: store.history,
            sessionPlayedIds: [
              ...store.sessionPlayedIds,
              ...store.autoplayQueue.map((t) => t.id),
            ],
            sessionSkippedIds: store.sessionSkippedIds,
            mode: store.autoplayMode,
            diversityLevel: store.diversityLevel,
          },
          needed
        );

        if (recommendations.length > 0) {
          const merged = [...store.autoplayQueue, ...recommendations];
          store.setAutoplayQueue(merged);
          console.log(
            `[AutoplayCoordinator] Pre-fetched ${recommendations.length} smart recommendations for queue.`
          );

          // Warm up stream cache for the very first item
          if (recommendations[0]) {
            store.prefetchStream(recommendations[0]);
          }
        }
      } catch (err) {
        console.warn('[AutoplayCoordinator] Background pre-fetch failed:', err);
      }
    }, 2000);
  }

  /**
   * Records a user skip event and feeds it into the session skip context.
   */
  public static recordManualSkip(trackId: string, progressSeconds: number): void {
    const store = usePlaybackStore.getState();
    const track = store.currentTrack;
    if (!track) return;

    store.recordSessionSkipped(trackId);
    if (track.canonicalId) {
      store.recordSessionSkipped(track.canonicalId);
    }

    // Only emit formal SKIPPED listening event if skipped in the first 30 seconds
    if (progressSeconds < 30) {
      EventCollector.trackEvent('SKIPPED', {
        trackId: track.id,
        artistName: getArtistName(track.artists || track.artist),
        genre: track.genre,
        language: track.language,
        position: progressSeconds,
      });
      console.log('[AutoplayCoordinator] Recorded early track skip:', track.title);
    }
  }
}
