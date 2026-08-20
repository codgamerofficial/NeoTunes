import { CanonicalArtwork } from '@/types';

interface CachedEntry {
  artwork: CanonicalArtwork;
  verifiedAt: number;
  status: 'resolved' | 'failed' | 'fallback';
}

const memoryCache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function getCachedArtworkEntry(key: string): CachedEntry | null {
  if (!key) return null;

  // 1. Check memory cache
  if (memoryCache.has(key)) {
    const entry = memoryCache.get(key)!;
    if (entry.status === 'resolved' && entry.artwork?.large && Date.now() - entry.verifiedAt < CACHE_TTL_MS) {
      return entry;
    }
  }

  // 2. Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(`nt_art_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored) as CachedEntry;
        if (parsed && parsed.status === 'resolved' && parsed.artwork?.large && Date.now() - parsed.verifiedAt < CACHE_TTL_MS) {
          memoryCache.set(key, parsed);
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return null;
}

export function cacheArtworkEntry(key: string, artwork: CanonicalArtwork, status: 'resolved' | 'failed' | 'fallback' = 'resolved'): void {
  if (!key || !artwork) return;

  const entry: CachedEntry = {
    artwork,
    verifiedAt: Date.now(),
    status,
  };

  memoryCache.set(key, entry);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`nt_art_${key}`, JSON.stringify(entry));
    } catch {
      // Ignore quota errors
    }
  }
}

export function invalidateArtwork(key: string): void {
  if (!key) return;
  memoryCache.delete(key);
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`nt_art_${key}`);
    } catch {
      // Ignore
    }
  }
}
