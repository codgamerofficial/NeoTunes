import { usePlaybackStore } from './playback-store';

export const usePlayerStore = () => {
  const store = usePlaybackStore();

  return {
    ...store,
    currentTime: store.progress,
    togglePlay: () => store.setPlaying(!store.isPlaying),
    previousTrack: store.prevTrack,
    seek: (timeSeconds: number) => store.setProgress(timeSeconds),
  };
};
