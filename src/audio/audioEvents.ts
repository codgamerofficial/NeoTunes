import { usePlaybackStore } from '@/store/playback-store';
import { useSpatialAudioStore } from '@/store/spatial-audio-store';

let isEventsListening = false;

export function registerAudioEvents(): () => void {
  if (isEventsListening || typeof window === 'undefined') {
    return () => {};
  }

  isEventsListening = true;

  // 1. Headphone / Bluetooth Disconnect Guard (AUDIO_BECOMING_NOISY)
  const handleHeadphoneDisconnect = () => {
    const store = usePlaybackStore.getState();
    if (store.isPlaying) {
      console.log('[NeoTunes Audio] Headphone disconnect detected. Pausing playback for user safety.');
      store.setPlaying(false);
    }
    // Update output routing state in spatial store
    useSpatialAudioStore.getState().setOutputDevice('PHONE_SPEAKER', 'Phone Speaker');
  };

  // Listen to web & media device routing change events
  if (typeof navigator !== 'undefined' && 'mediaDevices' in navigator) {
    try {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        // Refresh spatial audio environment when devices change
        useSpatialAudioStore.getState().refreshAudioEnvironment();
      });
    } catch (e) {
      console.warn('[NeoTunes Audio] MediaDevices listener error:', e);
    }
  }

  // 2. Visibility State Change (App Backgrounding / Foregrounding)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('[NeoTunes Audio] App minimized/backgrounded. Background audio service maintaining active stream.');
    } else {
      console.log('[NeoTunes Audio] App returned to foreground. Synchronizing player UI state.');
      // Refresh current spatial audio routing without interrupting active playback
      useSpatialAudioStore.getState().refreshAudioEnvironment();
    }
  };

  // NOTE: pagehide/blur must NEVER pause playback. Background playback is an essential music player feature.
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    isEventsListening = false;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
