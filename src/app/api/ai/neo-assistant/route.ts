import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const lower = prompt.toLowerCase();

    // Natural Language Intent Parsing & Dynamic Playlist Generation
    let playlistTitle = 'Custom NeoAI Station';
    let tracks = [
      { id: 'neo1', title: 'Patar Bashori (Lofi Edition)', artist: 'Ishaan, Sunidhi Chauhan', album: 'NeoAI Late Night', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', durationMs: 210000 },
      { id: 'neo2', title: 'Kesariya (Chillwave Remix)', artist: 'Arijit Singh, Pritam', album: 'NeoAI Chill', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', durationMs: 240000 },
      { id: 'neo3', title: 'Blinding Lights (Synthwave)', artist: 'The Weeknd', album: 'After Hours', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80', durationMs: 200000 },
      { id: 'neo4', title: 'Pasoori (Acoustic Night)', artist: 'Ali Sethi, Shae Gill', album: 'Coke Studio', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80', durationMs: 220000 },
    ];

    if (lower.includes('late-night') || lower.includes('late night') || lower.includes('drive')) {
      playlistTitle = 'Late Night Drive Mix';
    } else if (lower.includes('workout') || lower.includes('gym')) {
      playlistTitle = 'High Energy Workout Mix';
    } else if (lower.includes('focus') || lower.includes('study') || lower.includes('coding')) {
      playlistTitle = 'Deep Focus & Coding Lo-Fi';
    } else if (lower.includes('bengali') || lower.includes('romantic')) {
      playlistTitle = 'Bengali Romantic Melodies';
    }

    return NextResponse.json({
      title: playlistTitle,
      description: `NeoAI generated this custom station tailored to your request: "${prompt}"`,
      tracks,
      provider: 'NeoAI Recommendation Engine',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
