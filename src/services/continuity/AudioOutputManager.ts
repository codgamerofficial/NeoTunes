'use client';

import { AudioOutputRoute } from '@/types/continuity';

const MOCK_OUTPUT_ROUTES: AudioOutputRoute[] = [
  {
    id: 'route_speaker',
    name: 'Built-in Device Speaker',
    type: 'SPEAKER',
    isSpatialSupported: false,
    isConnected: true,
  },
  {
    id: 'route_bluetooth',
    name: 'NeoBuds Pro (Bluetooth)',
    type: 'BLUETOOTH',
    isSpatialSupported: true,
    isConnected: false,
  },
  {
    id: 'route_soundbar',
    name: 'Living Room Soundbar (Dolby Atmos)',
    type: 'SOUNDBAR',
    isSpatialSupported: true,
    isConnected: false,
  },
];

export class AudioOutputManager {
  private static activeRoute: AudioOutputRoute = MOCK_OUTPUT_ROUTES[0];

  public static getAvailableRoutes(): AudioOutputRoute[] {
    return MOCK_OUTPUT_ROUTES;
  }

  public static getActiveRoute(): AudioOutputRoute {
    return AudioOutputManager.activeRoute;
  }

  public static switchRoute(routeId: string): AudioOutputRoute {
    const found = MOCK_OUTPUT_ROUTES.find((r) => r.id === routeId);
    if (found) {
      AudioOutputManager.activeRoute = { ...found, isConnected: true };
    }
    return AudioOutputManager.activeRoute;
  }
}
