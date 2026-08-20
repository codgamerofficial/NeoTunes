'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type SpiderSuitMode = 'integrated' | 'sanctum' | 'blackgold';

interface SpiderVerseContextType {
  suitMode: SpiderSuitMode;
  setSuitMode: (mode: SpiderSuitMode) => void;
  suitMeta: {
    name: string;
    subtitle: string;
    primaryColor: string;
    secondaryColor: string;
    badgeIcon: string;
  };
}

const SUIT_METADATA: Record<SpiderSuitMode, SpiderVerseContextType['suitMeta']> = {
  integrated: {
    name: 'Integrated Suit',
    subtitle: 'Peter-1 Red & Web Cyan',
    primaryColor: '#E60026',
    secondaryColor: '#0055FF',
    badgeIcon: '🕸️',
  },
  sanctum: {
    name: 'Sanctum Supreme',
    subtitle: 'Doctor Strange Magic Runes',
    primaryColor: '#FF9D00',
    secondaryColor: '#00E5FF',
    badgeIcon: '✨',
  },
  blackgold: {
    name: 'Black & Gold Tech',
    subtitle: 'Nano-Circuit Obsidian',
    primaryColor: '#FFD700',
    secondaryColor: '#00D4FF',
    badgeIcon: '⚡',
  },
};

const SpiderVerseContext = createContext<SpiderVerseContextType>({
  suitMode: 'integrated',
  setSuitMode: () => {},
  suitMeta: SUIT_METADATA.integrated,
});

export const SpiderVerseProvider = ({ children }: { children: React.ReactNode }) => {
  const [suitMode, setSuitModeState] = useState<SpiderSuitMode>('integrated');

  useEffect(() => {
    const savedSuit = localStorage.getItem('spider_suit_mode') as SpiderSuitMode;
    if (savedSuit && SUIT_METADATA[savedSuit]) {
      setSuitModeState(savedSuit);
      document.documentElement.setAttribute('data-spider-suit', savedSuit);
    } else {
      document.documentElement.setAttribute('data-spider-suit', 'integrated');
    }
  }, []);

  const setSuitMode = (mode: SpiderSuitMode) => {
    setSuitModeState(mode);
    localStorage.setItem('spider_suit_mode', mode);
    document.documentElement.setAttribute('data-spider-suit', mode);
  };

  return (
    <SpiderVerseContext.Provider
      value={{
        suitMode,
        setSuitMode,
        suitMeta: SUIT_METADATA[suitMode],
      }}
    >
      {children}
    </SpiderVerseContext.Provider>
  );
};

export const useSpiderVerse = () => useContext(SpiderVerseContext);
