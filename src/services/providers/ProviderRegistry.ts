'use client';

import { IMusicProvider, ProviderMetadata, ProviderHealthStatus } from '@/types/provider';

export class ProviderRegistry {
  private static providers: Map<string, IMusicProvider> = new Map();
  private static healthMap: Map<string, ProviderHealthStatus> = new Map();

  public static registerProvider(provider: IMusicProvider): void {
    ProviderRegistry.providers.set(provider.metadata.id, provider);
    ProviderRegistry.healthMap.set(provider.metadata.id, provider.metadata.status);
  }

  public static getProvider(id: string): IMusicProvider | undefined {
    return ProviderRegistry.providers.get(id);
  }

  public static getAllProviders(): IMusicProvider[] {
    return Array.from(ProviderRegistry.providers.values());
  }

  public static updateHealth(id: string, status: ProviderHealthStatus): void {
    ProviderRegistry.healthMap.set(id, status);
    const provider = ProviderRegistry.providers.get(id);
    if (provider) {
      provider.metadata.status = status;
    }
  }

  public static getHealth(id: string): ProviderHealthStatus {
    return ProviderRegistry.healthMap.get(id) || 'UNAVAILABLE';
  }
}
