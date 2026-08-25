export type ExtensionPermission =
  | 'READ_CURRENT_TRACK'
  | 'READ_QUEUE'
  | 'READ_LIBRARY'
  | 'READ_PLAYBACK_STATE'
  | 'CONTROL_PLAYBACK'
  | 'CREATE_PLAYLIST'
  | 'MODIFY_PLAYLIST'
  | 'USE_AI'
  | 'USE_MUSIC_GRAPH'
  | 'ACCESS_AUDIO_VISUALIZER'
  | 'SHOW_NOTIFICATIONS';

export type ExtensionState =
  | 'AVAILABLE'
  | 'INSTALLED'
  | 'ENABLED'
  | 'DISABLED'
  | 'FAILED'
  | 'BLOCKED';

export interface ExtensionManifest {
  id: string; // e.g. com.example.visualizer
  name: string;
  version: string;
  author: string;
  description: string;
  icon?: string;
  permissions: ExtensionPermission[];
  minimumNeoTunesVersion: string;
  category: 'VISUALIZER' | 'THEME' | 'PLAYLIST_TOOL' | 'AI_TOOL' | 'WIDGET';
}

export interface InstalledExtension {
  manifest: ExtensionManifest;
  state: ExtensionState;
  grantedPermissions: ExtensionPermission[];
  installedAt: number;
}
