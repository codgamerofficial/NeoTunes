'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeoTuneLogo from '@/components/navigation/NeoTuneLogo';

interface SplashScreenProps {
  onComplete?: () => void;
  durationMs?: number;
}

export default function NeoTuneSplashScreen({ onComplete, durationMs = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0D14] text-white overflow-hidden select-none"
        >
          {/* Ambient Lighting Background Spheres */}
          <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-[#18D8FF]/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 h-96 w-96 rounded-full bg-[#FF4FD8]/20 blur-[120px] animate-pulse delay-500" />

          {/* Marketing Hero 3D Logo */}
          <div className="relative z-10 space-y-8 text-center">
            <NeoTuneLogo variant="marketing" size="xl" showTagline animated />

            {/* Equalizer Frequency Pulse Loader */}
            <div className="flex items-center justify-center gap-1.5 pt-6">
              {[18, 32, 44, 28, 48, 22, 36, 16].map((h, idx) => (
                <motion.div
                  key={idx}
                  animate={{ height: [`${h * 0.4}px`, `${h}px`, `${h * 0.4}px`] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: idx * 0.1, ease: 'easeInOut' }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-[#18D8FF] via-[#8B5CF6] to-[#FF4FD8]"
                />
              ))}
            </div>

            {/* High-Fidelity Audio Status */}
            <p className="text-xs font-mono text-[#B3B3B3] uppercase tracking-widest">
              FLAC 24-BIT / 96KHZ LOSSLESS AUDIO ENGINE
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
