type PlayerEventType =
  | 'interruption_begin'
  | 'interruption_end'
  | 'network_offline'
  | 'network_online'
  | 'track_ended'
  | 'audio_error'
  | 'device_changed';

type PlayerEventListener = (data?: any) => void;

class PlayerEventEmitter {
  private listeners: Map<PlayerEventType, Set<PlayerEventListener>> = new Map();

  on(event: PlayerEventType, listener: PlayerEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  emit(event: PlayerEventType, data?: any): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[PlayerEvents] Error handling event "${event}":`, err);
        }
      });
    }
  }

  removeAll(event?: PlayerEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const playerEvents = new PlayerEventEmitter();
