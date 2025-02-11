import { config } from '../config';

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = {
      timestamp,
      level,
      context: this.context,
      message,
      ...(meta && { meta })
    };

    console.log(JSON.stringify(logMessage));
  }

  info(message: string, meta?: any): void {
    if (config.logging.level === 'info' || config.logging.level === 'debug') {
      this.log('info', message, meta);
    }
  }

  error(message: string, error?: any): void {
    this.log('error', message, {
      error: error?.message || error,
      stack: error?.stack
    });
  }

  debug(message: string, meta?: any): void {
    if (config.logging.level === 'debug') {
      this.log('debug', message, meta);
    }
  }
}