import { ProviderName, PlaybackResolution } from './providers/types';
import { Track } from '@/types';

export class PlaybackResolver {
  /**
   * Resolves a track ID to a playable source.
   * Priority:
   * 1. Licensed NeoTunes direct audio stream (if available in local DB or cloud storage)
   * 2. Direct stream URL provided on track object
   * 3. YouTube official iframe embed playback (legal fallback)
   */
  static async resolvePlayback(
    track: Track,
    preferredProvider?: ProviderName
  ): Promise<PlaybackResolution> {
    const trackId = track.id;

    // 1. Direct stream URL attached to track
    if (track.streamUrl) {
      return {
        trackId,
        provider: 'neotunes_licensed',
        sourceId: track.sourceId || trackId,
        streamUrl: track.streamUrl,
        sourceType: 'stream',
        quality: track.audioQuality || 'AAC 256',
        isLicensed: true,
      };
    }

    // 2. Local/Cloud Audio source type
    if (track.sourceType === 'cloud' && track.sourceId) {
      return {
        trackId,
        provider: 'neotunes_licensed',
        sourceId: track.sourceId,
        streamUrl: track.sourceId.startsWith('http') ? track.sourceId : undefined,
        sourceType: 'stream',
        quality: 'AAC 256',
        isLicensed: true,
      };
    }

    // 3. YouTube Embed Fallback (Official IFrame Embed API)
    const ytVideoId = track.sourceId?.replace(/^yt_/, '') || trackId;
    return {
      trackId,
      provider: 'youtube',
      sourceId: ytVideoId,
      embedUrl: `https://www.youtube.com/embed/${ytVideoId}?enablejsapi=1&autoplay=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`,
      sourceType: 'embed',
      quality: 'High 256kbps',
      isLicensed: false,
    };
  }
}
