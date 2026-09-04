'use client';

export interface RealAudioDevice {
  id: string;
  name: string;
  type: 'internal' | 'bluetooth' | 'wired' | 'ble' | 'usb' | 'cast' | 'browser_output';
  displayType: string;
  isConnected: boolean;
  isActive: boolean;
}

export const DEFAULT_DEVICE: RealAudioDevice = {
  id: 'default',
  name: 'Device information unavailable',
  type: 'internal',
  displayType: 'Standard Audio Route',
  isConnected: true,
  isActive: true,
};

export class RealDeviceManager {
  private static instance: RealDeviceManager;
  private listeners: Set<(device: RealAudioDevice) => void> = new Set();
  private currentDevice: RealAudioDevice = DEFAULT_DEVICE;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initListeners();
    }
  }

  public static getInstance(): RealDeviceManager {
    if (!RealDeviceManager.instance) {
      RealDeviceManager.instance = new RealDeviceManager();
    }
    return RealDeviceManager.instance;
  }

  private initListeners() {
    if (typeof window === 'undefined') return;

    // 1. Android Capacitor Native Bridge Check
    const capacitor = (window as any)?.Capacitor;
    if (capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform()) {
      try {
        const AudioDevicePlugin = capacitor.Plugins?.AudioDevice;
        if (AudioDevicePlugin) {
          AudioDevicePlugin.addListener('audioOutputChanged', (device: RealAudioDevice) => {
            this.currentDevice = device;
            this.notify(device);
          });
          AudioDevicePlugin.addListener('audioBecomingNoisy', () => {
            // Unplugged headphones
            this.refreshDevice();
          });
        }
      } catch (err) {
        console.warn('[RealDeviceManager] Native listener initialization error:', err);
      }
    }

    // 2. Web Standards Browser MediaDevices
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      try {
        navigator.mediaDevices.addEventListener('devicechange', () => {
          this.refreshDevice();
        });
      } catch (e) {
        console.warn('[RealDeviceManager] Browser devicechange listener error:', e);
      }
    }
  }

  public async getCurrentAudioOutput(): Promise<RealAudioDevice> {
    if (typeof window === 'undefined') return DEFAULT_DEVICE;

    // 1. Check Native Android Bridge
    const capacitor = (window as any)?.Capacitor;
    if (capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform()) {
      try {
        const plugin = capacitor.Plugins?.AudioDevice;
        if (plugin?.getCurrentAudioOutput) {
          const res = await plugin.getCurrentAudioOutput();
          if (res && res.name) {
            this.currentDevice = res;
            return res;
          }
        }
      } catch (err) {
        console.warn('[RealDeviceManager] Native getCurrentAudioOutput error:', err);
      }
    }

    // 2. Web Browser MediaDevices Output Inspection
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');
        
        if (audioOutputs.length > 0) {
          const activeOutput = audioOutputs.find((d) => d.deviceId === 'default') || audioOutputs[0];
          const label = activeOutput.label?.trim();

          let type: RealAudioDevice['type'] = 'browser_output';
          let displayType = 'Active Output';
          let name = 'Device information unavailable';

          if (label) {
            name = label;
            const lower = label.toLowerCase();
            if (lower.includes('bluetooth') || lower.includes('wireless') || lower.includes('buds') || lower.includes('bar') || lower.includes('wh-') || lower.includes('s40r')) {
              type = 'bluetooth';
              displayType = 'Bluetooth • Active';
            } else if (lower.includes('headphone') || lower.includes('headset') || lower.includes('earphone')) {
              type = 'wired';
              displayType = 'Wired Audio • Active';
            } else if (lower.includes('usb')) {
              type = 'usb';
              displayType = 'USB Audio • Active';
            } else if (lower.includes('speaker') || lower.includes('realtek') || lower.includes('internal')) {
              type = 'internal';
              displayType = 'Built-in • Active';
            }
          } else {
            // Browser sandboxed labels without microphone/audio permission
            type = 'internal';
            name = 'Device information unavailable';
            displayType = 'Standard Route';
          }

          const dev: RealAudioDevice = {
            id: activeOutput.deviceId || 'default',
            name,
            type,
            displayType,
            isConnected: true,
            isActive: true,
          };
          this.currentDevice = dev;
          return dev;
        }
      } catch (err) {
        console.warn('[RealDeviceManager] Web enumerateDevices error:', err);
      }
    }

    return DEFAULT_DEVICE;
  }

  public async getAvailableAudioOutputs(): Promise<RealAudioDevice[]> {
    if (typeof window === 'undefined') return [DEFAULT_DEVICE];

    // 1. Check Native Android Bridge
    const capacitor = (window as any)?.Capacitor;
    if (capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform()) {
      try {
        const plugin = capacitor.Plugins?.AudioDevice;
        if (plugin?.getAvailableAudioOutputs) {
          const res = await plugin.getAvailableAudioOutputs();
          if (res?.devices && Array.isArray(res.devices)) {
            return res.devices;
          }
        }
      } catch (err) {
        console.warn('[RealDeviceManager] Native getAvailableAudioOutputs error:', err);
      }
    }

    // 2. Web Browser MediaDevices Output Inspection
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');

        if (audioOutputs.length > 0) {
          return audioOutputs.map((d) => {
            const label = d.label?.trim();
            let type: RealAudioDevice['type'] = 'browser_output';
            let displayType = 'Available Audio Output';
            let name = label || 'Device information unavailable';

            if (label) {
              const lower = label.toLowerCase();
              if (lower.includes('bluetooth') || lower.includes('wireless') || lower.includes('buds') || lower.includes('bar')) {
                type = 'bluetooth';
                displayType = 'Bluetooth';
              } else if (lower.includes('headphone') || lower.includes('headset')) {
                type = 'wired';
                displayType = 'Wired';
              } else if (lower.includes('usb')) {
                type = 'usb';
                displayType = 'USB';
              } else {
                type = 'internal';
                displayType = 'Built-in';
              }
            } else {
              type = 'internal';
              displayType = 'Standard Route';
            }

            return {
              id: d.deviceId,
              name,
              type,
              displayType,
              isConnected: true,
              isActive: d.deviceId === 'default' || d.deviceId === this.currentDevice.id,
            };
          });
        }
      } catch (err) {
        console.warn('[RealDeviceManager] Web getAvailableAudioOutputs error:', err);
      }
    }

    return [DEFAULT_DEVICE];
  }

  public subscribeToAudioOutputChanges(callback: (device: RealAudioDevice) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentDevice);
    this.refreshDevice();

    return () => {
      this.listeners.delete(callback);
    };
  }

  private async refreshDevice() {
    const dev = await this.getCurrentAudioOutput();
    this.notify(dev);
  }

  public async selectAudioOutput(deviceId: string): Promise<boolean> {
    const capacitor = (window as any)?.Capacitor;
    if (capacitor && capacitor.isNativePlatform && capacitor.isNativePlatform()) {
      try {
        const plugin = capacitor.Plugins?.AudioDevice;
        if (plugin?.selectAudioOutput) {
          await plugin.selectAudioOutput({ deviceId });
          await this.refreshDevice();
          return true;
        }
      } catch (err) {
        console.warn('[RealDeviceManager] Native selectAudioOutput error:', err);
      }
    }

    const available = await this.getAvailableAudioOutputs();
    const target = available.find((d) => d.id === deviceId);
    if (target) {
      this.notify(target);
      return true;
    }
    return false;
  }

  private notify(device: RealAudioDevice) {
    this.currentDevice = device;
    this.listeners.forEach((cb) => cb(device));
  }
}

export const realDeviceManager = RealDeviceManager.getInstance();
