import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName, getCoverUrl } from '@/types';

class PlaybackManager {
  private static instance: PlaybackManager;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;

  private constructor() {
    this.setupMediaSessionHandlers();
  }

  public static getInstance(): PlaybackManager {
    if (!PlaybackManager.instance) {
      PlaybackManager.instance = new PlaybackManager();
    }
    return PlaybackManager.instance;
  }

  // Initialize Web Audio API Analyser for real FFT Visualizer
  public initAudioContext(element: HTMLAudioElement): AnalyserNode | null {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }

      if (this.audioCtx && !this.analyser) {
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.audioSource = this.audioCtx.createMediaElementSource(element);
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
      }

      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      return this.analyser;
    } catch (err) {
      console.warn('Web Audio Context initialization error:', err);
      return null;
    }
  }

  public getFFTData(outputArray: any): void {
    if (this.analyser && outputArray) {
      this.analyser.getByteFrequencyData(outputArray);
    }
  }

  // Setup OS MediaSession metadata (Lockscreen, Notification bar, Wearables)
  public syncMediaSession(track: Track | null): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }

    const title = track.title || 'NeoTunes';
    const artist = getArtistName(track.artist);
    const cover = getCoverUrl(track);

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: typeof track.album === 'string' ? track.album : (track.album?.name || 'NeoTunes Single'),
      artwork: [
        { src: cover, sizes: '512x512', type: 'image/jpeg' },
      ],
    });
  }

  private setupMediaSessionHandlers(): void {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      usePlaybackStore.getState().setPlaying(true);
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      usePlaybackStore.getState().setPlaying(false);
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      usePlaybackStore.getState().prevTrack();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      usePlaybackStore.getState().nextTrack();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        usePlaybackStore.getState().setProgress(details.seekTime);
      }
    });
  }

  // Validate Audio Stream before Playback
  public async validateStreamUrl(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) return false;
      const contentType = res.headers.get('content-type') || '';
      return contentType.includes('audio') || contentType.includes('video') || contentType.includes('application');
    } catch {
      return true; // Soft fallback
    }
  }
}

export const playbackManager = PlaybackManager.getInstance();
