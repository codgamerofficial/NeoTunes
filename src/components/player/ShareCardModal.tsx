'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { Track, getArtistName, getCoverUrl } from '@/types';
import NeoTuneLogo from '../navigation/NeoTuneLogo';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export default function ShareCardModal({
  isOpen,
  onClose,
  track,
}: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !track) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/player` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#07090E] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6 select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#00D9FF]" />
            <h3 className="text-base font-black text-white">Share Track</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Share Card Artwork Preview */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0E1017] to-[#07090E] border border-white/10 flex flex-col items-center text-center space-y-4 shadow-xl relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-25 pointer-events-none"
            style={{ backgroundImage: `url(${getCoverUrl(track)})` }}
          />

          <div className="relative z-10 h-40 w-40 rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img
              src={getCoverUrl(track)}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 space-y-1">
            <h4 className="text-lg font-black text-white truncate max-w-[280px]">
              {track.title}
            </h4>
            <p className="text-xs font-bold text-[#00D9FF] truncate max-w-[280px]">
              {getArtistName(track.artist)}
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <NeoTuneLogo size="sm" showText />
          </div>
        </div>

        {/* Action Copy Button */}
        <button
          onClick={handleCopy}
          className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]'
              : 'bg-[#00D9FF] text-black hover:scale-[1.02] shadow-[0_0_15px_rgba(0,217,255,0.4)]'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Link Copied to Clipboard!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copy Track Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
