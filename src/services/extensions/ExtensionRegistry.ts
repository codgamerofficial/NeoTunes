'use client';

import { NeoTunesExtensionManifest, InstalledExtension, ExtensionStatus } from '@/types/extension';
import { Logger } from '../Logger';

const EXTENSIONS_STORAGE_KEY = 'neotunes_installed_extensions';

export class ExtensionRegistry {
  private static extensions: Map<string, InstalledExtension> = new Map();

  public static initialize(): void {
    try {
      const stored = localStorage.getItem(EXTENSIONS_STORAGE_KEY);
      if (stored) {
        const list: InstalledExtension[] = JSON.parse(stored);
        list.forEach((ext) => ExtensionRegistry.extensions.set(ext.manifest.id, ext));
      }
    } catch {
      Logger.warn('NATIVE', 'Failed to load stored extension state');
    }
  }

  public static registerExtension(manifest: NeoTunesExtensionManifest): InstalledExtension {
    const existing = ExtensionRegistry.extensions.get(manifest.id);
    const extension: InstalledExtension = {
      manifest,
      status: existing ? existing.status : 'INSTALLED',
      enabled: existing ? existing.enabled : true,
      installedAt: existing ? existing.installedAt : Date.now(),
    };

    ExtensionRegistry.extensions.set(manifest.id, extension);
    ExtensionRegistry.saveState();
    return extension;
  }

  public static setEnabled(id: string, enabled: boolean): void {
    const ext = ExtensionRegistry.extensions.get(id);
    if (ext) {
      ext.enabled = enabled;
      ext.status = enabled ? 'ENABLED' : 'DISABLED';
      ExtensionRegistry.saveState();
    }
  }

  public static getAllExtensions(): InstalledExtension[] {
    return Array.from(ExtensionRegistry.extensions.values());
  }

  /**
   * Executes extension function inside an isolated safety boundary.
   * If extension throws, marks extension as FAILED without crashing NeoTunes core.
   */
  public static async executeSafely<T>(id: string, fn: () => Promise<T>): Promise<T | null> {
    const ext = ExtensionRegistry.extensions.get(id);
    if (!ext || !ext.enabled) return null;

    try {
      return await fn();
    } catch (err: any) {
      Logger.error('NATIVE', `Extension ${id} execution failure: ${err?.message || err}`);
      ext.status = 'FAILED';
      ext.lastFailureMessage = err?.message || 'Execution error';
      ExtensionRegistry.saveState();
      return null;
    }
  }

  private static saveState(): void {
    try {
      const list = Array.from(ExtensionRegistry.extensions.values());
      localStorage.setItem(EXTENSIONS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
  }
}

ExtensionRegistry.initialize();
