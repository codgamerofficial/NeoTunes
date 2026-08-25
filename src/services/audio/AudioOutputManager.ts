'use client';

import { AudioOutputRoute, SoundProfile } from '@/types/audio-adaptive';

const DEVICE_AUDIO_PROFILE_PREFIX = 'neotunes_sound_profile_';

export class AudioOutputManager {
  /**
   * Gets device-specific sound profile for output route (Section 15 & 53)
   */
  public static getProfileForRoute(route: AudioOutputRoute): SoundProfile {
    try {
      const stored = localStorage.getItem(`${DEVICE_AUDIO_PROFILE_PREFIX}${route}`);
      if (stored) return stored as SoundProfile;
    } catch {}
    return 'IMMERSIVE'; // NeoTunes Immersive Default
  }

  /**
   * Saves device-specific sound profile for specific route without overwriting other devices
   */
  public static setProfileForRoute(route: AudioOutputRoute, profile: SoundProfile): void {
    try {
      localStorage.setItem(`${DEVICE_AUDIO_PROFILE_PREFIX}${route}`, profile);
    } catch {}
  }
}
