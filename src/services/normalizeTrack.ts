import { Track, CanonicalArtwork, getArtistName } from '@/types';

export function normalizeArtwork(raw: any, defaultSource: CanonicalArtwork['source'] = 'fallback'): CanonicalArtwork {
  if (!raw) {
    return {
      small: null,
      medium: null,
      large: null,
      source: 'fallback',
      verified: false,
    };
  }

  if (typeof raw === 'string' && raw.trim()) {
    const url = raw.trim();
    return {
      small: url,
      medium: url,
      large: url,
      source: defaultSource,
      verified: true,
    };
  }

  const small = raw.small || raw.thumbnail || raw.coverUrl || raw.artworkUrl || raw.url || null;
  const medium = raw.medium || raw.artworkUrl || raw.coverUrl || raw.url || small || null;
  const large = raw.large || raw.artworkLarge || raw.coverUrl || raw.artworkUrl || raw.url || medium || null;
  const source = raw.source || defaultSource;
  const verified = Boolean(raw.verified || (large && !large.includes('placeholder')));

  return {
    small,
    medium,
    large,
    source: source as CanonicalArtwork['source'],
    verified,
  };
}

export function normalizeTrack(raw: any): Track {
  if (!raw) {
    throw new Error('Cannot normalize null or undefined track');
  }

  const source = (raw.source || 'spotify') as Track['source'];
  const sourceId = String(raw.sourceId || raw.id || `track_${Math.random().toString(36).slice(2)}`);
  const canonicalId = raw.canonicalId || `${source}:track:${sourceId.replace(/^.*:/, '')}`;

  const title = String(raw.title || raw.name || 'Unknown Track').trim();
  const artistStr = getArtistName(raw.artists || raw.artist);
  const artistsList: string[] = Array.isArray(raw.artists)
    ? raw.artists.map((a: any) => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean)
    : [artistStr];

  const albumName = typeof raw.album === 'object' && raw.album
    ? (raw.album.name || raw.album.title || 'Single')
    : (typeof raw.album === 'string' && raw.album ? raw.album : 'Single');

  const durMs = Number(raw.durationMs) || (Number(raw.duration) ? Number(raw.duration) * 1000 : 180000);
  const durationSec = Math.floor(durMs / 1000);

  const rawArtworkUrl = raw.artworkUrl || raw.coverUrl || raw.artwork?.large || raw.artwork?.medium || raw.cover || '';
  const canonicalArtwork = normalizeArtwork(raw.artwork || rawArtworkUrl, source === 'youtube' ? 'youtube' : 'spotify');

  const artworkUrl = canonicalArtwork.large || canonicalArtwork.medium || canonicalArtwork.small || '';

  return {
    id: canonicalId,
    canonicalId,
    source,
    sourceId,
    title,
    artist: artistStr,
    artists: artistsList,
    album: albumName,
    albumId: raw.albumId || (typeof raw.album === 'object' ? raw.album?.id : undefined),
    duration: durationSec,
    durationMs: durMs,
    artwork: canonicalArtwork,
    artworkUrl,
    coverUrl: artworkUrl,
    artworkSmall: canonicalArtwork.small || artworkUrl,
    artworkMedium: canonicalArtwork.medium || artworkUrl,
    artworkLarge: canonicalArtwork.large || artworkUrl,
    releaseDate: raw.releaseDate || null,
    explicit: Boolean(raw.explicit),
    playable: raw.playable !== undefined ? Boolean(raw.playable) : true,
    externalUrl: raw.externalUrl || null,
    youtubeVideoId: raw.youtubeVideoId || (source === 'youtube' ? sourceId : undefined),
    spotifyTrackId: raw.spotifyTrackId || (source === 'spotify' ? sourceId : undefined),
    isrc: raw.isrc || undefined,
    artworkSource: canonicalArtwork.source,
    artworkStatus: canonicalArtwork.verified ? 'resolved' : 'loading',
    metadataSource: raw.metadataSource || source,
    metadataConfidence: Number(raw.metadataConfidence) || 90,
  };
}
