'use client';

import { ExtensionManifest, InstalledExtension, ExtensionPermission } from '@/types/extension-sdk';

const EXTENSIONS_STORAGE_KEY = 'neotunes_installed_extensions';

const SAMPLE_STORE_EXTENSIONS: ExtensionManifest[] = [
  {
    id: 'com.neotunes.spectrum_visualizer',
    name: 'Cyberpunk Spectrum Visualizer',
    version: '1.2.0',
    author: 'NeoStudio Devs',
    description: 'High-FPS neon spectrum visualizer plugin.',
    permissions: ['READ_CURRENT_TRACK', 'ACCESS_AUDIO_VISUALIZER'],
    minimumNeoTunesVersion: '1.0.0',
    category: 'VISUALIZER',
  },
  {
    id: 'com.neotunes.ai_playlist_lab',
    name: 'AI Smart Playlist Assistant',
    version: '2.0.1',
    author: 'AI Curation Collective',
    description: 'Generates graph-backed smart playlists.',
    permissions: ['READ_LIBRARY', 'CREATE_PLAYLIST', 'USE_AI'],
    minimumNeoTunesVersion: '1.0.0',
    category: 'AI_TOOL',
  },
];

export class ExtensionManager {
  /**
   * Returns store available extensions list (Section 49 & 50)
   */
  public static getStoreExtensions(): ExtensionManifest[] {
    return SAMPLE_STORE_EXTENSIONS;
  }

  /**
   * Returns installed extensions with permission status (Section 3 & 10)
   */
  public static getInstalledExtensions(): InstalledExtension[] {
    try {
      const stored = localStorage.getItem(EXTENSIONS_STORAGE_KEY);
      if (!stored) {
        const initial: InstalledExtension[] = [
          {
            manifest: SAMPLE_STORE_EXTENSIONS[0],
            state: 'ENABLED',
            grantedPermissions: SAMPLE_STORE_EXTENSIONS[0].permissions,
            installedAt: Date.now() - 86400000 * 5,
          },
        ];
        localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Installs extension with explicit permission grant (Section 12 & 13)
   */
  public static installExtension(manifest: ExtensionManifest): InstalledExtension {
    const installed = ExtensionManager.getInstalledExtensions();
    const existing = installed.find((e) => e.manifest.id === manifest.id);

    if (existing) {
      existing.state = 'ENABLED';
      existing.grantedPermissions = manifest.permissions;
    } else {
      installed.push({
        manifest,
        state: 'ENABLED',
        grantedPermissions: manifest.permissions,
        installedAt: Date.now(),
      });
    }

    try {
      localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(installed));
    } catch {}

    return installed.find((e) => e.manifest.id === manifest.id)!;
  }

  /**
   * Revokes permissions / disables extension (Section 14 & 89)
   */
  public static revokePermissions(extensionId: string): boolean {
    const installed = ExtensionManager.getInstalledExtensions();
    const target = installed.find((e) => e.manifest.id === extensionId);
    if (!target) return false;

    target.grantedPermissions = [];
    target.state = 'DISABLED';

    try {
      localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(installed));
    } catch {}

    return true;
  }
}
