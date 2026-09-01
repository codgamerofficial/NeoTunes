import { ToolSpec } from '../NeoAIToolRegistry';
import {
  INeoAIProvider,
  ProviderMessage,
  ProviderResponse,
  ToolCallRequest,
} from './INeoAIProvider';

export class TestProvider implements INeoAIProvider {
  public readonly providerId = 'test_mock_provider';
  public readonly defaultModelId = 'mock-claude-3-5-sonnet';

  private mockResponses: Map<string, ProviderResponse> = new Map();

  public setMockResponse(promptSubstring: string, response: ProviderResponse) {
    this.mockResponses.set(promptSubstring.toLowerCase(), response);
  }

  public async generateResponse(
    systemPrompt: string,
    messages: ProviderMessage[],
    tools: ToolSpec[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      modelId?: string;
    }
  ): Promise<ProviderResponse> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const lower = lastUserMessage.toLowerCase();

    for (const [key, res] of this.mockResponses.entries()) {
      if (lower.includes(key)) {
        return res;
      }
    }

    // Default intelligent rule mock for testing
    let toolCalls: ToolCallRequest[] = [];
    let content = "I'm ready to assist with your music listening.";

    if (lower.includes('what is playing') || lower.includes("what's playing") || lower.includes('current track')) {
      toolCalls.push({
        toolUseId: 'test_call_current_track',
        name: 'getCurrentTrack',
        input: {},
      });
      content = '';
    } else if (lower.includes('pause')) {
      toolCalls.push({
        toolUseId: 'test_call_pause',
        name: 'pausePlayback',
        input: {},
      });
      content = '';
    } else if (lower.includes('search') || lower.includes('play')) {
      toolCalls.push({
        toolUseId: 'test_call_search',
        name: 'searchMusic',
        input: { query: lastUserMessage },
      });
      content = '';
    }

    return {
      content,
      toolCalls,
      stopReason: toolCalls.length > 0 ? 'tool_use' : 'end_turn',
      usage: { inputTokens: 50, outputTokens: 30, totalTokens: 80 },
      latencyMs: 15,
      modelId: this.defaultModelId,
    };
  }

  public async checkHealth(): Promise<{ isHealthy: boolean; modelId: string; message?: string }> {
    return {
      isHealthy: true,
      modelId: this.defaultModelId,
      message: 'Test mock provider ready',
    };
  }
}
