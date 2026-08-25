export type AudioCapabilityState = 'SUPPORTED' | 'AVAILABLE' | 'ACTIVE' | 'UNAVAILABLE' | 'UNKNOWN';

export type AudioOutputRoute =
  | 'DEVICE_SPEAKER'
  | 'WIRED_HEADPHONES'
  | 'BLUETOOTH'
  | 'USB'
  | 'HDMI'
  | 'SOUNDBAR'
  | 'CAST'
  | 'OTHER_EXTERNAL';

export type SoundProfile =
  | 'NEUTRAL'
  | 'BALANCED'
  | 'IMMERSIVE'
  | 'BASS'
  | 'VOCAL'
  | 'CINEMATIC'
  | 'NIGHT'
  | 'CUSTOM';

export type SpatialMode = 'OFF' | 'AUTO' | 'SPATIAL' | 'HEAD_TRACKING';

export interface AudioCapabilities {
  platform: string;
  currentRoute: AudioOutputRoute;
  routeLabel: string;
  spatialState: AudioCapabilityState;
  dolbyAtmosState: AudioCapabilityState;
  headTrackingSupported: boolean;
  supportedFormats: string[];
  maxChannels: number;
  sampleRate: number;
}

export interface AudioDiagnosticsInfo {
  codec: string;
  sampleRate: string;
  channels: string;
  quality: string;
  spatialStatus: string;
  outputDevice: string;
  dolbyStatus: string;
}
