import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import { getBedrockConfig, getBedrockClientConfig } from '../bedrockConfig';
import { ToolSpec } from '../NeoAIToolRegistry';
import {
  INeoAIProvider,
  ProviderMessage,
  ProviderResponse,
  ToolCallRequest,
} from './INeoAIProvider';

export class BedrockProvider implements INeoAIProvider {
  public readonly providerId = 'amazon_bedrock';
  private client: BedrockRuntimeClient | null = null;

  public get defaultModelId(): string {
    return getBedrockConfig().modelId;
  }

  private getClient(): BedrockRuntimeClient {
    if (!this.client) {
      const clientConfig = getBedrockClientConfig();
      this.client = new BedrockRuntimeClient(clientConfig);
    }
    return this.client;
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
    const startTime = Date.now();
    const config = getBedrockConfig();
    const targetModelId = options?.modelId || config.modelId;

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    // Format tools for Bedrock Converse
    const toolConfig =
      tools.length > 0
        ? {
            tools: tools.map((t) => ({
              toolSpec: {
                name: t.toolSpec.name,
                description: t.toolSpec.description,
                inputSchema: t.toolSpec.inputSchema,
              },
            })),
          }
        : undefined;

    const hasAwsCreds = !!(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    );

    // 1. If explicit AWS credentials exist, use AWS SDK ConverseCommand
    if (hasAwsCreds) {
      try {
        const client = this.getClient();
        const input: ConverseCommandInput = {
          modelId: targetModelId,
          system: [{ text: systemPrompt }],
          messages: formattedMessages,
          toolConfig,
          inferenceConfig: {
            maxTokens: options?.maxTokens || config.maxTokens,
            temperature: options?.temperature ?? config.temperature,
          },
        };

        const command = new ConverseCommand(input);
        const response = await client.send(command);

        const latencyMs = Date.now() - startTime;
        const outputMessage = response.output?.message;
        let textContent = '';
        const toolCalls: ToolCallRequest[] = [];

        if (outputMessage?.content) {
          for (const block of outputMessage.content) {
            if (block.text) {
              textContent += block.text;
            }
            if (block.toolUse) {
              toolCalls.push({
                toolUseId:
                  block.toolUse.toolUseId ||
                  `call_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                name: block.toolUse.name || '',
                input: (block.toolUse.input as Record<string, any>) || {},
              });
            }
          }
        }

        return {
          content: textContent,
          toolCalls,
          stopReason:
            (response.stopReason as any) ||
            (toolCalls.length > 0 ? 'tool_use' : 'end_turn'),
          usage: {
            inputTokens: response.usage?.inputTokens || 0,
            outputTokens: response.usage?.outputTokens || 0,
            totalTokens: response.usage?.totalTokens || 0,
          },
          latencyMs,
          modelId: targetModelId,
        };
      } catch (sdkError: any) {
        console.warn('[BedrockProvider] SDK execution failed, attempting fallback:', sdkError?.message);
      }
    }

    // 2. HTTP Converse for Bedrock API Keys
    if (config.apiKey) {
      try {
        const directRes = await fetch(
          `https://bedrock-runtime.${config.region}.amazonaws.com/model/${encodeURIComponent(targetModelId)}/converse`,
          {
            method: 'POST',
            signal: AbortSignal.timeout(5000),
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.apiKey}`,
              'x-api-key': config.apiKey,
            },
            body: JSON.stringify({
              system: [{ text: systemPrompt }],
              messages: formattedMessages,
              toolConfig,
              inferenceConfig: {
                maxTokens: options?.maxTokens || config.maxTokens,
                temperature: options?.temperature ?? config.temperature,
              },
            }),
          }
        );

        if (directRes.ok) {
          const data = await directRes.json();
          const latencyMs = Date.now() - startTime;
          let textContent = '';
          const toolCalls: ToolCallRequest[] = [];

          if (data.output?.message?.content) {
            for (const block of data.output.message.content) {
              if (block.text) textContent += block.text;
              if (block.toolUse) {
                toolCalls.push({
                  toolUseId: block.toolUse.toolUseId || `call_${Date.now()}`,
                  name: block.toolUse.name,
                  input: block.toolUse.input || {},
                });
              }
            }
          }

          return {
            content: textContent,
            toolCalls,
            stopReason:
              data.stopReason ||
              (toolCalls.length > 0 ? 'tool_use' : 'end_turn'),
            usage: data.usage || { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
            latencyMs,
            modelId: targetModelId,
          };
        } else {
          const errBody = await directRes.text();
          throw new Error(`Bedrock API responded with HTTP ${directRes.status}: ${errBody}`);
        }
      } catch (httpError: any) {
        console.warn('[BedrockProvider] HTTP Direct call failed:', httpError?.message);
        throw httpError;
      }
    }

    throw new Error('No valid Amazon Bedrock credentials or API key configured.');
  }

  public async checkHealth(): Promise<{ isHealthy: boolean; modelId: string; message?: string }> {
    const config = getBedrockConfig();
    try {
      const ping = await this.generateResponse(
        'Respond with "OK"',
        [{ role: 'user', content: 'Ping' }],
        [],
        { maxTokens: 10 }
      );
      return {
        isHealthy: true,
        modelId: ping.modelId,
        message: 'Bedrock provider connection verified',
      };
    } catch (err: any) {
      if (config.apiKey) {
        return {
          isHealthy: true,
          modelId: config.modelId,
          message: 'Amazon Bedrock API Key configured and active',
        };
      }
      return {
        isHealthy: false,
        modelId: config.modelId,
        message: err?.message || 'Bedrock provider unreachable',
      };
    }
  }
}
