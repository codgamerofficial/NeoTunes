'use client';

export type ListeningEventType =
  | 'PLAY_STARTED'
  | 'PLAY_30_SECONDS'
  | 'PLAY_50_PERCENT'
  | 'PLAY_COMPLETED'
  | 'SKIPPED'
  | 'REPLAYED'
  | 'LIKED'
  | 'UNLIKED'
  | 'ADDED_TO_PLAYLIST'
  | 'REMOVED_FROM_PLAYLIST'
  | 'DOWNLOADED'
  | 'REMOVED_DOWNLOAD'
  | 'SEARCHED'
  | 'OPENED_ARTIST'
  | 'OPENED_ALBUM'
  | 'NOT_INTERESTED';

export interface ListeningEvent {
  eventId: string;
  userId: string;
  eventType: ListeningEventType;
  trackId?: string;
  artistName?: string;
  genre?: string;
  language?: string;
  source?: string;
  sourceId?: string;
  timestamp: number;
  position?: number;
  sessionId: string;
  metadata?: Record<string, any>;
}

export interface ListeningSession {
  sessionId: string;
  userId: string;
  startedAt: number;
  endedAt?: number;
  tracksPlayed: number;
  tracksCompleted: number;
  tracksSkipped: number;
}

const EVENTS_STORAGE_KEY = 'neotunes_listening_events';
const SESSION_STORAGE_KEY = 'neotunes_active_session';
const MAX_STORED_EVENTS = 500;

export class EventCollector {
  private static activeSession: ListeningSession | null = null;

  public static getActiveSession(userId: string = 'guest'): ListeningSession {
    if (!EventCollector.activeSession || EventCollector.activeSession.userId !== userId) {
      EventCollector.activeSession = {
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        startedAt: Date.now(),
        tracksPlayed: 0,
        tracksCompleted: 0,
        tracksSkipped: 0,
      };
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(EventCollector.activeSession));
      } catch {}
    }
    return EventCollector.activeSession;
  }

  public static trackEvent(
    eventType: ListeningEventType,
    payload: {
      userId?: string;
      trackId?: string;
      artistName?: string;
      genre?: string;
      language?: string;
      source?: string;
      sourceId?: string;
      position?: number;
      metadata?: Record<string, any>;
    }
  ): ListeningEvent {
    const userId = payload.userId || 'guest';
    const session = EventCollector.getActiveSession(userId);

    if (eventType === 'PLAY_STARTED') session.tracksPlayed++;
    if (eventType === 'PLAY_COMPLETED') session.tracksCompleted++;
    if (eventType === 'SKIPPED') session.tracksSkipped++;

    const event: ListeningEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      eventType,
      trackId: payload.trackId,
      artistName: payload.artistName,
      genre: payload.genre,
      language: payload.language,
      source: payload.source,
      sourceId: payload.sourceId,
      timestamp: Date.now(),
      position: payload.position,
      sessionId: session.sessionId,
      metadata: payload.metadata,
    };

    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      const events: ListeningEvent[] = stored ? JSON.parse(stored) : [];
      const updated = [event, ...events].slice(0, MAX_STORED_EVENTS);
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return event;
  }

  public static getRecentEvents(limit: number = 200): ListeningEvent[] {
    try {
      const stored = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (!stored) return [];
      const events: ListeningEvent[] = JSON.parse(stored);
      return events.slice(0, limit);
    } catch {
      return [];
    }
  }

  public static clearEvents(): void {
    try {
      localStorage.removeItem(EVENTS_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
      EventCollector.activeSession = null;
    } catch {}
  }
}
