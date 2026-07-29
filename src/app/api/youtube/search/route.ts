import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { resolveTrack } from '@/services/metadataResolver';

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('trackId');
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');
  const rawQuery = searchParams.get('q');

  if (!trackId && !rawQuery && (!title || !artist)) {
    return NextResponse.json({ error: 'Missing resolve parameters.' }, { status: 400 });
  }

  // 1. If it is a real Spotify/Deezer track ID, use the Production Metadata Resolver
  if (trackId && !trackId.startsWith('yt-') && !trackId.startsWith('pod-') && !trackId.startsWith('mood-')) {
    try {
      const resolved = await resolveTrack(trackId, title || undefined, artist || undefined);
      return NextResponse.json({
        videoId: resolved.sourceId,
        track: resolved,
        cached: false, // resolveTrack handles internal database caching
      });
    } catch (err: any) {
      console.warn(`Resolver engine failed for track ${trackId}, falling back to public search:`, err.message);
    }
  }

  // 2. Fallback check Redis cache for raw queries or local IDs
  const cacheKey = trackId 
    ? `yt_resolve:${trackId}` 
    : `yt_resolve:${encodeURIComponent(title || '')}:${encodeURIComponent(artist || '')}`;

  if (redis) {
    try {
      const cachedVideoId = await redis.get<string>(cacheKey);
      if (cachedVideoId) {
        return NextResponse.json({ videoId: cachedVideoId, cached: true });
      }
    } catch (err) {
      console.warn('Redis read error for YouTube resolver:', err);
    }
  }

  const searchQuery = rawQuery || `${title} ${artist}`;
  let videoId = '';

  // 1. YouTube Data API
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&key=${apiKey}&maxResults=1`;
      const response = await fetch(ytUrl);
      if (response.ok) {
        const data = await response.json();
        videoId = data.items?.[0]?.id?.videoId || '';
      }
    } catch (err) {
      console.warn('YouTube Data API resolution error:', err);
    }
  }

  // 2. Keyless Fallback 1: Piped API
  if (!videoId) {
    try {
      const pipedRes = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(searchQuery)}&filter=music_videos`);
      if (pipedRes.ok) {
        const pipedData = await pipedRes.json();
        const item = pipedData.items?.find((i: any) => i.type === 'stream' && i.url);
        if (item) {
          const matched = item.url.replace('/watch?v=', '');
          if (matched && matched.length === 11) videoId = matched;
        }
      }
    } catch (err) {
      console.warn('Piped API resolution error:', err);
    }
  }

  // 3. Keyless Fallback 2: Invidious API
  if (!videoId) {
    try {
      const invRes = await fetch(`https://invidious.privacydev.net/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`);
      if (invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData) && invData[0]?.videoId) {
          videoId = invData[0].videoId;
        }
      }
    } catch (err) {
      console.warn('Invidious API resolution error:', err);
    }
  }

  // 4. Keyless Fallback 3: Direct YouTube Web Scraper
  if (!videoId) {
    try {
      const ytScrapeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery + ' audio')}`;
      const res = await fetch(ytScrapeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (res.ok) {
        const html = await res.text();
        const matches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
        if (matches && matches.length > 0) {
          for (const m of matches) {
            if (m[1] && m[1].length === 11) {
              videoId = m[1];
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('YouTube Scraper resolution error:', err);
    }
  }

  if (!videoId) {
    return NextResponse.json({ error: 'No video found on YouTube.' }, { status: 404 });
  }

  // Cache resolved YouTube video ID in Redis
  if (redis) {
    try {
      await redis.set(cacheKey, videoId);
    } catch (err) {
      console.warn('Redis write error for YouTube resolver:', err);
    }
  }

  return NextResponse.json({ videoId, cached: false });
}
