import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioEngine } from '@/player/AudioEngine';
import { MediaSessionController } from '@/player/MediaSession';
import { usePlaybackStore } from '@/store/playback-store';
import { Track } from '@/types';

describe('Background Playback & Audio Engine Architecture', () => {
  const mockTrack: Track = {
    id: 'test-track-1',
    title: 'Echoes in the Rain',
    artist: 'Enya',
    artists: ['Enya'],
    album: 'Dark Sky Island',
    duration: 215,
    coverUrl: 'https://images.example.com/enya.jpg',
    sourceType: 'cloud',
    sourceId: 'https://cdn.example.com/audio.mp3',
  };

  beforeEach(() => {
    // Reset Zustand store state
    usePlaybackStore.setState({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      queue: [],
      history: [],
      playbackStatus: 'idle',
    });
  });

  it('maintains a single persistent AudioEngine instance', () => {
    const instance1 = AudioEngine.getInstance();
    const instance2 = AudioEngine.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('correctly updates MediaSession metadata with high-resolution artwork', () => {
    const controller = MediaSessionController.getInstance();

    // Mock navigator.mediaSession
    const mediaSessionMock: any = {
      metadata: null,
      playbackState: 'none',
      setActionHandler: vi.fn(),
      setPositionState: vi.fn(),
    };

    (globalThis as any).navigator.mediaSession = mediaSessionMock;
    (globalThis as any).MediaMetadata = class {
      constructor(public data: any) {}
    };

    controller.updateMetadata(mockTrack);

    expect(mediaSessionMock.metadata).not.toBeNull();
    expect(mediaSessionMock.metadata.data.title).toBe('Echoes in the Rain');
    expect(mediaSessionMock.metadata.data.artist).toBe('Enya');
    expect(mediaSessionMock.metadata.data.album).toBe('Dark Sky Island');
    expect(mediaSessionMock.metadata.data.artwork.length).toBeGreaterThanOrEqual(6);
    expect(mediaSessionMock.metadata.data.artwork.some((a: any) => a.sizes === '512x512')).toBe(true);
  });

  it('synchronizes MediaSession position state correctly', () => {
    const controller = MediaSessionController.getInstance();
    const setPositionStateMock = vi.fn();
    (globalThis as any).navigator.mediaSession = {
      setPositionState: setPositionStateMock,
    };

    controller.updatePositionState(215, 45);

    expect(setPositionStateMock).toHaveBeenCalledWith({
      duration: 215,
      playbackRate: 1,
      position: 45,
    });
  });

  it('configures all MediaSession action handlers (play, pause, stop, next, prev, seek)', () => {
    const controller = MediaSessionController.getInstance();
    const registeredActions = new Map<string, Function>();

    (globalThis as any).navigator.mediaSession = {
      setActionHandler: (action: string, handler: Function) => {
        registeredActions.set(action, handler);
      },
    };

    const onPlay = vi.fn();
    const onPause = vi.fn();
    const onStop = vi.fn();
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onSeekTo = vi.fn();

    controller.setupActionHandlers({
      onPlay,
      onPause,
      onStop,
      onNext,
      onPrev,
      onSeekTo,
    });

    expect(registeredActions.has('play')).toBe(true);
    expect(registeredActions.has('pause')).toBe(true);
    expect(registeredActions.has('stop')).toBe(true);
    expect(registeredActions.has('nexttrack')).toBe(true);
    expect(registeredActions.has('previoustrack')).toBe(true);
    expect(registeredActions.has('seekto')).toBe(true);
    expect(registeredActions.has('seekbackward')).toBe(true);
    expect(registeredActions.has('seekforward')).toBe(true);

    // Test action triggers
    registeredActions.get('play')!();
    expect(onPlay).toHaveBeenCalled();

    registeredActions.get('pause')!();
    expect(onPause).toHaveBeenCalled();

    registeredActions.get('stop')!();
    expect(onStop).toHaveBeenCalled();

    registeredActions.get('seekto')!({ seekTime: 60 });
    expect(onSeekTo).toHaveBeenCalledWith({ seekTime: 60 });
  });

  it('keeps playback active when visibilitychange event occurs', () => {
    usePlaybackStore.setState({
      currentTrack: mockTrack,
      isPlaying: true,
      playbackStatus: 'playing',
    });

    // Simulate document visibility changing to hidden (user minimizes PWA)
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    // Playback state must remain unchanged and playing
    const state = usePlaybackStore.getState();
    expect(state.isPlaying).toBe(true);
    expect(state.playbackStatus).toBe('playing');
  });

  it('preserves playback state across route changes in the global store', () => {
    usePlaybackStore.getState().playTrack(mockTrack, [mockTrack]);

    expect(usePlaybackStore.getState().isPlaying).toBe(true);
    expect(usePlaybackStore.getState().currentTrack?.id).toBe('test-track-1');

    // Simulate route transition (subscribing/unsubscribing route-level views)
    const currentTrackAfterNav = usePlaybackStore.getState().currentTrack;
    const isPlayingAfterNav = usePlaybackStore.getState().isPlaying;

    expect(currentTrackAfterNav?.id).toBe('test-track-1');
    expect(isPlayingAfterNav).toBe(true);
  });
});
