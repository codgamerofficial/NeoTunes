'use client';

import { useState, useEffect } from 'react';
import {
  ArtworkColorTheme,
  getFastTrackTheme,
  extractArtworkColorTheme,
} from '@/utils/artworkColorTheme';
import { Track } from '@/types';

export function useArtworkColorTheme(
  artworkUrl?: string | null,
  track?: Track | null
): {
  theme: ArtworkColorTheme;
  isExtracted: boolean;
} {
  const [theme, setTheme] = useState<ArtworkColorTheme>(() => getFastTrackTheme(track));
  const [isExtracted, setIsExtracted] = useState(false);

  useEffect(() => {
    if (!track) {
      setTheme(getFastTrackTheme(null));
      setIsExtracted(false);
      return;
    }

    // Instantly set fast theme to eliminate layout flash
    const initial = getFastTrackTheme(track);
    setTheme(initial);

    const artUrl = artworkUrl || track.artworkUrl || track.coverUrl;
    if (!artUrl || artUrl.startsWith('data:')) {
      setIsExtracted(true);
      return;
    }

    let isMounted = true;
    extractArtworkColorTheme(artUrl, track).then((extracted) => {
      if (isMounted && extracted) {
        setTheme(extracted);
        setIsExtracted(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [artworkUrl, track]);

  return { theme, isExtracted };
}
