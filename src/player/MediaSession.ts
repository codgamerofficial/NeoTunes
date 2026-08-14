import { Track, getArtistName } from '@/types';
import { getTrackArtwork } from '@/utils/artwork';

export interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeekTo: (details: { seekTime: number }) => void;
}

export class MediaSessionController {
  private static instance: MediaSessionController;

  public static getInstance(): MediaSessionController {
    if (!MediaSessionController.instance) {
      MediaSessionController.instance = new MediaSessionController();
    }
    return MediaSessionController.instance;
  }

  public updateMetadata(track: Track | null): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }

    const title = track.title || 'NeoTunes Track';
    const artist = getArtistName(track.artist);
    const albumTitle = typeof track.album === 'object' && track.album ? (track.album.name || (track.album as any).title || 'Single') : (track.album || 'Single');
    const artworkUrl = getTrackArtwork(track);

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album: albumTitle,
        artwork: [
          { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    } catch (err) {
      console.warn('[MediaSessionController] Failed to set MediaMetadata:', err);
    }
  }

  public updatePlaybackState(state: 'playing' | 'paused' | 'none'): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {}
  }

  public updatePositionState(duration: number, currentTime: number): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;
    if (!('setPositionState' in navigator.mediaSession)) return;

    if (duration <= 0 || isNaN(duration) || isNaN(currentTime)) return;

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, duration),
        playbackRate: 1,
        position: Math.min(Math.max(0, currentTime), Math.max(0, duration)),
      });
    } catch (err) {
      // Ignore rapid position update errors
    }
  }

  public setupActionHandlers(handlers: MediaSessionHandlers): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const actionMap: [MediaSessionAction, ((details: any) => void) | null][] = [
      ['play', () => handlers.onPlay()],
      ['pause', () => handlers.onPause()],
      ['previoustrack', () => handlers.onPrev()],
      ['nexttrack', () => handlers.onNext()],
      ['seekto', (details: any) => details.seekTime !== undefined && handlers.onSeekTo(details)],
      ['seekbackward', () => handlers.onSeekTo({ seekTime: 0 })],
      ['seekforward', () => handlers.onSeekTo({ seekTime: 0 })],
    ];

    actionMap.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (err) {
        // Action may not be supported by browser
      }
    });
  }
}

export const mediaSession = MediaSessionController.getInstance();
