import { Track } from '@/types';
import { normalizeTrack } from './normalizeTrack';
import { ArtworkResolver } from './artworkResolver';
import { preloadArtwork } from './artworkValidator';
import { usePlaybackStore } from '@/store/playback-store';

let latestRequestId = 0;

export async function playTrackTransaction(rawTrack: any, queue: any[] = []): Promise<Track | null> {
  const requestId = ++latestRequestId;

  try {
    // 1. NORMALIZE (Spec 3)
    const normalized = normalizeTrack(rawTrack);

    // 2. RESOLVE & VALIDATE ARTWORK (Spec 4, 9, 10)
    const resolvedArtwork = await ArtworkResolver.resolve(normalized);
    const finalArtworkUrl = resolvedArtwork.large || resolvedArtwork.medium || resolvedArtwork.small || '';

    // 3. PRELOAD ARTWORK BEFORE SWITCHING UI (Spec 11 & 16)
    if (finalArtworkUrl) {
      await preloadArtwork(finalArtworkUrl);
    }

    // 4. RACE CONDITION CHECK (Spec 22)
    // If a newer track request was initiated while resolving, abort this old transaction!
    if (requestId !== latestRequestId) {
      console.debug('[TrackTransaction] Stale request aborted', { requestId, latestRequestId, title: normalized.title });
      return null;
    }

    // 4.5. WRONG SONG PROTECTION (Phase 2 Spec 14)
    if (rawTrack.sourceId && normalized.sourceId && rawTrack.sourceId !== normalized.sourceId) {
      console.warn('[TrackTransaction] Source ID mismatch detected! Aborting playback for wrong song protection.', {
        requested: rawTrack.sourceId,
        resolved: normalized.sourceId,
      });
      const store = usePlaybackStore.getState();
      store.setPlaybackStatus('error', 'Unable to verify this track');
      return null;
    }

    // 5. ASSEMBLE FINAL CANONICAL TRACK OBJECT (Spec 1)
    const finalTrack: Track = {
      ...normalized,
      artwork: resolvedArtwork,
      artworkUrl: finalArtworkUrl,
      coverUrl: finalArtworkUrl,
      artworkSmall: resolvedArtwork.small || finalArtworkUrl,
      artworkMedium: resolvedArtwork.medium || finalArtworkUrl,
      artworkLarge: resolvedArtwork.large || finalArtworkUrl,
      artworkSource: resolvedArtwork.source,
      artworkStatus: resolvedArtwork.verified ? 'resolved' : 'fallback',
    };

    // 6. ATOMIC CURRENT TRACK COMMIT TO STORE (Spec 17 & 23)
    const store = usePlaybackStore.getState();
    store.playTrack(finalTrack, queue.length > 0 ? queue.map(normalizeTrack) : undefined);

    return finalTrack;
  } catch (error) {
    console.error('[TrackTransaction] Failed to resolve track transaction:', error);
    return null;
  }
}
