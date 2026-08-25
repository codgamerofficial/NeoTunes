'use client';

import { Track } from '@/types';
import { CollaborativePlaylistMember } from '@/types/social-ecosystem';
import { CloudSyncEngine } from '../sync/CloudSyncEngine';

export class CollaborativePlaylistEngine {
  /**
   * Adds track to collaborative playlist using operation sync (Section 24 & 25)
   */
  public static addTrackToPlaylist(playlistId: string, track: Track, userId: string): void {
    if (!track || (!track.id && !track.canonicalId)) return;

    CloudSyncEngine.queueOperation('Playlists', playlistId, 'UPDATE', {
      action: 'ADD_TRACK',
      track,
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Removes track from collaborative playlist
   */
  public static removeTrackFromPlaylist(playlistId: string, trackId: string, userId: string): void {
    CloudSyncEngine.queueOperation('Playlists', playlistId, 'UPDATE', {
      action: 'REMOVE_TRACK',
      trackId,
      userId,
      timestamp: Date.now(),
    });
  }
}
