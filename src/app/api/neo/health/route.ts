import { NextResponse } from 'next/server';
import { NeoAIService } from '@/lib/bedrock/NeoAIService';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const health = await NeoAIService.checkHealth();
    return NextResponse.json({
      status: 'ok',
      service: 'Neo AI Music Intelligence',
      provider: 'Amazon Bedrock Runtime',
      ...health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to verify Neo AI service health',
        error: error?.message,
      },
      { status: 500 }
    );
  }
}
