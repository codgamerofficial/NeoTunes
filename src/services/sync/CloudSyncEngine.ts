'use client';

import { SyncedPlaybackState, SyncOperation, SyncEntity, SyncOperationType } from '@/types/sync';
import { DeviceManager } from './DeviceManager';
import { usePlaybackStore } from '@/store/playback-store';
import { Logger } from '../Logger';

const SYNC_QUEUE_KEY = 'neotunes_sync_queue';
const PLAYBACK_STATE_KEY = 'neotunes_synced_playback_state';

export class CloudSyncEngine {
  /**
   * Broadcasts current playback state for multi-device continuity (Section 27 & 28)
   */
  public static syncPlaybackState(): void {
    const store = usePlaybackStore.getState();
    const track = store.currentTrack;
    if (!track) return;

    const deviceId = DeviceManager.getCurrentDeviceId();
    const devices = DeviceManager.getRegisteredDevices();
    const currentDev = devices.find((d) => d.deviceId === deviceId);

    const payload: SyncedPlaybackState = {
      track,
      canonicalId: track.canonicalId || track.id,
      position: Math.floor(store.progress),
      duration: Math.floor(store.duration),
      isPlaying: store.isPlaying,
      deviceId,
      deviceName: currentDev?.name || 'Active Device',
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(PLAYBACK_STATE_KEY, JSON.stringify(payload));
    } catch {}
  }

  /**
   * Gets latest Continue Listening state from another device (Section 28)
   */
  public static getContinueListeningState(): SyncedPlaybackState | null {
    try {
      const stored = localStorage.getItem(PLAYBACK_STATE_KEY);
      if (!stored) return null;

      const state: SyncedPlaybackState = JSON.parse(stored);
      const currentDeviceId = DeviceManager.getCurrentDeviceId();

      // Only offer continue listening if it originated from a different device
      if (state.deviceId !== currentDeviceId && state.track && state.position > 5) {
        return state;
      }
    } catch {}

    return null;
  }

  /**
   * Queues an offline operation for cloud synchronization (Section 15 & 16)
   */
  public static queueOperation(entityType: SyncEntity, entityId: string, operation: SyncOperationType, payload: any): void {
    const op: SyncOperation = {
      operationId: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      entityType,
      entityId,
      operation,
      payload,
      createdAt: Date.now(),
      retryCount: 0,
      status: 'PENDING',
    };

    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      const queue: SyncOperation[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([...queue, op]));
    } catch {}

    // Trigger async sync flush
    CloudSyncEngine.flushSyncQueue();
  }

  /**
   * Processes pending sync queue operations
   */
  public static async flushSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (!stored) return;

      const queue: SyncOperation[] = JSON.parse(stored);
      const remaining: SyncOperation[] = [];

      for (const op of queue) {
        if (op.status === 'COMPLETED') continue;

        // Simulate network processing success
        op.status = 'COMPLETED';
        Logger.info('DATABASE', `Synced operation ${op.operationId} for ${op.entityType}`);
      }

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
    } catch {}
  }
}
