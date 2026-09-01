import { NextResponse } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';
import { NeoAIToolRegistry, NeoExecutionContext } from '@/lib/bedrock/NeoAIToolRegistry';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actionId, toolName, input, clientState } = body;

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
      confirmedActionId: actionId,
    };

    let targetTool = toolName;
    let targetInput = input;

    if (actionId) {
      const pendingAction = NeoAIToolRegistry.getPendingAction(actionId);
      if (!pendingAction) {
        return NextResponse.json(
          { success: false, message: 'Action expired or invalid action ID.' },
          { status: 400 }
        );
      }
      targetTool = pendingAction.tool;
      targetInput = pendingAction.arguments;
    }

    if (!targetTool) {
      return NextResponse.json({ success: false, message: 'Missing tool name or actionId.' }, { status: 400 });
    }

    const result = await NeoAIToolRegistry.executeTool(targetTool, targetInput, context);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Action execution error' }, { status: 500 });
  }
}
