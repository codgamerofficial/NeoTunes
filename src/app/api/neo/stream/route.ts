import { createClientServer } from '@/lib/supabase-server';
import { NeoAIService } from '@/lib/bedrock/NeoAIService';
import { NeoExecutionContext } from '@/lib/bedrock/NeoAIToolRegistry';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { prompt, history, clientState, confirmedActionId } = body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return new Response(JSON.stringify({ error: 'Prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  const encoder = new TextEncoder();

  const customReadable = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        sendEvent('status', { message: 'Neo is thinking...' });

        // Process message through NeoAIService
        const response = await NeoAIService.processMessage(prompt, history || [], context);

        // Stream executed tool progress events
        for (const tool of response.executedTools) {
          sendEvent('tool_executed', {
            name: tool.name,
            source: tool.source,
            success: tool.success,
          });
        }

        // Stream text chunks
        const words = response.reply.split(' ');
        let accumulated = '';
        for (let i = 0; i < words.length; i++) {
          accumulated += (i > 0 ? ' ' : '') + words[i];
          sendEvent('text_delta', { delta: words[i] + ' ', text: accumulated });
        }

        // Send final payload
        sendEvent('complete', {
          reply: response.reply,
          tracks: response.tracks,
          clientDirectives: response.clientDirectives,
          pendingAction: response.pendingAction,
          executedTools: response.executedTools,
          modelId: response.modelId,
          latencyMs: response.latencyMs,
        });
      } catch (err: any) {
        sendEvent('error', { message: err?.message || 'Streaming failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
