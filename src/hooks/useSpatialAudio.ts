import { useEffect } from 'react';
import { useSpatialAudioStore } from '@/store/spatial-audio-store';
import { usePlaybackStore } from '@/store/playback-store';
import { AudioOutputDevice } from '@/types/spatial';

export function useSpatialAudio() {
  const store = useSpatialAudioStore();
  const currentTrack = usePlaybackStore((s) => s.currentTrack);

  // Sync track spatial metadata when currentTrack changes
  useEffect(() => {
    const updateTrackFormat = store.updateTrackFormat;
    if (currentTrack) {
      const format = currentTrack.spatialFormat || 'stereo';
      const isSpatialized = currentTrack.isContentSpatialized || false;
      updateTrackFormat(format, isSpatialized);
    }
  }, [currentTrack?.id, currentTrack?.spatialFormat, currentTrack?.isContentSpatialized, store.updateTrackFormat]);

  return {
    supported: store.supported,
    available: store.available,
    enabled: store.enabled,
    immersiveLevel: store.immersiveLevel,
    canSpatialize: store.canSpatializeCurrentTrack,
    headTrackingAvailable: store.headTrackingAvailable,
    headTrackingEnabled: store.headTrackingEnabled,
    isContentSpatialized: store.isContentSpatialized,
    outputDevice: store.outputDevice,
    outputDeviceName: store.outputDeviceName,
    mode: store.mode,
    activeFormat: store.activeFormat,
    dolbyAtmosReported: store.dolbyAtmosReported,
    loudnessNormalizationEnabled: store.loudnessNormalizationEnabled,
    eqPreset: store.eqPreset,
    eqGains: store.eqGains,

    // Actions
    setMode: store.setMode,
    toggleSpatialAudio: store.toggleSpatialAudio,
    toggleHeadTracking: store.toggleHeadTracking,
    toggleLoudnessNormalization: store.toggleLoudnessNormalization,
    setEqPreset: store.setEqPreset,
    setCustomEqGain: store.setCustomEqGain,
    setOutputDevice: (device: AudioOutputDevice, name: string) => store.setOutputDevice(device, name),
    refresh: store.refreshAudioEnvironment,
  };
}
