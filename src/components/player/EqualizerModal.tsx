'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import StudioEqPanel from './StudioEqPanel';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EqualizerModal({ isOpen, onClose }: EqualizerModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          key="equalizer-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl" 
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] bg-[#0B0D12] border border-white/10 rounded-[32px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden"
          >
            {/* Close Button Top Right */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#9AA1AD] hover:text-white transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Close Equalizer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Embedded Studio EQ Panel */}
            <div className="overflow-y-auto max-h-[90vh] scrollbar-none">
              <StudioEqPanel className="border-0 rounded-none bg-transparent" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
