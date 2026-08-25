'use client';

import { SpatialMode, AudioCapabilityState } from '@/types/audio-adaptive';
import { AudioCapabilityEngine } from './AudioCapabilityEngine';

export class SpatialAudioManager {
  private static currentMode: SpatialMode = 'AUTO';

  public static getAvailableModes(): SpatialMode[] {
    const caps = AudioCapabilityEngine.getCapabilities();
    if (caps.spatialState === 'UNAVAILABLE') {
      return ['OFF'];
    }
    if (caps.headTrackingSupported) {
      return ['OFF', 'AUTO', 'SPATIAL', 'HEAD_TRACKING'];
    }
    return ['OFF', 'AUTO', 'SPATIAL'];
  }

  public static setSpatialMode(mode: SpatialMode): void {
    const available = SpatialAudioManager.getAvailableModes();
    if (available.includes(mode)) {
      SpatialAudioManager.currentMode = mode;
    }
  }

  public static getSpatialMode(): SpatialMode {
    return SpatialAudioManager.currentMode;
  }
}
