import { ToolSpec } from '../NeoAIToolRegistry';

export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ToolCallRequest {
  toolUseId: string;
  name: string;
  input: Record<string, any>;
}

export interface ProviderResponse {
  content: string;
  toolCalls: ToolCallRequest[];
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'stop_sequence';
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  modelId: string;
}

export interface INeoAIProvider {
  readonly providerId: string;
  readonly defaultModelId: string;

  generateResponse(
    systemPrompt: string,
    messages: ProviderMessage[],
    tools: ToolSpec[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      modelId?: string;
    }
  ): Promise<ProviderResponse>;

  checkHealth(): Promise<{ isHealthy: boolean; modelId: string; message?: string }>;
}
