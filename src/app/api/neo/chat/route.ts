import { NextResponse } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';
import { NeoAIService } from '@/lib/bedrock/NeoAIService';
import { NeoExecutionContext } from '@/lib/bedrock/NeoAIToolRegistry';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { prompt, history, clientState, confirmedActionId } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // Authenticate user session safely server-side
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
      clientState: clientState || {},
      confirmedActionId,
    };

    const response = await NeoAIService.processMessage(prompt, history || [], context);

    return NextResponse.json({
      success: true,
      reply: response.reply,
      executedTools: response.executedTools,
      tracks: response.tracks,
      clientDirectives: response.clientDirectives,
      pendingAction: response.pendingAction || null,
      modelId: response.modelId,
      latencyMs: response.latencyMs,
      tokensUsed: response.tokensUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/neo/chat:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing your request with Neo AI.',
        reply: "I'm temporarily having trouble connecting to Amazon Bedrock. You can still use standard playback controls.",
        tracks: [],
        clientDirectives: [],
      },
      { status: 500 }
    );
  }
}
