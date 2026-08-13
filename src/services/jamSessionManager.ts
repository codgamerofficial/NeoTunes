import { Track } from '@/types';

export interface JamMember {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  joinedAt: string;
}

export interface JamReaction {
  id: string;
  userName: string;
  emoji: string;
  timestamp: number;
}

export interface JamSession {
  id: string;
  roomName: string;
  hostId: string;
  inviteCode: string;
  members: JamMember[];
  currentTrack: Track | null;
  positionMs: number;
  isPlaying: boolean;
  queue: Track[];
  reactions: JamReaction[];
}

class JamSessionManager {
  private activeSession: JamSession | null = null;

  public createSession(hostName: string, roomName: string): JamSession {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const host: JamMember = {
      id: 'usr_host_' + Date.now(),
      name: hostName,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      isHost: true,
      joinedAt: new Date().toISOString(),
    };

    this.activeSession = {
      id: 'jam_' + Date.now(),
      roomName,
      hostId: host.id,
      inviteCode,
      members: [host],
      currentTrack: null,
      positionMs: 0,
      isPlaying: false,
      queue: [],
      reactions: [],
    };

    return this.activeSession;
  }

  public joinSession(inviteCode: string, memberName: string): JamSession | null {
    if (!this.activeSession || this.activeSession.inviteCode !== inviteCode) {
      // Simulate session lookup
      this.activeSession = {
        id: 'jam_' + Date.now(),
        roomName: `${memberName}'s Jam`,
        hostId: 'host_id',
        inviteCode,
        members: [],
        currentTrack: null,
        positionMs: 0,
        isPlaying: false,
        queue: [],
        reactions: [],
      };
    }

    const newMember: JamMember = {
      id: 'usr_' + Date.now(),
      name: memberName,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      isHost: false,
      joinedAt: new Date().toISOString(),
    };

    this.activeSession.members.push(newMember);
    return this.activeSession;
  }

  public addTrackToQueue(track: Track): void {
    if (this.activeSession) {
      this.activeSession.queue.push(track);
    }
  }

  public sendReaction(userName: string, emoji: string): void {
    if (this.activeSession) {
      this.activeSession.reactions.push({
        id: 'react_' + Date.now(),
        userName,
        emoji,
        timestamp: Date.now(),
      });
    }
  }

  public getActiveSession(): JamSession | null {
    return this.activeSession;
  }
}

export const jamSessionManager = new JamSessionManager();
