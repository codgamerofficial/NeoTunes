export interface FeatureFlags {
  ENABLE_AI_ASSISTANT: boolean;
  ENABLE_SOCIAL: boolean;
  ENABLE_SPATIAL_AUDIO: boolean;
  ENABLE_VISUALIZER: boolean;
  ENABLE_CROSSFADE: boolean;
  ENABLE_SMART_MIXES: boolean;
  ENABLE_COLLAB_PLAYLISTS: boolean;
  ENABLE_DOWNLOADS: boolean;
  ENABLE_WEB: boolean;
  ENABLE_AUDIO_DEBUG: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  ENABLE_AI_ASSISTANT: true,
  ENABLE_SOCIAL: true,
  ENABLE_SPATIAL_AUDIO: true,
  ENABLE_VISUALIZER: true,
  ENABLE_CROSSFADE: true,
  ENABLE_SMART_MIXES: true,
  ENABLE_COLLAB_PLAYLISTS: true,
  ENABLE_DOWNLOADS: true,
  ENABLE_WEB: true,
  ENABLE_AUDIO_DEBUG: process.env.NODE_ENV !== 'production',
};

class FeatureFlagManager {
  private flags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };

  public isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag] ?? false;
  }

  public updateFlags(override: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...override };
  }

  public getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }
}

export const featureFlagManager = new FeatureFlagManager();
