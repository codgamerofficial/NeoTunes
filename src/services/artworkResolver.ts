import { Track, CanonicalArtwork, getArtistName } from '@/types';
import { calculateTrackMatchScore } from './trackMatcher';
import { validateArtworkUrl, preloadArtwork } from './artworkValidator';
import { getCachedArtworkEntry, cacheArtworkEntry, invalidateArtwork } from './artworkCache';

export class ArtworkResolver {
  public static async resolve(track: Track): Promise<CanonicalArtwork> {
    if (!track) {
      return this.getFallbackArtwork();
    }

    const key = track.canonicalId || track.id;

    // 1. Check cache first (Spec 14)
    const cached = getCachedArtworkEntry(key);
    if (cached && cached.status === 'resolved' && cached.artwork.large) {
      return cached.artwork;
    }

    // 2. Try track's existing artwork if valid (Spec 4 & 10)
    const existingUrl = track.artworkUrl || track.coverUrl || track.artwork?.large;
    if (existingUrl && (await validateArtworkUrl(existingUrl))) {
      const artwork: CanonicalArtwork = {
        small: track.artwork?.small || existingUrl,
        medium: track.artwork?.medium || existingUrl,
        large: existingUrl,
        source: (track.artworkSource as any) || 'spotify',
        verified: true,
      };
      cacheArtworkEntry(key, artwork, 'resolved');
      this.logDebug(track, existingUrl, artwork.source, 'resolved', 100);
      return artwork;
    }

    const artistName = getArtistName(track.artist);
    const title = track.title;
    const albumName = typeof track.album === 'object' ? (track.album as any)?.name : (track.album || '');

    // 3. Search Spotify / iTunes APIs for verified high-res artwork (Spec 4 & 5)
    try {
      const itunesArtwork = await this.resolveFromiTunes(title, artistName, albumName, track.durationMs);
      if (itunesArtwork && (await validateArtworkUrl(itunesArtwork.large!))) {
        cacheArtworkEntry(key, itunesArtwork, 'resolved');
        this.logDebug(track, itunesArtwork.large!, 'itunes', 'resolved', 90);
        return itunesArtwork;
      }
    } catch {
      // Continue to next resolver
    }

    // 4. Try MusicBrainz Cover Art Archive (Spec 9)
    try {
      const mbArtwork = await this.resolveFromMusicBrainz(title, artistName);
      if (mbArtwork && (await validateArtworkUrl(mbArtwork.large!))) {
        cacheArtworkEntry(key, mbArtwork, 'resolved');
        this.logDebug(track, mbArtwork.large!, 'musicbrainz', 'resolved', 80);
        return mbArtwork;
      }
    } catch {
      // Continue to fallback
    }

    // 5. Final Graceful Fallback (Spec 9 & 30)
    const fallback = this.getFallbackArtwork();
    cacheArtworkEntry(key, fallback, 'fallback');
    this.logDebug(track, '', 'fallback', 'fallback', 30);
    return fallback;
  }

  private static async resolveFromiTunes(title: string, artist: string, album: string, durationMs?: number): Promise<CanonicalArtwork | null> {
    const term = `${artist} ${title}`.trim();
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=5`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    let bestResult: any = null;
    let bestScore = -Infinity;

    for (const item of data.results) {
      const score = calculateTrackMatchScore(
        { title, artist, album, durationMs },
        {
          title: item.trackName,
          artist: item.artistName,
          album: item.collectionName,
          durationMs: item.trackTimeMillis,
        }
      );

      if (score > bestScore && score >= 40) {
        bestScore = score;
        bestResult = item;
      }
    }

    if (!bestResult || !bestResult.artworkUrl100) return null;

    // Upgrade iTunes 100x100 to 600x600 High-Res
    const largeUrl = bestResult.artworkUrl100.replace('100x100bb', '600x600bb');
    const mediumUrl = bestResult.artworkUrl100.replace('100x100bb', '300x300bb');
    const smallUrl = bestResult.artworkUrl100;

    return {
      small: smallUrl,
      medium: mediumUrl,
      large: largeUrl,
      source: 'itunes',
      verified: true,
    };
  }

  private static async resolveFromMusicBrainz(title: string, artist: string): Promise<CanonicalArtwork | null> {
    const query = `recording:"${title}" AND artist:"${artist}"`;
    const url = `https://musicbrainz.org/ws/2/recording?query=${encodeURIComponent(query)}&fmt=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NeoTunes/2.0 (contact@neotunes.app)' } });
    if (!res.ok) return null;

    const data = await res.json();
    const recording = data.recordings?.[0];
    const release = recording?.releases?.[0];
    if (!release?.id) return null;

    const coverUrl = `https://coverartarchive.org/release/${release.id}/front-500`;
    return {
      small: `https://coverartarchive.org/release/${release.id}/front-250`,
      medium: coverUrl,
      large: coverUrl,
      source: 'musicbrainz',
      verified: true,
    };
  }

  public static getFallbackArtwork(): CanonicalArtwork {
    return {
      small: null,
      medium: null,
      large: null,
      source: 'fallback',
      verified: false,
    };
  }

  private static logDebug(track: Track, url: string, source: string, status: string, confidence: number): void {
    if (process.env.NODE_NODE_ENV !== 'production' && typeof console !== 'undefined') {
      console.debug('[ArtworkResolver]', {
        trackId: track.canonicalId || track.id,
        title: track.title,
        artist: getArtistName(track.artist),
        source,
        artworkUrl: url,
        status,
        confidence,
      });
    }
  }
}
