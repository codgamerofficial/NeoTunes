'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface OverlayLayerProps {
  children: React.ReactNode;
}

/**
 * OverlayLayer renders its children into an isolated overlay portal root at document.body.
 * This guarantees that Modals, Drawers, and BottomSheets are completely outside the
 * stacking context and layout bounds of NeoSidebar, AppShell, and main content.
 */
export default function OverlayLayer({ children }: OverlayLayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const portalRoot = document.getElementById('neotunes-overlay-root') || document.body;
  return createPortal(children, portalRoot);
}
