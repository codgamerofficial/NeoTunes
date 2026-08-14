'use client';

import React, { useState, useEffect } from 'react';
import { Music, Disc, User, ListMusic } from 'lucide-react';
import { getCachedArtwork, cacheArtwork } from '@/utils/artwork';

export interface ArtworkProps {
  source?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'full';
  aspectRatio?: 'square' | 'circle';
  alt?: string;
  className?: string;
  canonicalId?: string;
  type?: 'track' | 'artist' | 'album' | 'playlist';
  fallback?: React.ReactNode;
}

const SIZE_CLASSES = {
  small: 'w-10 h-10 rounded-lg text-xs',
  medium: 'w-14 h-14 rounded-xl text-sm',
  large: 'w-24 h-24 rounded-2xl text-base',
  xlarge: 'w-48 h-48 sm:w-56 sm:h-56 rounded-3xl text-xl',
  full: 'w-full h-full text-base',
};

export function Artwork({
  source,
  size = 'medium',
  aspectRatio = 'square',
  alt = 'Music Artwork',
  className = '',
  canonicalId,
  type = 'track',
  fallback,
}: ArtworkProps) {
  const cacheKey = canonicalId || source || '';
  const cachedUrl = cacheKey ? getCachedArtwork(cacheKey) : undefined;
  const initialSrc = source || cachedUrl || '';

  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [isLoaded, setIsLoaded] = useState<boolean>(Boolean(initialSrc));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    const url = source || (cacheKey ? getCachedArtwork(cacheKey) : '');
    if (url) {
      setImgSrc(url);
      setHasError(false);
      if (cacheKey) cacheArtwork(cacheKey, url);
    } else {
      setImgSrc('');
      setHasError(true);
    }
  }, [source, cacheKey]);

  const shapeClass = aspectRatio === 'circle' ? 'rounded-full' : '';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.medium;

  const defaultIcon = () => {
    switch (type) {
      case 'artist':
        return <User className="w-1/2 h-1/2 text-white/30" />;
      case 'album':
        return <Disc className="w-1/2 h-1/2 text-white/30" />;
      case 'playlist':
        return <ListMusic className="w-1/2 h-1/2 text-white/30" />;
      default:
        return <Music className="w-1/2 h-1/2 text-[#00D9FF]/40" />;
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#121620] border border-white/10 shrink-0 flex items-center justify-center ${sizeClass} ${shapeClass} ${className}`}
    >
      {/* Background skeleton glow */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
      )}

      {imgSrc && !hasError ? (
        <img
          src={imgSrc}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${shapeClass}`}
          loading="lazy"
        />
      ) : null}

      {/* Render fallback ONLY if missing or errored */}
      {(hasError || !imgSrc) && (
        <div className="w-full h-full flex items-center justify-center bg-[#0d1017]">
          {fallback || defaultIcon()}
        </div>
      )}
    </div>
  );
}

export default Artwork;
