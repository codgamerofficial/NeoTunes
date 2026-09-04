import { usePlaybackStore } from '@/store/playback-store';
import { playbackManager } from '@/services/playbackManager';
import { AutoplayCoordinator } from '@/services/AutoplayCoordinator';
import { BackgroundPlaybackConfig } from './audioTypes';

let isPlayerSetup = false;

export const DEFAULT_BACKGROUND_CONFIG: BackgroundPlaybackConfig = {
  pauseOnHeadphoneDisconnect: true,
  handleAudioFocus: true,
  syncMediaSession: true,
  minBufferSec: 15,
  maxBufferSec: 50,
};

export async function setupPlayer(config: Partial<BackgroundPlaybackConfig> = {}): Promise<boolean> {
  if (isPlayerSetup) {
    return true;
  }

  try {
    const finalConfig = { ...DEFAULT_BACKGROUND_CONFIG, ...config };

    // 1. Sync current playback state with OS MediaSession
    const store = usePlaybackStore.getState();
    if (store.currentTrack && finalConfig.syncMediaSession) {
      playbackManager.syncMediaSession(store.currentTrack);
    }

    // 2. Subscribe to store changes to keep OS MediaSession metadata synchronized
    usePlaybackStore.subscribe((state, prevState) => {
      if (state.currentTrack?.id !== prevState.currentTrack?.id) {
        if (state.currentTrack && finalConfig.syncMediaSession) {
          playbackManager.syncMediaSession(state.currentTrack);
        }
      }
    });

    // 3. Initialize Global Autoplay Coordinator
    AutoplayCoordinator.init();

    isPlayerSetup = true;
    console.log('[NeoTunes Background Player] Global player setup completed successfully.');
    return true;
  } catch (err) {
    console.error('[NeoTunes Background Player] Error during player setup:', err);
    return false;
  }
}

export function isPlayerInitialized(): boolean {
  return isPlayerSetup;
}
