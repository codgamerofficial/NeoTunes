export type LogCategory =
  | 'PLAYER'
  | 'SEARCH'
  | 'AUTH'
  | 'NETWORK'
  | 'DATABASE'
  | 'DOWNLOAD'
  | 'LYRICS'
  | 'AI'
  | 'RECOMMENDATIONS'
  | 'SOCIAL'
  | 'NATIVE';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export class Logger {
  private static redactSensitive(msg: string): string {
    return msg
      .replace(/(token|secret|password|key|auth|bearer)\s*[:=]\s*["']?[^"'\s]+["']?/gi, '$1=[REDACTED]')
      .replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[JWT_REDACTED]');
  }

  public static log(level: LogLevel, category: LogCategory, message: string, details?: any): void {
    if (process.env.NODE_ENV === 'production' && level === 'DEBUG') return;

    const timestamp = new Date().toISOString();
    const cleanMsg = Logger.redactSensitive(message);
    const prefix = `[${timestamp}] [${level}] [${category}]`;

    if (level === 'ERROR') {
      console.error(prefix, cleanMsg, details || '');
    } else if (level === 'WARN') {
      console.warn(prefix, cleanMsg, details || '');
    } else {
      console.log(prefix, cleanMsg, details || '');
    }
  }

  public static debug(category: LogCategory, message: string, details?: any): void {
    Logger.log('DEBUG', category, message, details);
  }

  public static info(category: LogCategory, message: string, details?: any): void {
    Logger.log('INFO', category, message, details);
  }

  public static warn(category: LogCategory, message: string, details?: any): void {
    Logger.log('WARN', category, message, details);
  }

  public static error(category: LogCategory, message: string, details?: any): void {
    Logger.log('ERROR', category, message, details);
  }
}
