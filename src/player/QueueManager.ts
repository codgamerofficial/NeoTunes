import { Track } from '@/types';

export interface QueueState {
  queue: Track[];
  currentIndex: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

export class QueueManager {
  public static getNextTrackIndex(
    queue: Track[],
    currentIndex: number,
    repeatMode: 'off' | 'all' | 'one',
    shuffle: boolean
  ): number | null {
    if (queue.length === 0) return null;

    if (repeatMode === 'one') {
      return currentIndex >= 0 ? currentIndex : 0;
    }

    if (shuffle && queue.length > 1) {
      let randomIndex = Math.floor(Math.random() * queue.length);
      while (randomIndex === currentIndex && queue.length > 1) {
        randomIndex = Math.floor(Math.random() * queue.length);
      }
      return randomIndex;
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx < queue.length) {
      return nextIdx;
    }

    if (repeatMode === 'all') {
      return 0;
    }

    return null;
  }

  public static getPreviousTrackIndex(
    queue: Track[],
    currentIndex: number,
    repeatMode: 'off' | 'all' | 'one',
    shuffle: boolean
  ): number | null {
    if (queue.length === 0) return null;

    if (repeatMode === 'one') {
      return currentIndex >= 0 ? currentIndex : 0;
    }

    if (shuffle && queue.length > 1) {
      let randomIndex = Math.floor(Math.random() * queue.length);
      while (randomIndex === currentIndex && queue.length > 1) {
        randomIndex = Math.floor(Math.random() * queue.length);
      }
      return randomIndex;
    }

    const prevIdx = currentIndex - 1;
    if (prevIdx >= 0) {
      return prevIdx;
    }

    if (repeatMode === 'all') {
      return queue.length - 1;
    }

    return 0;
  }

  public static addToQueue(queue: Track[], track: Track): Track[] {
    const exists = queue.some((item) => item.id === track.id);
    if (exists) return queue;
    return [...queue, track];
  }

  public static playNext(queue: Track[], currentIndex: number, track: Track): { newQueue: Track[]; newIndex: number } {
    const filtered = queue.filter((item) => item.id !== track.id);
    const insertPos = currentIndex >= 0 ? currentIndex + 1 : 0;
    filtered.splice(insertPos, 0, track);
    return {
      newQueue: filtered,
      newIndex: currentIndex >= 0 ? currentIndex : 0,
    };
  }

  public static removeFromQueue(queue: Track[], trackId: string, currentIndex: number): { newQueue: Track[]; newIndex: number } {
    const targetIdx = queue.findIndex((item) => item.id === trackId);
    if (targetIdx === -1) return { newQueue: queue, newIndex: currentIndex };

    const newQueue = queue.filter((item) => item.id !== trackId);
    let newIndex = currentIndex;

    if (targetIdx < currentIndex) {
      newIndex = Math.max(0, currentIndex - 1);
    } else if (targetIdx === currentIndex) {
      newIndex = Math.min(currentIndex, newQueue.length - 1);
    }

    return { newQueue, newIndex };
  }
}
