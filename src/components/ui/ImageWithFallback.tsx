'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';
import { Music } from 'lucide-react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80';

export default function ImageWithFallback({
  src,
  fallbackSrc = DEFAULT_COVER,
  alt,
  className = '',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    typeof src === 'string' && src ? src : DEFAULT_COVER
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof src === 'string' && src) {
      setImgSrc(src);
      setHasError(false);
    } else {
      setImgSrc(DEFAULT_COVER);
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#181818] ${className}`}>
      {!hasError ? (
        <Image
          {...props}
          src={imgSrc}
          alt={alt || 'Album Cover'}
          onError={() => {
            if (imgSrc !== DEFAULT_COVER) {
              setImgSrc(DEFAULT_COVER);
            } else {
              setHasError(true);
            }
          }}
          className={`object-cover ${className}`}
        />
      ) : (
        <div className="w-full h-full bg-[#181818] flex items-center justify-center text-[#B3B3B3]">
          <Music className="h-6 w-6 text-[#29B6F6]" />
        </div>
      )}
    </div>
  );
}
