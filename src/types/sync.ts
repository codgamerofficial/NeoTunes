import { Track } from './index';

export type DevicePlatform = 'ANDROID' | 'WINDOWS' | 'MAC' | 'WEB';

export interface DeviceCapabilities {
  spatialAudio: boolean;
  localDownloads: boolean;
  backgroundAudio: boolean;
}

export interface RegisteredDevice {
  deviceId: string;
  userId: string;
  name: string;
  platform: DevicePlatform;
  appVersion: string;
  osVersion?: string;
  lastSeen: number;
  createdAt: number;
  isActive: boolean;
  capabilities: DeviceCapabilities;
}

export type SyncEntity =
  | 'UserProfile'
  | 'Preferences'
  | 'Likes'
  | 'Playlists'
  | 'Library'
  | 'MusicProfile'
  | 'ListeningHistory'
  | 'PlaybackState';

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export type SyncStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CONFLICT';

export interface SyncOperation {
  operationId: string;
  entityType: SyncEntity;
  entityId: string;
  operation: SyncOperationType;
  payload: any;
  createdAt: number;
  retryCount: number;
  status: SyncStatus;
}

export interface SyncedPlaybackState {
  track: Track | null;
  canonicalId: string | null;
  position: number; // in seconds
  duration: number;
  isPlaying: boolean;
  deviceId: string;
  deviceName: string;
  updatedAt: number;
}
