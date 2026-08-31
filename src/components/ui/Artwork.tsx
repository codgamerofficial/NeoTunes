'use client';

import React, { useState, useEffect } from 'react';
import { Track } from '@/types';
import { validateArtworkUrl } from '@/services/artworkValidator';

export interface ArtworkProps {
  track?: Track | null;
  source?: string;
  variant?: 'hero' | 'mini' | 'card' | 'row' | 'avatar';
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'full';
  aspectRatio?: 'square' | 'circle';
  alt?: string;
  className?: string;
  canonicalId?: string;
  type?: 'track' | 'artist' | 'album' | 'playlist';
  fallback?: React.ReactNode;
}

const VARIANT_SIZE_CLASSES = {
  hero: 'w-full h-full text-lg font-black',
  mini: 'w-10 h-10 rounded-lg text-xs font-bold',
  card: 'w-full aspect-square rounded-2xl text-sm font-bold',
  row: 'w-12 h-12 rounded-xl text-xs font-bold',
  avatar: 'w-full h-full rounded-full text-xs font-bold',
};

const SIZE_CLASSES = {
  small: 'w-10 h-10 rounded-lg text-xs',
  medium: 'w-14 h-14 rounded-xl text-sm',
  large: 'w-24 h-24 rounded-2xl text-base',
  xlarge: 'w-48 h-48 sm:w-56 sm:h-56 rounded-3xl text-xl',
  full: 'w-full h-full text-base',
};

export function Artwork({
  track,
  source,
  variant,
  size = 'medium',
  aspectRatio = 'square',
  alt = 'Music Artwork',
  className = '',
  canonicalId,
  type = 'track',
  fallback,
}: ArtworkProps) {
  const targetUrl = source || track?.artworkUrl || track?.coverUrl || track?.artwork?.large || track?.artwork?.medium || '';
  const trackTitle = track?.title || alt || 'NT';

  const [validatedUrl, setValidatedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'resolved' | 'failed'>('loading');

  useEffect(() => {
    let isCancelled = false;

    if (!targetUrl) {
      setValidatedUrl(null);
      setStatus('failed');
      return;
    }

    setStatus('loading');

    validateArtworkUrl(targetUrl)
      .then((isValid) => {
        if (!isCancelled) {
          if (isValid) {
            setValidatedUrl(targetUrl);
            setStatus('resolved');
          } else {
            setValidatedUrl(null);
            setStatus('failed');
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setValidatedUrl(null);
          setStatus('failed');
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [targetUrl, canonicalId || track?.id]);

  const sizeClass = variant ? VARIANT_SIZE_CLASSES[variant] : (SIZE_CLASSES[size] || SIZE_CLASSES.medium);
  const shapeClass = (aspectRatio === 'circle' || variant === 'avatar') ? 'rounded-full' : '';

  const initials = trackTitle
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const renderFallback = () => {
    if (fallback) return fallback;

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#11141A] via-[#171A21] to-[#0B0D12] p-2 overflow-hidden select-none">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(223,255,0,0.3)_0%,rgba(0,229,255,0.15)_60%,transparent_100%)] pointer-events-none" />
        <span className="relative z-10 font-bold tracking-wider text-white/80 text-xs sm:text-sm">
          {initials || 'NT'}
        </span>
        <span className="relative z-10 text-[8px] font-bold uppercase text-[#DFFF00] tracking-widest pt-0.5 opacity-80">
          NEOTUNES
        </span>
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#11141A] border border-white/10 shrink-0 flex items-center justify-center ${sizeClass} ${shapeClass} ${className}`}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
      )}

      {status === 'resolved' && validatedUrl ? (
        <img
          src={validatedUrl}
          alt={trackTitle}
          className={`w-full h-full object-cover transition-opacity duration-300 ${shapeClass}`}
          loading="lazy"
          onError={() => setStatus('failed')}
        />
      ) : null}

      {status === 'failed' && (
        <div className="w-full h-full flex items-center justify-center">
          {renderFallback()}
        </div>
      )}
    </div>
  );
}

export default Artwork;
