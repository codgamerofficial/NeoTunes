import { BedrockRuntimeClientConfig } from '@aws-sdk/client-bedrock-runtime';

/**
 * Server-side Amazon Bedrock Configuration
 * CRITICAL RULE: These values must NEVER be exposed via NEXT_PUBLIC_* or sent to the browser.
 */

export interface BedrockConfig {
  apiKey?: string;
  region: string;
  modelId: string;
  fallbackModelId: string;
  maxTokens: number;
  temperature: number;
  guardrailId?: string;
  guardrailVersion?: string;
}

export function getBedrockConfig(): BedrockConfig {
  const apiKey =
    process.env.BEDROCK_API_KEY ||
    process.env.AWS_BEDROCK_API_KEY ||
    // Supported fallback if configured via custom server env
    process.env.AMAZON_BEDROCK_API_KEY ||
    '';

  const region =
    process.env.BEDROCK_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    'us-east-1';

  // Primary model on Amazon Bedrock
  const modelId =
    process.env.BEDROCK_MODEL_ID ||
    process.env.AWS_BEDROCK_MODEL_ID ||
    'amazon.nova-lite-v1:0';

  // Fallback model if primary is throttled
  const fallbackModelId =
    process.env.BEDROCK_FALLBACK_MODEL_ID ||
    'amazon.nova-micro-v1:0';

  const maxTokens = parseInt(process.env.BEDROCK_MAX_TOKENS || '1024', 10);
  const temperature = parseFloat(process.env.BEDROCK_TEMPERATURE || '0.2');

  const guardrailId = process.env.BEDROCK_GUARDRAIL_ID || undefined;
  const guardrailVersion = process.env.BEDROCK_GUARDRAIL_VERSION || undefined;

  return {
    apiKey: apiKey.trim() || undefined,
    region,
    modelId,
    fallbackModelId,
    maxTokens,
    temperature,
    guardrailId,
    guardrailVersion,
  };
}

export function getBedrockClientConfig(): BedrockRuntimeClientConfig {
  const config = getBedrockConfig();
  const clientConfig: BedrockRuntimeClientConfig = {
    region: config.region,
  };

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId,
      secretAccessKey,
      sessionToken,
    };
  }

  return clientConfig;
}
