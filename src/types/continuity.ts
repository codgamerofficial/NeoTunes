import { Track } from './index';

export type PlatformType = 'android' | 'ios' | 'web' | 'desktop';

export interface DeviceCapabilities {
  backgroundPlayback: boolean;
  spatialAudio: boolean;
  downloadPlayback: boolean;
  remoteControl: boolean;
  bluetooth: boolean;
  externalOutput: boolean;
}

export interface RegisteredDevice {
  deviceId: string;
  name: string;
  platform: PlatformType;
  capabilities: DeviceCapabilities;
  isCurrent: boolean;
  lastSeen: number;
}

export interface PlaybackSession {
  sessionId: string;
  userId: string;
  activeDeviceId: string;
  canonicalTrackId: string;
  position: number; // seconds
  isPlaying: boolean;
  queue: Track[];
  timestamp: number;
  version: number;
}

export type OutputRouteType = 'SPEAKER' | 'BLUETOOTH' | 'HEADPHONES' | 'SOUNDBAR';

export interface AudioOutputRoute {
  id: string;
  name: string;
  type: OutputRouteType;
  isSpatialSupported: boolean;
  isConnected: boolean;
}
