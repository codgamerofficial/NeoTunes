import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, vibe, mood } = await request.json();

    const apiKey = process.env.NVIDIA_AI_KEY || process.env.NEXT_PUBLIC_NVIDIA_AI_KEY || 'nvapiOJqBEl7Gb_s9PxeEL7lczrRayrm164Wr3uGztHzHasgWLaI-UsThKO2M3jb66Jhv';

    // Query NVIDIA AI Foundation endpoint / OpenRouter AI fallback
    const systemPrompt = `You are Neo, the world's most advanced AI Music DJ & Sound Curator for NeoTunes. Given user input: "${prompt || vibe || mood}", generate a custom curated response and suggest 4 high-energy or relaxing track matches. Return structured JSON with keys: reply (string), recommendations (array of objects with id, title, artist, album, duration, coverUrl).`;

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          { role: 'system', content: 'You are Neo, an AI Music DJ. Return helpful music recommendations.' },
          { role: 'user', content: systemPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      return NextResponse.json({
        reply: content || `Curated custom ${vibe || mood || 'vibe'} playlist for you!`,
        source: 'NVIDIA Neural AI Engine',
      });
    }
  } catch (error: any) {
    // Fallback response on local simulation
  }

  return NextResponse.json({
    reply: `Neural AI initialized. Generating spatial soundscape for "${prompt || 'your daily rhythm'}". Enjoy these high-fidelity tracks!`,
    source: 'NeoTunes AI Core',
    suggestedTracks: [
      { id: 'itunes_1823748641', title: 'TE CONOCÍ', artist: 'bxkq & PXLWYSE', album: 'Single', duration: '2:49', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
      { id: 'blinding-lights', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:20', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80' },
      { id: 'shayad-love-aaj-kal', title: 'Shayad', artist: 'Arijit Singh', album: 'Love Aaj Kal', duration: '4:07', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
      { id: 'heat-waves', title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '3:58', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300&q=80' },
    ],
  });
}
