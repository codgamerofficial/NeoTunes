'use client';

import { usePlaybackStore } from '@/store/playback-store';
import { featureFlagManager } from '@/config/featureFlags';
import { TasteProfileManager } from './TasteProfileManager';

export interface HealthComponentStatus {
  name: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details?: string;
}

export interface SystemHealthReport {
  overall: 'PASS' | 'WARN' | 'FAIL';
  timestamp: string;
  components: HealthComponentStatus[];
}

export class HealthCheck {
  public static runDiagnostics(): SystemHealthReport {
    const components: HealthComponentStatus[] = [];
    const store = usePlaybackStore.getState();

    // 1. Audio Engine & Player Store
    components.push({
      name: 'AudioEngine & PlaybackStore',
      status: store ? 'PASS' : 'FAIL',
      details: store ? `Status: ${store.playbackStatus}, Track: ${store.currentTrack?.title || 'None'}` : 'Store unavailable',
    });

    // 2. Feature Flags System
    const flags = featureFlagManager.getAllFlags();
    components.push({
      name: 'FeatureFlags System',
      status: flags ? 'PASS' : 'FAIL',
      details: `${Object.keys(flags).length} flags configured`,
    });

    // 3. Recommendation & Taste Engine
    try {
      const settings = TasteProfileManager.getSettings();
      components.push({
        name: 'RecommendationEngine',
        status: settings.personalizedRecommendationsEnabled ? 'PASS' : 'WARN',
        details: settings.personalizedRecommendationsEnabled ? 'Active' : 'Personalization disabled in settings',
      });
    } catch {
      components.push({
        name: 'RecommendationEngine',
        status: 'FAIL',
        details: 'Failed to access recommendation settings',
      });
    }

    // 4. Network & Local Storage
    const hasLocalStorage = typeof window !== 'undefined' && !!window.localStorage;
    components.push({
      name: 'LocalStorage & Cache',
      status: hasLocalStorage ? 'PASS' : 'FAIL',
      details: hasLocalStorage ? 'LocalStorage available' : 'Browser storage inaccessible',
    });

    const overall = components.some((c) => c.status === 'FAIL')
      ? 'FAIL'
      : components.some((c) => c.status === 'WARN')
      ? 'WARN'
      : 'PASS';

    return {
      overall,
      timestamp: new Date().toISOString(),
      components,
    };
  }
}
