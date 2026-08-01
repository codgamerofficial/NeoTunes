import { NextResponse } from 'next/server';

interface LyricLine {
  time: number; // in seconds
  text: string;
}

function getTrackTitleCandidates(title: string): string[] {
  if (!title) return [];
  const candidates: string[] = [];

  const basicClean = title
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/official/gi, '')
    .replace(/video/gi, '')
    .replace(/audio/gi, '')
    .replace(/lyric/gi, '')
    .replace(/full song/gi, '')
    .trim();

  if (basicClean) candidates.push(basicClean);

  // Split by '|', '-', '/' to extract all segment variations (e.g. English vs Bengali titles)
  const parts = title.split(/[|\-\/]/).map(p => p.trim()).filter(Boolean);
  for (const p of parts) {
    const partClean = p
      .replace(/\(.*?\)/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/official/gi, '')
      .replace(/video/gi, '')
      .replace(/audio/gi, '')
      .replace(/lyric/gi, '')
      .replace(/full song/gi, '')
      .trim();

    if (partClean && !candidates.includes(partClean)) {
      candidates.push(partClean);
    }
  }

  return candidates;
}

function cleanArtistName(artist: string): string {
  if (!artist) return '';
  return artist
    .split(',')[0]
    .split('&')[0]
    .split('feat.')[0]
    .split('ft.')[0]
    .split('-')[0]
    .split('Topic')[0]
    .replace(/official/gi, '')
    .replace(/vevo/gi, '')
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawTitle = searchParams.get('title') || '';
  const rawArtist = searchParams.get('artist') || '';
  const durationMs = parseInt(searchParams.get('durationMs') || '0', 10);

  if (!rawTitle) {
    return NextResponse.json({ error: 'Missing title.' }, { status: 400 });
  }

  const titleCandidates = getTrackTitleCandidates(rawTitle);
  const artist = cleanArtistName(rawArtist);

  try {
    let data: any = null;

    // 1. Loop through candidate titles for LRCLIB search
    for (const titleCandidate of titleCandidates) {
      if (data) break;

      // Exact Match Attempt
      if (artist && titleCandidate) {
        const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(titleCandidate)}`;
        const res = await fetch(url, { 
          headers: { 'User-Agent': 'NeoTunes/1.0.0 (saswa@example.com)' },
          next: { revalidate: 86400 }
        });
        if (res.ok) {
          data = await res.json();
          if (data && (data.syncedLyrics || data.plainLyrics)) break;
        }
      }

      // Search API Attempt
      const searchQuery = artist ? `${artist} ${titleCandidate}` : titleCandidate;
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`;
      const searchRes = await fetch(searchUrl, { 
        headers: { 'User-Agent': 'NeoTunes/1.0.0 (saswa@example.com)' },
        next: { revalidate: 86400 }
      });
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (results && results.length > 0) {
          data = results.find((r: any) => r.syncedLyrics) || results.find((r: any) => r.plainLyrics) || results[0];
          if (data && (data.syncedLyrics || data.plainLyrics)) break;
        }
      }
    }

    if (!data) {
      return NextResponse.json({ lyrics: null });
    }

    let parsedLyrics: LyricLine[] = [];

    // Parse synced LRC lyrics format
    if (data.syncedLyrics) {
      const lines = data.syncedLyrics.split('\n');
      lines.forEach((line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        // Skip metadata header tags
        if (/^\[(ar|ti|al|by|offset|length):/i.test(trimmed)) return;

        // Extract timestamp tags
        const tagRegex = /\[(\d+):(\d+)(?:[:\.](\d+))?\]/g;
        let text = trimmed.replace(tagRegex, '').trim();
        let match;

        while ((match = tagRegex.exec(trimmed)) !== null) {
          const min = parseInt(match[1], 10);
          const sec = parseInt(match[2], 10);
          const msStr = match[3] || '0';
          let ms = 0;
          if (msStr.length === 3) {
            ms = parseInt(msStr, 10) / 1000;
          } else {
            ms = parseFloat(`0.${msStr}`);
          }
          const time = min * 60 + sec + ms;
          if (text) {
            parsedLyrics.push({ time, text });
          }
        }
      });
    } else if (data.plainLyrics) {
      const lines = data.plainLyrics.split('\n').map((l: string) => l.trim()).filter(Boolean);
      const totalDurationSec = durationMs > 0 ? durationMs / 1000 : 180;
      const step = lines.length > 0 ? totalDurationSec / lines.length : 5;
      
      lines.forEach((line: string, index: number) => {
        parsedLyrics.push({
          time: Math.floor(index * step * 10) / 10,
          text: line,
        });
      });
    }

    parsedLyrics.sort((a, b) => a.time - b.time);

    if (parsedLyrics.length === 0) {
      if (data.instrumental) {
        parsedLyrics = [{ time: 0, text: '🎵 [Instrumental] 🎵' }];
      } else {
        return NextResponse.json({ lyrics: null });
      }
    }

    return NextResponse.json({ lyrics: parsedLyrics });
  } catch (error: any) {
    console.error('Lyrics API Error:', error);
    return NextResponse.json({ lyrics: null });
  }
}
