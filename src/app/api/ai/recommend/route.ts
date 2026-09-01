import { NextResponse } from 'next/server';
import { NeoAIService } from '@/lib/bedrock/NeoAIService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  return handleRecommend(request);
}

export async function POST(request: Request) {
  return handleRecommend(request);
}

async function handleRecommend(request: Request) {
  let prompt: string | undefined;
  let vibe: string | undefined;
  let mood: string | undefined;

  try {
    const url = new URL(request.url);
    prompt = url.searchParams.get('prompt') || undefined;
    vibe = url.searchParams.get('vibe') || undefined;
    mood = url.searchParams.get('mood') || undefined;

    if (request.method === 'POST') {
      try {
        const text = await request.text();
        if (text && text.trim().length > 0) {
          const body = JSON.parse(text);
          prompt = body?.prompt || prompt;
          vibe = body?.vibe || vibe;
          mood = body?.mood || mood;
        }
      } catch {}
    }

    const query = prompt || vibe || mood || 'trending verified music';
    const response = await NeoAIService.processMessage(`Recommend tracks for: ${query}`, [], {});

    return NextResponse.json({
      reply: response.reply,
      source: 'NeoTunes Music Intelligence (Amazon Bedrock)',
      suggestedTracks: response.tracks,
      tracks: response.tracks,
    });
  } catch (error: any) {
    console.error('Error in recommend API:', error);
    return NextResponse.json({
      reply: 'NeoTunes recommendation engine is ready.',
      source: 'NeoTunes Core',
      suggestedTracks: [],
      tracks: [],
    });
  }
}
