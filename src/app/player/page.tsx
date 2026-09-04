'use client';

import React, { Suspense } from 'react';
import ImmersivePlayer from '@/components/player/immersive/ImmersivePlayer';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function PlayerPage() {
  return (
    <FeatureErrorBoundary featureName="Now Playing">
      <Suspense
        fallback={
          <div className="w-full h-[100dvh] flex items-center justify-center bg-[#050608] text-white/50 text-xs font-semibold animate-pulse">
            Loading Immersive Player...
          </div>
        }
      >
        <ImmersivePlayer />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
