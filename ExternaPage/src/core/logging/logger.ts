/**
 * Logger Module
 * Sistema de logging centralizado para la aplicación
 * Los logs solo se muestran en modo desarrollo
 */


import { IS_DEVELOPMENT } from "@/config";
import type { HttpMethod } from "@/types";

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface LogConfig {
  enabled: boolean;
  ignoreRoleValidation403?: boolean;
}

class Logger {
  private readonly config: LogConfig;

  constructor(config: LogConfig = {
    enabled: IS_DEVELOPMENT,
    ignoreRoleValidation403: true
  }) {
    this.config = config;
  }

  private shouldIgnoreLog(level: LogLevel, message: string): boolean {
    // Ignorar errores 403 de validación de roles
    if (
      level === 'error' &&
      this.config.ignoreRoleValidation403 &&
      message.includes('403') &&
      (message.includes('/administradores/') ||
       message.includes('/editores/') ||
       message.includes('/visitantes/'))
    ) {
      return true;
    }
    return false;
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.config.enabled) return;
    if (this.shouldIgnoreLog(level, message)) return;

    const timestamp = new Date().toISOString();
    const emoji = {
      log: "📝",
      warn: "⚠️",
      error: "❌",
      info: "ℹ️",
      debug: "🐛"
    }[level];

    console[level](`${emoji} [${timestamp}] ${message}`, ...args);
  }

  log(message: string, ...args: unknown[]): void {
    this.formatMessage('log', message, args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, args);
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, args);
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, args);
  }

  // Métodos específicos para la aplicación
  api(method: HttpMethod, url: string, status?: number): void {
    const message = status
      ? `API ${method} ${url} - Status: ${status}`
      : `API ${method} ${url}`;
    this.log(message);
  }

  auth(message: string, ...args: unknown[]): void {
    this.log(`🔐 AUTH: ${message}`, ...args);
  }

  service(serviceName: string, action: string, ...args: unknown[]): void {
    this.log(`🔧 [${serviceName}] ${action}`, ...args);
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Exportar clase para crear instancias personalizadas
export default Logger;
