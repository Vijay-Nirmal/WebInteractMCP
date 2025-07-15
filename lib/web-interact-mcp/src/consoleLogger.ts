import { ILogger, LogLevel } from './types';

/**
 * Production-ready console logger implementation
 */
export class ConsoleLogger implements ILogger {
  private currentLevel: LogLevel;

  constructor(level: LogLevel = LogLevel.WARN) {
    this.currentLevel = level;
  }

  trace(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.TRACE) {
      // eslint-disable-next-line no-console
      console.trace(`[MCP TRACE] ${message}`, ...data);
    }
  }

  debug(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      // eslint-disable-next-line no-console
      console.debug(`[MCP DEBUG] ${message}`, ...data);
    }
  }

  info(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.INFO) {
      // eslint-disable-next-line no-console
      console.info(`[MCP INFO] ${message}`, ...data);
    }
  }

  warn(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.WARN) {
      // eslint-disable-next-line no-console
      console.warn(`[MCP WARN] ${message}`, ...data);
    }
  }

  error(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      // eslint-disable-next-line no-console
      console.error(`[MCP ERROR] ${message}`, ...data);
    }
  }

  fatal(message: string, ...data: any[]): void {
    if (this.currentLevel <= LogLevel.FATAL) {
      // eslint-disable-next-line no-console
      console.error(`[MCP FATAL] ${message}`, ...data);
    }
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  getLevel(): LogLevel {
    return this.currentLevel;
  }
}
