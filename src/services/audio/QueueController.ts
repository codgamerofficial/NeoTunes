'use client';

import { Track } from '@/types';
import { usePlaybackStore } from '@/store/playback-store';

export class QueueController {
  /**
   * Adds track to end of queue with canonical validation
   */
  public static add(track: Track): void {
    if (!track || (!track.id && !track.canonicalId)) return;
    const store = usePlaybackStore.getState();
    store.addToQueue(track);
  }

  /**
   * Inserts track next in line after current playing song (Section 29)
   */
  public static playNext(track: Track): void {
    if (!track || (!track.id && !track.canonicalId)) return;
    const store = usePlaybackStore.getState();
    store.addNext(track);
  }

  /**
   * Removes track at specific queue index
   */
  public static remove(index: number): void {
    const store = usePlaybackStore.getState();
    const targetTrack = store.queue[index];
    if (targetTrack) {
      store.removeFromQueue(targetTrack.id || targetTrack.canonicalId);
    }
  }

  /**
   * Reorders item from sourceIndex to destinationIndex
   */
  public static move(fromIndex: number, toIndex: number): void {
    const store = usePlaybackStore.getState();
    store.reorderQueue(fromIndex, toIndex);
  }

  /**
   * Toggles deterministic queue shuffle without resetting current track (Section 30)
   */
  public static toggleShuffle(): void {
    const store = usePlaybackStore.getState();
    store.setShuffle(!store.shuffle);
  }
}
