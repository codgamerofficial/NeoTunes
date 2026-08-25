export type SpatialState = 'AVAILABLE' | 'ACTIVE' | 'UNAVAILABLE' | 'SYSTEM_CONTROLLED';
export type DolbyState = 'SUPPORTED' | 'ACTIVE' | 'SYSTEM_CONTROLLED' | 'UNSUPPORTED';

export type AudioQualitySetting = 'AUTO' | 'STANDARD' | 'HIGH' | 'LOSSLESS';

export interface AudioCapabilities {
  spatialAudioSupported: boolean;
  dolbyAtmosSupported: boolean;
  hardwareEQSupported: boolean;
  gaplessSupported: boolean;
  crossfadeSupported: boolean;
  highResolutionSupported: boolean;
  losslessSupported: boolean;
  sampleRate: number; // Hz
  channelCount: number;
  bluetoothCodec?: string;
}

export interface AudioState {
  outputRoute: string;
  sampleRate: number;
  bitDepth?: number;
  codec?: string;
  spatialState: SpatialState;
  dolbyState: DolbyState;
  qualitySetting: AudioQualitySetting;
  crossfadeDuration: number; // seconds
  normalizationEnabled: boolean;
  playbackSpeed: number;
}

export interface AudioDiagnosticReport {
  timestamp: number;
  sourceCodec: string;
  sampleRate: string;
  channelInfo: string;
  outputRoute: string;
  bluetoothCodec: string;
  spatialState: SpatialState;
  dolbyState: DolbyState;
  bufferState: string;
}
