import { usePlaybackStore } from '@/store/playback-store';

export async function playbackService(): Promise<void> {
  // Service event handlers for React Native Track Player / Android ExoPlayer / MediaSession
}

export function handleRemotePlay(): void {
  const { currentTrack, setPlaying, history } = usePlaybackStore.getState();
  if (currentTrack) {
    setPlaying(true);
  } else if (history.length > 0) {
    usePlaybackStore.getState().playTrack(history[0]);
  }
}

export function handleRemotePause(): void {
  usePlaybackStore.getState().setPlaying(false);
}

export function handleRemoteNext(): void {
  usePlaybackStore.getState().nextTrack();
}

export function handleRemotePrevious(): void {
  usePlaybackStore.getState().prevTrack();
}

export function handleRemoteSeek(positionSeconds: number): void {
  usePlaybackStore.getState().setProgress(positionSeconds);
}

export function handleRemoteStop(): void {
  const store = usePlaybackStore.getState();
  store.setPlaying(false);
  store.setProgress(0);
}
