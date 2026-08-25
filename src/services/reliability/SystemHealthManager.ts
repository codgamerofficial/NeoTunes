'use client';

import { SubsystemName, SubsystemState, SystemHealthReport } from '@/types/reliability';
import { usePlaybackStore } from '@/store/playback-store';

const START_TIME = Date.now();

export class SystemHealthManager {
  private static subsystemStates: Map<SubsystemName, SubsystemState> = new Map([
    ['PLAYER', 'HEALTHY'],
    ['NETWORK', 'HEALTHY'],
    ['DATABASE', 'HEALTHY'],
    ['SYNC', 'HEALTHY'],
    ['AUTH', 'HEALTHY'],
    ['DOWNLOADS', 'HEALTHY'],
    ['RECOMMENDATIONS', 'HEALTHY'],
    ['AI', 'HEALTHY'],
    ['SOCIAL', 'HEALTHY'],
    ['REALTIME', 'HEALTHY'],
    ['AUDIO', 'HEALTHY'],
    ['CACHE', 'HEALTHY'],
    ['STORAGE', 'HEALTHY'],
  ]);

  public static setStatus(subsystem: SubsystemName, state: SubsystemState): void {
    SystemHealthManager.subsystemStates.set(subsystem, state);
  }

  public static getStatus(subsystem: SubsystemName): SubsystemState {
    return SystemHealthManager.subsystemStates.get(subsystem) || 'HEALTHY';
  }

  /**
   * Generates a complete system health report (Section 3 & 94)
   */
  public static getHealthReport(): SystemHealthReport {
    const store = usePlaybackStore.getState();
    if (!store) {
      SystemHealthManager.setStatus('PLAYER', 'DEGRADED');
    } else {
      SystemHealthManager.setStatus('PLAYER', 'HEALTHY');
    }

    const subsystemsObj: any = {};
    let hasError = false;
    let hasDegraded = false;

    SystemHealthManager.subsystemStates.forEach((state, key) => {
      subsystemsObj[key] = state;
      if (state === 'ERROR' || state === 'OFFLINE') hasError = true;
      if (state === 'DEGRADED') hasDegraded = true;
    });

    let overallStatus: SubsystemState = 'HEALTHY';
    if (hasError) overallStatus = 'ERROR';
    else if (hasDegraded) overallStatus = 'DEGRADED';

    return {
      overallStatus,
      subsystems: subsystemsObj,
      uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
      lastAuditTimestamp: Date.now(),
    };
  }
}
