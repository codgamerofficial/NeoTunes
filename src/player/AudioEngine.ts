import { Track } from '@/types';
import { mediaSession } from './MediaSession';
import { playerEvents } from './PlayerEvents';

export type PlaybackStatus = 'idle' | 'loading' | 'connecting' | 'playing' | 'paused' | 'buffering' | 'ended' | 'error';

export interface AudioEngineOptions {
  onProgress?: (currentTime: number, duration: number) => void;
  onStatusChange?: (status: PlaybackStatus, message?: string) => void;
  onEnded?: () => void;
}

export class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;
  private status: PlaybackStatus = 'idle';
  private retryCount = 0;
  private maxRetries = 5;
  private retryTimeout: ReturnType<typeof setTimeout> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private options: AudioEngineOptions = {};
  private isInitialised = false;

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initWebAudio();
      this.setupNetworkListeners();
    }
  }

  private initWebAudio(): void {
    if (this.audio || typeof window === 'undefined') return;

    this.audio = new Audio();
    this.audio.preload = 'auto';

    this.audio.addEventListener('playing', () => {
      this.setStatus('playing');
      this.retryCount = 0;
      mediaSession.updatePlaybackState('playing');
      this.startProgressTracking();
    });

    this.audio.addEventListener('pause', () => {
      if (this.status !== 'ended' && this.status !== 'error') {
        this.setStatus('paused');
      }
      mediaSession.updatePlaybackState('paused');
      this.stopProgressTracking();
    });

    this.audio.addEventListener('waiting', () => {
      this.setStatus('buffering');
    });

    this.audio.addEventListener('ended', () => {
      this.setStatus('ended');
      this.stopProgressTracking();
      mediaSession.updatePlaybackState('none');
      if (this.options.onEnded) {
        this.options.onEnded();
      }
      playerEvents.emit('track_ended');
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('[AudioEngine] Audio element error:', e);
      this.handlePlaybackError();
    });

    this.isInitialised = true;
  }

  private setupNetworkListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      playerEvents.emit('network_online');
      if (this.status === 'error' && this.currentTrack) {
        console.log('[AudioEngine] Network restored. Attempting auto-recovery...');
        this.setStatus('connecting', 'Network restored. Reconnecting...');
        this.retryPlayback();
      }
    });

    window.addEventListener('offline', () => {
      playerEvents.emit('network_offline');
      this.setStatus('error', 'Your connection appears to be offline.');
    });
  }

  public setOptions(options: AudioEngineOptions): void {
    this.options = { ...this.options, ...options };
  }

  public setStatus(newStatus: PlaybackStatus, message?: string): void {
    this.status = newStatus;
    if (this.options.onStatusChange) {
      this.options.onStatusChange(newStatus, message);
    }
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  public async loadTrack(track: Track, autoPlay = true): Promise<void> {
    if (!this.audio) this.initWebAudio();

    this.currentTrack = track;
    this.setStatus('loading', `Loading ${track.title}...`);
    this.retryCount = 0;

    mediaSession.updateMetadata(track);

    const streamUrl = this.resolveStreamUrl(track);

    if (!streamUrl) {
      this.setStatus('error', 'Unable to resolve audio source.');
      return;
    }

    try {
      if (this.audio) {
        this.audio.src = streamUrl;
        this.audio.currentTime = 0;
        if (autoPlay) {
          await this.play();
        }
      }
    } catch (err: any) {
      console.warn('[AudioEngine] Failed to load stream:', err);
      this.handlePlaybackError();
    }
  }

  private resolveStreamUrl(track: Track): string | null {
    if ((track as any).streamUrl) return (track as any).streamUrl;
    if ((track as any).audioUrl) return (track as any).audioUrl;
    if ((track as any).previewUrl) return (track as any).previewUrl;
    return 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';
  }

  public async play(): Promise<void> {
    if (!this.audio) return;
    try {
      this.setStatus('connecting');
      await this.audio.play();
      this.setStatus('playing');
      mediaSession.updatePlaybackState('playing');
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        console.warn('[AudioEngine] Autoplay prevented by browser user interaction policy.');
        this.setStatus('paused', 'Click play to start audio');
      } else {
        this.handlePlaybackError();
      }
    }
  }

  public pause(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.setStatus('paused');
    mediaSession.updatePlaybackState('paused');
  }

  public togglePlay(): void {
    if (this.status === 'playing') {
      this.pause();
    } else {
      this.play();
    }
  }

  public seek(seconds: number): void {
    if (!this.audio) return;
    try {
      this.audio.currentTime = seconds;
      mediaSession.updatePositionState(this.audio.duration || 0, seconds);
    } catch (e) {}
  }

  public setVolume(value: number): void {
    if (!this.audio) return;
    const clamped = Math.max(0, Math.min(1, value));
    this.audio.volume = clamped;
  }

  public setMuted(muted: boolean): void {
    if (!this.audio) return;
    this.audio.muted = muted;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio?.duration || 0;
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();
    this.progressInterval = setInterval(() => {
      if (!this.audio) return;
      const current = this.audio.currentTime || 0;
      const duration = this.audio.duration || 0;
      if (this.options.onProgress) {
        this.options.onProgress(current, duration);
      }
      mediaSession.updatePositionState(duration, current);
    }, 500);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private handlePlaybackError(): void {
    this.stopProgressTracking();
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const backoffMs = Math.pow(2, this.retryCount - 1) * 1000;
      console.log(`[AudioEngine] Stream error. Retrying attempt ${this.retryCount}/${this.maxRetries} in ${backoffMs}ms...`);
      this.setStatus('buffering', `Reconnecting... (Attempt ${this.retryCount}/${this.maxRetries})`);

      if (this.retryTimeout) clearTimeout(this.retryTimeout);
      this.retryTimeout = setTimeout(() => {
        this.retryPlayback();
      }, backoffMs);
    } else {
      console.error('[AudioEngine] Maximum retries reached. Setting error status.');
      this.setStatus('error', 'Unable to play this track. Click Retry or Next.');
      playerEvents.emit('audio_error', 'Max retries reached');
    }
  }

  private retryPlayback(): void {
    if (!this.audio || !this.currentTrack) return;
    try {
      this.audio.load();
      this.play();
    } catch (e) {
      this.handlePlaybackError();
    }
  }
}

export const audioEngine = AudioEngine.getInstance();
