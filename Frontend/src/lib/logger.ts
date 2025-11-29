/**
 * Utilidad para logging en la aplicación
 * Los logs solo se muestran en modo desarrollo
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

class Logger {
  private enabled: boolean;

  constructor(enabled: boolean = isDevelopment) {
    this.enabled = enabled;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const emoji = {
      log: '📝',
      warn: '⚠️',
      error: '❌',
      info: 'ℹ️',
      debug: '🐛',
    }[level];

    console[level](`${emoji} [${timestamp}] ${message}`, ...args);
  }

  log(message: string, ...args: any[]): void {
    this.formatMessage('log', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage('error', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args);
  }

  // Métodos específicos para la aplicación
  api(method: string, url: string, status?: number): void {
    if (status) {
      this.log(`API ${method} ${url} - Status: ${status}`);
    } else {
      this.log(`API ${method} ${url}`);
    }
  }

  auth(message: string, ...args: any[]): void {
    this.log(`🔐 AUTH: ${message}`, ...args);
  }

  service(serviceName: string, action: string, ...args: any[]): void {
    this.log(`🔧 [${serviceName}] ${action}`, ...args);
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Exportar clase para crear instancias personalizadas
export default Logger;
