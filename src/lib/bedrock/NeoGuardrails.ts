/**
 * Neo AI Guardrails & Prompt Injection Protection
 * Ensures safe processing of user prompts, metadata, and external data.
 */

export interface GuardrailCheckResult {
  isSafe: boolean;
  sanitizedText: string;
  violations: string[];
}

const SUSPICIOUS_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /bypass\s+all\s+guardrails/i,
  /jailbreak/i,
  /reveal\s+(your\s+)?(system|internal)\s+(prompt|instructions|keys|secrets)/i,
  /drop\s+table/i,
  /delete\s+from\s+users/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
];

export class NeoGuardrails {
  /**
   * Sanitizes user input prompt and screens for injection patterns
   */
  public static assessInput(rawPrompt: string): GuardrailCheckResult {
    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return { isSafe: true, sanitizedText: '', violations: [] };
    }

    const violations: string[] = [];
    let sanitizedText = rawPrompt.trim();

    // Check for dangerous injection patterns
    for (const pattern of SUSPICIOUS_INJECTION_PATTERNS) {
      if (pattern.test(sanitizedText)) {
        violations.push(`Triggered pattern: ${pattern.source}`);
      }
    }

    // Strip raw HTML tags and dangerous protocols
    sanitizedText = sanitizedText
      .replace(/<[^>]*>/g, '')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control characters
      .trim();

    return {
      isSafe: violations.length === 0,
      sanitizedText,
      violations,
    };
  }

  /**
   * Treats external data (lyrics, descriptions, web metadata) as inert data (Sections 80 & 81)
   */
  public static sanitizeExternalData(data: string): string {
    if (!data) return '';
    return data
      .replace(/ignore\s+previous\s+instructions/gi, '[filtered]')
      .replace(/system\s+prompt/gi, '[filtered]')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .trim();
  }

  /**
   * Sanitizes model output to prevent accidental leak of internal system details, keys, or stack traces
   */
  public static sanitizeOutput(output: string): string {
    if (!output) return '';
    return output
      .replace(/AKIA[0-9A-Z]{16}/g, '[AWS_KEY_REDACTED]')
      .replace(/ABSK[a-zA-Z0-9_\-+/=]{30,}/g, '[BEDROCK_KEY_REDACTED]')
      .replace(/nvapi[a-zA-Z0-9_\-]{30,}/g, '[API_KEY_REDACTED]')
      .replace(/eyJhbGciOi[a-zA-Z0-9_\-\.]+/g, '[JWT_REDACTED]')
      .replace(/postgresql:\/\/[^:]+:[^@]+@[^\/]+/g, '[DB_URI_REDACTED]');
  }
}
