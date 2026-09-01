import { NextResponse } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';
import { NeoAIService } from '@/lib/bedrock/NeoAIService';
import { NeoExecutionContext } from '@/lib/bedrock/NeoAIToolRegistry';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt') || url.searchParams.get('q') || 'trending music';
  return handleCopilot(prompt, [], request);
}

export async function POST(request: Request) {
  let prompt = '';
  let history: any[] = [];
  let currentTrack: any = null;

  try {
    const text = await request.text();
    if (text && text.trim().length > 0) {
      const body = JSON.parse(text);
      prompt = body.prompt || body.message || '';
      history = body.history || [];
      currentTrack = body.currentTrack || null;
    }
  } catch {
    prompt = 'trending music';
  }

  return handleCopilot(prompt, history, request, currentTrack);
}

async function handleCopilot(
  prompt: string,
  history: any[],
  request: Request,
  currentTrack?: any
) {
  try {
    const cleanPrompt = prompt.trim() || 'trending music';

    let userId: string | undefined = undefined;
    let isGuest = true;

    try {
      const supabase = await createClientServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        isGuest = false;
      }
    } catch {
      isGuest = true;
    }

    const context: NeoExecutionContext = {
      userId,
      isGuest,
      clientState: {
        currentTrack: currentTrack || null,
      },
    };

    const formattedHistory = (history || []).map((h: any) => ({
      role: (h.role === 'user' || h.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: typeof h.content === 'string' ? h.content : h.text || '',
    }));

    const response = await NeoAIService.processMessage(cleanPrompt, formattedHistory, context);

    return NextResponse.json({
      intent: response.clientDirectives[0]?.type || 'RECOMMEND',
      reply: response.reply,
      tracks: response.tracks.slice(0, 4),
      tags: ['✨ Amazon Bedrock', '🎧 Verified Catalog', '⚡ Zero Hallucination'],
      suggestedPrompts: ['Play something like this', 'What am I listening to?', 'Show my queue'],
      source: 'NeoTunes Production AI Engine (Amazon Bedrock)',
      clientDirectives: response.clientDirectives,
      pendingAction: response.pendingAction || null,
    });
  } catch (error: any) {
    console.error('Error in Neo Copilot API:', error);
    return NextResponse.json({
      intent: 'RECOMMEND',
      reply: 'Neo Music Intelligence is ready. Search for songs, artists, or moods.',
      tracks: [],
      tags: ['✨ Music Assistant'],
      source: 'NeoTunes Core',
    });
  }
}
