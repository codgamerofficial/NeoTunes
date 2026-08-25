'use client';

import { RegisteredDevice, PlaybackSession } from '@/types/continuity';
import { usePlaybackStore } from '@/store/playback-store';
import { DeviceManager } from '../sync/DeviceManager';

const SESSION_STORAGE_KEY = 'neotunes_active_playback_session';
const DEVICES_STORAGE_KEY = 'neotunes_registered_devices';

export class ContinuityEngine {
  /**
   * Registers current device into device directory (Section 6 & 7)
   */
  public static registerCurrentDevice(): RegisteredDevice {
    const deviceId = DeviceManager.getCurrentDeviceId();
    const currentDevice: RegisteredDevice = {
      deviceId,
      name: `NeoTunes Device (${deviceId.substring(0, 4)})`,
      platform: 'web',
      capabilities: {
        backgroundPlayback: true,
        spatialAudio: true,
        downloadPlayback: true,
        remoteControl: true,
        bluetooth: true,
        externalOutput: true,
      },
      isCurrent: true,
      lastSeen: Date.now(),
    };

    try {
      const stored = localStorage.getItem(DEVICES_STORAGE_KEY);
      const devices: RegisteredDevice[] = stored ? JSON.parse(stored) : [];
      const updated = [currentDevice, ...devices.filter((d) => d.deviceId !== deviceId)];
      localStorage.setItem(DEVICES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return currentDevice;
  }

  /**
   * Fetches registered devices list
   */
  public static getRegisteredDevices(): RegisteredDevice[] {
    try {
      const stored = localStorage.getItem(DEVICES_STORAGE_KEY);
      if (!stored) return [ContinuityEngine.registerCurrentDevice()];
      return JSON.parse(stored);
    } catch {
      return [ContinuityEngine.registerCurrentDevice()];
    }
  }

  /**
   * Performs seamless session handoff from active device to target device (Section 9 & 10)
   */
  public static handoffToDevice(targetDeviceId: string): boolean {
    const store = usePlaybackStore.getState();
    const currentTrack = store.currentTrack;
    if (!currentTrack) return false;

    const session: PlaybackSession = {
      sessionId: `sess_${Date.now()}`,
      userId: 'user_active',
      activeDeviceId: targetDeviceId,
      canonicalTrackId: currentTrack.canonicalId || currentTrack.id,
      position: Math.floor(store.progress),
      isPlaying: store.isPlaying,
      queue: store.queue,
      timestamp: Date.now(),
      version: Date.now(),
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {}

    return true;
  }
}
