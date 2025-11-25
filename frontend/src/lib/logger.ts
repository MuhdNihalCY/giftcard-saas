/**
 * Frontend Logger Service
 * Provides structured logging for the frontend application
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  error(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('error', message, context);
    if (this.isDevelopment) {
      console.error(formatted);
    } else {
      // In production, you might want to send to error tracking service
      // For now, we'll still log but could integrate with Sentry, LogRocket, etc.
      console.error(formatted);
    }
  }

  warn(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('warn', message, context);
    if (this.isDevelopment) {
      console.warn(formatted);
    } else {
      console.warn(formatted);
    }
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage('info', message, context);
    if (this.isDevelopment) {
      console.log(formatted);
    }
    // In production, info logs are typically not shown
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      const formatted = this.formatMessage('debug', message, context);
      console.log(formatted);
    }
    // Debug logs are only shown in development
  }
}

export const logger = new Logger();
export default logger;


