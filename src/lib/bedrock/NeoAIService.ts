import { neoOrchestrator, NeoConversationMessage, NeoOrchestratorResponse } from './NeoOrchestrator';
import { NeoExecutionContext } from './NeoAIToolRegistry';
import { BedrockProvider } from './providers/BedrockProvider';

export class NeoAIService {
  public static async processMessage(
    userPrompt: string,
    history: NeoConversationMessage[] = [],
    context: NeoExecutionContext = {}
  ): Promise<NeoOrchestratorResponse> {
    return await neoOrchestrator.processMessage(userPrompt, history, context);
  }

  public static async checkHealth() {
    const provider = new BedrockProvider();
    return await provider.checkHealth();
  }
}
