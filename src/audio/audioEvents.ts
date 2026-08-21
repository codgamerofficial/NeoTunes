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

  // 2. Audio Focus / Visibility State Change (App Backgrounding)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      console.log('[NeoTunes Audio] App minimized/backgrounded. Background audio service maintaining active stream.');
    } else {
      console.log('[NeoTunes Audio] App returned to foreground. Synchronizing player UI state.');
      // Refresh current position & spatial audio routing without restarting playback
      useSpatialAudioStore.getState().refreshAudioEnvironment();
    }
  };

  window.addEventListener('pagehide', handleHeadphoneDisconnect);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    isEventsListening = false;
    window.removeEventListener('pagehide', handleHeadphoneDisconnect);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
