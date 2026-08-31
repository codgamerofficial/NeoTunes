'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import QueueDrawer from '@/components/player/QueueDrawer';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function StandaloneQueuePage() {
  const router = useRouter();

  return (
    <FeatureErrorBoundary featureName="Queue">
      <div className="p-4 sm:p-6 md:p-8 max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col font-sans select-none">
        <QueueDrawer isOpen={true} onClose={() => router.back()} inline={true} />
      </div>
    </FeatureErrorBoundary>
  );
}
