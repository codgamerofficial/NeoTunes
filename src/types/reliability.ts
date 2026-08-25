export type SubsystemState = 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'ERROR' | 'RECOVERING';

export type SubsystemName =
  | 'PLAYER'
  | 'NETWORK'
  | 'DATABASE'
  | 'SYNC'
  | 'AUTH'
  | 'DOWNLOADS'
  | 'RECOMMENDATIONS'
  | 'AI'
  | 'SOCIAL'
  | 'REALTIME'
  | 'AUDIO'
  | 'CACHE'
  | 'STORAGE';

export type ErrorCategory =
  | 'AUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMIT'
  | 'NOT_FOUND'
  | 'UNAVAILABLE'
  | 'INVALID_DATA'
  | 'PLAYER_ERROR'
  | 'DECODER_ERROR'
  | 'AUDIO_ERROR'
  | 'SYNC_ERROR'
  | 'DATABASE_ERROR'
  | 'STORAGE_ERROR'
  | 'AI_ERROR'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR';

export interface HealthCheckResult {
  subsystem: SubsystemName;
  status: SubsystemState;
  latencyMs: number;
  message?: string;
}

export interface SystemHealthReport {
  overallStatus: SubsystemState;
  subsystems: Record<SubsystemName, SubsystemState>;
  uptimeSeconds: number;
  lastAuditTimestamp: number;
}
