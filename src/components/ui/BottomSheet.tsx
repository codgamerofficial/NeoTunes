'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  headerRight,
  children,
  maxHeight = 'max-h-[88vh]',
  className = '',
}: BottomSheetProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end select-none font-sans">
          {/* Dimmed Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal Body */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.8 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className={`relative z-10 w-full bg-[#0F0F12]/98 backdrop-blur-2xl rounded-t-[30px] border-t border-white/12 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col ${maxHeight} ${className}`}
          >
            {/* Top Drag Handle Indicator */}
            <div className="w-full pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.2 rounded-full bg-white/25 hover:bg-white/40 transition-colors" />
            </div>

            {/* Optional Sheet Header */}
            {(title || headerRight) && (
              <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex-1 min-w-0 pr-3">
                  {typeof title === 'string' ? (
                    <h2 className="text-base font-extrabold text-white truncate tracking-tight">{title}</h2>
                  ) : (
                    title
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {headerRight}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                    aria-label="Close bottom sheet"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto scrollbar-none pb-safe">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
