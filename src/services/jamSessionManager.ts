import { Track } from '@/types';

export interface JamMember {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  joinedAt: string;
}

export interface JamChatMessage {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  message: string;
  timestamp: number;
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
  genre: string;
  hostId: string;
  hostName: string;
  inviteCode: string;
  isPrivate: boolean;
  allowGuestQueue: boolean;
  members: JamMember[];
  currentTrack: Track | null;
  positionMs: number;
  isPlaying: boolean;
  queue: Track[];
  chatMessages: JamChatMessage[];
  reactions: JamReaction[];
}

const DEFAULT_PUBLIC_JAMS: JamSession[] = [
  {
    id: 'JAM-NEO-01',
    roomName: 'Late Night Multiverse Chill',
    genre: 'Lo-Fi & Ambient',
    hostId: 'host_1',
    hostName: 'Aarav (Host)',
    inviteCode: 'CHILL26',
    isPrivate: false,
    allowGuestQueue: true,
    members: [
      { id: 'm1', name: 'Aarav', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', isHost: true, joinedAt: '2026-09-02T05:00:00Z' },
      { id: 'm2', name: 'Rohan', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', isHost: false, joinedAt: '2026-09-02T05:10:00Z' },
      { id: 'm3', name: 'Maya', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', isHost: false, joinedAt: '2026-09-02T05:15:00Z' },
    ],
    currentTrack: {
      id: 'trk_1',
      canonicalId: 'trk_1',
      title: 'Maney Na (Acoustic Version)',
      artist: 'Nish',
      artists: ['Nish'],
      album: 'Acoustic Sessions',
      artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      duration: 187,
      durationMs: 187000,
      source: 'spotify',
      sourceId: 'trk_1',
      playable: true,
    },
    positionMs: 45000,
    isPlaying: true,
    queue: [
      {
        id: 'trk_q1',
        canonicalId: 'trk_q1',
        title: 'Calm Rain Melodies',
        artist: 'NeoTunes Lo-Fi',
        artists: ['NeoTunes Lo-Fi'],
        album: 'Midnight Horizons',
        artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&q=80',
        duration: 210,
        durationMs: 210000,
        source: 'spotify',
        sourceId: 'trk_q1',
        playable: true,
      }
    ],
    chatMessages: [
      { id: 'c1', userId: 'm1', userName: 'Aarav', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', message: 'Welcome everyone! Feel free to add your favorite acoustic tracks.', timestamp: Date.now() - 60000 },
      { id: 'c2', userId: 'm2', userName: 'Rohan', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', message: 'This track is pure magic 🔥', timestamp: Date.now() - 25000 },
    ],
    reactions: [],
  },
  {
    id: 'JAM-BOLLYWOOD-02',
    roomName: 'Arijit Singh & Pritam Masterclass',
    genre: 'Bollywood & Hindi',
    hostId: 'host_2',
    hostName: 'Priya',
    inviteCode: 'ARIJIT26',
    isPrivate: false,
    allowGuestQueue: true,
    members: [
      { id: 'm4', name: 'Priya', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80', isHost: true, joinedAt: '2026-09-02T04:45:00Z' },
      { id: 'm5', name: 'Vikram', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&q=80', isHost: false, joinedAt: '2026-09-02T05:05:00Z' },
    ],
    currentTrack: {
      id: 'trk_2',
      canonicalId: 'trk_2',
      title: 'Kesariya (From "Brahmāstra")',
      artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya',
      artists: ['Pritam', 'Arijit Singh', 'Amitabh Bhattacharya'],
      album: 'Brahmāstra',
      artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
      duration: 268,
      durationMs: 268000,
      source: 'spotify',
      sourceId: 'trk_2',
      playable: true,
    },
    positionMs: 82000,
    isPlaying: true,
    queue: [],
    chatMessages: [
      { id: 'c3', userId: 'm4', userName: 'Priya', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80', message: 'Sing along time!', timestamp: Date.now() - 30000 },
    ],
    reactions: [],
  },
  {
    id: 'JAM-SYNTH-03',
    roomName: 'Cyberpunk & Synthwave Night Ride',
    genre: 'Electronic & Synth',
    hostId: 'host_3',
    hostName: 'NeoHacker',
    inviteCode: 'SYNTH88',
    isPrivate: false,
    allowGuestQueue: false,
    members: [
      { id: 'm6', name: 'NeoHacker', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80', isHost: true, joinedAt: '2026-09-02T05:20:00Z' },
    ],
    currentTrack: {
      id: 'trk_3',
      canonicalId: 'trk_3',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      artists: ['The Weeknd'],
      album: 'After Hours',
      artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
      duration: 200,
      durationMs: 200000,
      source: 'spotify',
      sourceId: 'trk_3',
      playable: true,
    },
    positionMs: 12000,
    isPlaying: true,
    queue: [],
    chatMessages: [],
    reactions: [],
  }
];

class JamSessionManager {
  private sessions: Map<string, JamSession> = new Map();
  private activeSessionId: string | null = null;

  constructor() {
    DEFAULT_PUBLIC_JAMS.forEach(s => this.sessions.set(s.id, s));
  }

  public getPublicSessions(): JamSession[] {
    return Array.from(this.sessions.values()).filter(s => !s.isPrivate);
  }

  public getSession(idOrCode: string): JamSession | null {
    if (this.sessions.has(idOrCode)) {
      return this.sessions.get(idOrCode)!;
    }
    for (const session of this.sessions.values()) {
      if (session.inviteCode.toUpperCase() === idOrCode.toUpperCase()) {
        return session;
      }
    }
    return null;
  }

  public createSession(
    roomName: string,
    hostName: string,
    genre: string = 'General Jam',
    isPrivate: boolean = false,
    allowGuestQueue: boolean = true
  ): JamSession {
    const id = 'JAM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const host: JamMember = {
      id: 'usr_' + Date.now(),
      name: hostName || 'Jam Host',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      isHost: true,
      joinedAt: new Date().toISOString(),
    };

    const newSession: JamSession = {
      id,
      roomName: roomName.trim() || `${hostName}'s Jam`,
      genre,
      hostId: host.id,
      hostName,
      inviteCode,
      isPrivate,
      allowGuestQueue,
      members: [host],
      currentTrack: null,
      positionMs: 0,
      isPlaying: true,
      queue: [],
      chatMessages: [
        {
          id: 'sys_' + Date.now(),
          userId: 'system',
          userName: 'NeoTunes',
          avatarUrl: '',
          message: `Room "${roomName}" created! Share invite code ${inviteCode} with friends.`,
          timestamp: Date.now(),
        }
      ],
      reactions: [],
    };

    this.sessions.set(id, newSession);
    this.activeSessionId = id;
    return newSession;
  }

  public joinSession(idOrCode: string, memberName: string): JamSession {
    let session = this.getSession(idOrCode);
    if (!session) {
      // Create ad-hoc joined session for this code
      session = this.createSession(`${memberName}'s Jam Room`, memberName);
    }

    const existing = session.members.find(m => m.name.toLowerCase() === memberName.toLowerCase());
    if (!existing) {
      const newMember: JamMember = {
        id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 4),
        name: memberName || 'Guest Listener',
        avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80`,
        isHost: false,
        joinedAt: new Date().toISOString(),
      };
      session.members.push(newMember);
      session.chatMessages.push({
        id: 'sys_join_' + Date.now(),
        userId: 'system',
        userName: 'NeoTunes',
        avatarUrl: '',
        message: `${memberName} tuned into the jam!`,
        timestamp: Date.now(),
      });
    }

    this.activeSessionId = session.id;
    return session;
  }

  public addTrackToQueue(sessionId: string, track: Track): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.queue.push(track);
    }
  }

  public sendChatMessage(sessionId: string, userName: string, message: string): void {
    const session = this.getSession(sessionId);
    if (session && message.trim()) {
      session.chatMessages.push({
        id: 'chat_' + Date.now(),
        userId: 'usr_active',
        userName,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
        message: message.trim(),
        timestamp: Date.now(),
      });
    }
  }

  public sendReaction(sessionId: string, userName: string, emoji: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.reactions.push({
        id: 'react_' + Date.now(),
        userName,
        emoji,
        timestamp: Date.now(),
      });
    }
  }

  public getActiveSession(): JamSession | null {
    return this.activeSessionId ? this.sessions.get(this.activeSessionId) || null : null;
  }
}

export const jamSessionManager = new JamSessionManager();
