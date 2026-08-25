export type ExtensionCapability =
  | 'MUSIC_PROVIDER'
  | 'LYRICS_PROVIDER'
  | 'ARTWORK_PROVIDER'
  | 'AI_PROVIDER'
  | 'THEME'
  | 'VISUALIZER'
  | 'AUDIO_PROFILE'
  | 'IMPORTER'
  | 'EXPORTER'
  | 'SCROBBLER'
  | 'INTEGRATION';

export type ExtensionPermission =
  | 'READ_CURRENT_TRACK'
  | 'READ_LIBRARY'
  | 'READ_HISTORY'
  | 'READ_PLAYLISTS'
  | 'WRITE_PLAYLISTS'
  | 'READ_PROFILE'
  | 'NETWORK_ACCESS'
  | 'AUDIO_ACCESS'
  | 'NOTIFICATION_ACCESS';

export type ExtensionStatus = 'DISCOVERED' | 'INSTALLED' | 'ENABLED' | 'DISABLED' | 'FAILED';

export interface NeoTunesExtensionManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  homepage?: string;
  license?: string;
  minNeoTunesVersion: string;
  maxNeoTunesVersion?: string;
  capabilities: ExtensionCapability[];
  permissions: ExtensionPermission[];
}

export interface InstalledExtension {
  manifest: NeoTunesExtensionManifest;
  status: ExtensionStatus;
  enabled: boolean;
  installedAt: number;
  lastFailureMessage?: string;
}
