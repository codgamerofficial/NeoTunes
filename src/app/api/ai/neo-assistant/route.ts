import { NextResponse } from 'next/server';
import { NeoAIService } from '@/lib/bedrock/NeoAIService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const aiRes = await NeoAIService.processMessage(prompt, [], {});

    return NextResponse.json({
      title: 'Neo AI Station',
      description: `Neo AI generated for: "${prompt}"`,
      tracks: aiRes.tracks,
      reply: aiRes.reply,
      provider: 'Amazon Bedrock Runtime',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
