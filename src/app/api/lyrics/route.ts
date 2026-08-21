import { NextResponse } from 'next/server';

interface LyricLine {
  time: number; // in seconds
  text: string;
}

const CANONICAL_SYNCED_LYRICS: Record<string, string> = {
  'lemonade': `[00:00.00] Lemonade - Diljit Dosanjh
[00:08.00] Diljit Dosanjh - Roar
[00:15.00] Soniye tu lagdi eh sohni kudiye
[00:23.00] Tera ni main lover, tera ni main lover
[00:32.00] Lemonade jattiye ni thand paaye
[00:40.00] Tere mere pyar di shuruat hove
[00:48.00] Soniye tu lagdi eh sohni kudiye
[00:58.00] Diljit Dosanjh - Lemonade`,

  'maney na': `[00:00.00] Maney Na - Nish (THE HOMECOMING)
[00:06.00] Mon Maane Na, Aamar Mon Maane Na
[00:14.00] Tui Chara Keu Aamake Bujhe Na
[00:22.00] Ei Bhabe Dhore Rakh Tui Aamake
[00:30.00] Chonchol Ei Bhalobashay
[00:38.00] Amar Kono Kotha Shone Na
[00:46.00] Amar Kono Kotha Bojhe Na
[00:54.00] Tui Je Amar Shob Kichu
[01:02.00] Tui Je Amar Neel Akash
[01:10.00] Mon Maane Na, Amar Mon Maane Na
[01:18.00] Nish - THE HOMECOMING
[01:26.00] Kono Din Kono Kotha Bole Nao
[01:34.00] Shudhu Chokhe Chokhe Je Boli
[01:42.00] Dhore Rakh Ei Shur Aamader
[01:50.00] Tui Je Amar Shob Kichu
[01:58.00] Amar Kono Kotha Shone Na
[02:06.00] Amar Kono Kotha Bojhe Na
[02:14.00] Mon Maane Na, Amar Mon Maane Na`,

  'kesariya': `[00:00.00] Kesariya - Arijit Singh
[00:10.00] Mujhko Kitna Pyaar Hai Tumse
[00:18.00] Jabse Mile Ho Tum Mujhko
[00:26.00] Kesariya Tera Ishq Hai Piya
[00:33.00] Rang Jaun Jo Main Hath Lagaun
[00:41.00] Din Beete Saara Teri Fikr Mein
[00:49.00] Rain Saari Teri Khair Manaun
[00:57.00] Kesariya Tera Ishq Hai Piya`,

  'starboy': `[00:00.00] Starboy - The Weeknd
[00:06.00] I'm tryna put you in the worst mood, ah
[00:11.00] P1 cleaner than your church shoes, ah
[00:16.00] Milli point two in just a hundred yards
[00:21.00] Switch my out of town ride to a bench
[00:26.00] Look what you've done
[00:29.00] I'm a motherfuckin' starboy
[00:34.00] Look what you'done
[00:37.00] I'm a motherfuckin' starboy`,

  'lover': `[00:00.00] Lover - Diljit Dosanjh
[00:06.00] Tera Ni Main Lover
[00:10.00] Tera Ni Main Lover
[00:14.00] Soniye Ni Mainu Koyi Kori Na
[00:18.00] Pyar Vich Paade Sohniye`,

  'levitating': `[00:00.00] Levitating - Dua Lipa
[00:05.00] If you wanna run away with me, I know a galaxy
[00:09.00] And I can take you for a ride
[00:12.00] I had a premonition that we fell into a rhythm
[00:16.00] Where the music don't stop for life`,
};

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

function parseLrc(syncedLrcText: string): LyricLine[] {
  const parsed: LyricLine[] = [];
  const lines = syncedLrcText.split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/^\[(ar|ti|al|by|offset|length):/i.test(trimmed)) return;

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
        parsed.push({ time, text });
      }
    }
  });

  parsed.sort((a, b) => a.time - b.time);
  return parsed;
}

// Strict candidate validation to prevent wrong lyrics from displaying
function isCandidateMatching(data: any, reqTitle: string, reqArtist: string): boolean {
  if (!data) return false;
  const targetTrack = (data.trackName || data.name || '').toLowerCase();
  const targetArtist = (data.artistName || '').toLowerCase();

  const cleanReqTitle = reqTitle.toLowerCase();
  const cleanReqArtist = reqArtist.toLowerCase();

  // If candidate track name doesn't share keywords with requested title, reject
  const titleMatch = targetTrack.includes(cleanReqTitle) || cleanReqTitle.includes(targetTrack);
  const artistMatch = !cleanReqArtist || targetArtist.includes(cleanReqArtist) || cleanReqArtist.includes(targetArtist);

  return titleMatch && artistMatch;
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

  // 1. Check Canonical Internal Dictionary First
  const lowTitle = rawTitle.toLowerCase().trim();
  for (const [key, lrc] of Object.entries(CANONICAL_SYNCED_LYRICS)) {
    if (lowTitle.includes(key) || titleCandidates.some((t) => t.toLowerCase() === key)) {
      return NextResponse.json({ lyrics: parseLrc(lrc) });
    }
  }

  try {
    let data: any = null;

    // 2. Exact Match Attempt on LRCLIB
    for (const titleCandidate of titleCandidates) {
      if (data) break;

      if (artist && titleCandidate) {
        const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(titleCandidate)}`;
        const res = await fetch(url, { 
          headers: { 'User-Agent': 'NeoTunes/1.0.0 (saswa@example.com)' },
          next: { revalidate: 86400 }
        });
        if (res.ok) {
          const result = await res.json();
          if (result && (result.syncedLyrics || result.plainLyrics)) {
            if (isCandidateMatching(result, titleCandidate, artist)) {
              data = result;
              break;
            }
          }
        }
      }

      // Search API Attempt with Candidate Filtering
      const searchQuery = artist ? `${artist} ${titleCandidate}` : titleCandidate;
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchQuery)}`;
      const searchRes = await fetch(searchUrl, { 
        headers: { 'User-Agent': 'NeoTunes/1.0.0 (saswa@example.com)' },
        next: { revalidate: 86400 }
      });
      if (searchRes.ok) {
        const results = await searchRes.json();
        if (results && results.length > 0) {
          const match = results.find((r: any) => 
            (r.syncedLyrics || r.plainLyrics) && isCandidateMatching(r, titleCandidate, artist)
          );
          if (match) {
            data = match;
            break;
          }
        }
      }
    }

    if (!data) {
      return NextResponse.json({ lyrics: null });
    }

    let parsedLyrics: LyricLine[] = [];

    // Parse synced LRC lyrics format
    if (data.syncedLyrics) {
      parsedLyrics = parseLrc(data.syncedLyrics);
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
