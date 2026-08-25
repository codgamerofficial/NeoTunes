'use client';

export type PlaybackState =
  | 'IDLE'
  | 'RESOLVING'
  | 'LOADING'
  | 'BUFFERING'
  | 'READY'
  | 'PLAYING'
  | 'PAUSED'
  | 'SEEKING'
  | 'ENDED'
  | 'ERROR'
  | 'STOPPED';

export class PlaybackStateMachine {
  private static currentState: PlaybackState = 'IDLE';
  private static activeGenerationId: number = 0;
  private static activeTrackCanonicalId: string | null = null;

  /**
   * Advances active generation ID when track changes to discard stale async responses
   */
  public static incrementGeneration(canonicalId: string): number {
    PlaybackStateMachine.activeGenerationId++;
    PlaybackStateMachine.activeTrackCanonicalId = canonicalId;
    return PlaybackStateMachine.activeGenerationId;
  }

  /**
   * Validates whether an incoming async response matches current active track generation
   */
  public static isGenerationValid(genId: number, canonicalId: string): boolean {
    return (
      genId === PlaybackStateMachine.activeGenerationId &&
      canonicalId === PlaybackStateMachine.activeTrackCanonicalId
    );
  }

  /**
   * Transition state safely with explicit validation rules (Section 14 & 15)
   */
  public static transition(nextState: PlaybackState): boolean {
    const validTransitions: Record<PlaybackState, PlaybackState[]> = {
      IDLE: ['RESOLVING', 'STOPPED'],
      RESOLVING: ['LOADING', 'ERROR', 'STOPPED'],
      LOADING: ['READY', 'BUFFERING', 'ERROR', 'STOPPED'],
      BUFFERING: ['READY', 'PLAYING', 'ERROR', 'STOPPED'],
      READY: ['PLAYING', 'PAUSED', 'STOPPED'],
      PLAYING: ['PAUSED', 'BUFFERING', 'SEEKING', 'ENDED', 'ERROR', 'STOPPED'],
      PAUSED: ['PLAYING', 'SEEKING', 'STOPPED'],
      SEEKING: ['PLAYING', 'PAUSED', 'ERROR'],
      ENDED: ['RESOLVING', 'IDLE', 'STOPPED'],
      ERROR: ['RESOLVING', 'IDLE', 'STOPPED'],
      STOPPED: ['IDLE', 'RESOLVING'],
    };

    const allowed = validTransitions[PlaybackStateMachine.currentState];
    if (allowed && allowed.includes(nextState)) {
      PlaybackStateMachine.currentState = nextState;
      return true;
    }
    return false;
  }

  public static getState(): PlaybackState {
    return PlaybackStateMachine.currentState;
  }
}
