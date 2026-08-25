'use client';

import { ListeningRoom, RoomType, RoomParticipant } from '@/types/social-ecosystem';
import { Track } from '@/types';
import { usePlaybackStore } from '@/store/playback-store';
import { DeviceManager } from '../sync/DeviceManager';

const ACTIVE_ROOMS_KEY = 'neotunes_active_listening_rooms';

export class ListeningRoomEngine {
  /**
   * Creates a new Listening Room (Section 50 & 51)
   */
  public static createRoom(name: string, roomType: RoomType = 'PUBLIC'): ListeningRoom {
    const deviceId = DeviceManager.getCurrentDeviceId();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const currentTrack = usePlaybackStore.getState().currentTrack;

    const host: RoomParticipant = {
      userId: deviceId,
      username: 'Room Host',
      role: 'HOST',
      joinedAt: Date.now(),
    };

    const room: ListeningRoom = {
      roomId,
      name,
      hostId: deviceId,
      hostName: 'Room Host',
      roomType,
      currentTrack,
      position: Math.floor(usePlaybackStore.getState().progress),
      isPlaying: usePlaybackStore.getState().isPlaying,
      participants: [host],
      queue: usePlaybackStore.getState().queue,
      createdAt: Date.now(),
    };

    try {
      const stored = localStorage.getItem(ACTIVE_ROOMS_KEY);
      const rooms: ListeningRoom[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(ACTIVE_ROOMS_KEY, JSON.stringify([room, ...rooms]));
    } catch {}

    return room;
  }

  /**
   * Fetches listening room metadata by ID
   */
  public static getRoom(roomId: string): ListeningRoom | null {
    try {
      const stored = localStorage.getItem(ACTIVE_ROOMS_KEY);
      if (!stored) return null;
      const rooms: ListeningRoom[] = JSON.parse(stored);
      return rooms.find((r) => r.roomId === roomId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Joins room and synchronizes playback to host's canonical track and position (Section 55 & 56)
   */
  public static joinRoom(roomId: string): boolean {
    const room = ListeningRoomEngine.getRoom(roomId);
    if (!room || !room.currentTrack) return false;

    // Route play action through canonical track resolution
    const store = usePlaybackStore.getState();
    store.playTrack(room.currentTrack);
    setTimeout(() => store.setProgress(room.position), 500);

    return true;
  }
}
