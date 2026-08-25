'use client';

import { RegisteredDevice, DevicePlatform } from '@/types/sync';

const DEVICE_STORAGE_KEY = 'neotunes_current_device_id';
const DEVICES_LIST_KEY = 'neotunes_registered_devices';

export class DeviceManager {
  /**
   * Returns or generates a stable unique device ID for current hardware/browser
   */
  public static getCurrentDeviceId(): string {
    try {
      let id = localStorage.getItem(DEVICE_STORAGE_KEY);
      if (!id) {
        id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        localStorage.setItem(DEVICE_STORAGE_KEY, id);
      }
      return id;
    } catch {
      return 'dev_guest_device';
    }
  }

  /**
   * Determines current platform environment
   */
  public static getPlatform(): DevicePlatform {
    if (typeof window === 'undefined') return 'WEB';
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'ANDROID';
    if (/mac/i.test(ua)) return 'MAC';
    if (/win/i.test(ua)) return 'WINDOWS';
    return 'WEB';
  }

  /**
   * Registers current device in account registry
   */
  public static registerCurrentDevice(userId: string = 'guest'): RegisteredDevice {
    const deviceId = DeviceManager.getCurrentDeviceId();
    const platform = DeviceManager.getPlatform();
    const deviceName =
      platform === 'ANDROID'
        ? 'Android Phone'
        : platform === 'WINDOWS'
        ? 'Windows Desktop'
        : platform === 'MAC'
        ? 'Mac Desktop'
        : 'Web Browser';

    const current: RegisteredDevice = {
      deviceId,
      userId,
      name: deviceName,
      platform,
      appVersion: '1.0.0',
      lastSeen: Date.now(),
      createdAt: Date.now(),
      isActive: true,
      capabilities: {
        spatialAudio: platform === 'ANDROID',
        localDownloads: true,
        backgroundAudio: true,
      },
    };

    try {
      const stored = localStorage.getItem(DEVICES_LIST_KEY);
      const devices: RegisteredDevice[] = stored ? JSON.parse(stored) : [];
      const updated = [
        current,
        ...devices.filter((d) => !(d.deviceId === deviceId && d.userId === userId)),
      ];
      localStorage.setItem(DEVICES_LIST_KEY, JSON.stringify(updated));
    } catch {}

    return current;
  }

  /**
   * Lists all devices registered for account
   */
  public static getRegisteredDevices(userId: string = 'guest'): RegisteredDevice[] {
    try {
      const stored = localStorage.getItem(DEVICES_LIST_KEY);
      if (!stored) return [DeviceManager.registerCurrentDevice(userId)];
      const devices: RegisteredDevice[] = JSON.parse(stored);
      return devices.filter((d) => d.userId === userId);
    } catch {
      return [DeviceManager.registerCurrentDevice(userId)];
    }
  }

  /**
   * Removes device registration
   */
  public static removeDevice(deviceId: string): void {
    try {
      const stored = localStorage.getItem(DEVICES_LIST_KEY);
      if (!stored) return;
      const devices: RegisteredDevice[] = JSON.parse(stored);
      const updated = devices.filter((d) => d.deviceId !== deviceId);
      localStorage.setItem(DEVICES_LIST_KEY, JSON.stringify(updated));
    } catch {}
  }
}
