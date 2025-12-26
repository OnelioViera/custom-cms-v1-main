interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  timestamp: Date;
  context?: Record<string, unknown>;
  url?: string;
  userAgent?: string;
}

class ErrorLogger {
  private errors: ErrorLog[] = [];
  private maxErrors = 500; // Keep last 500 errors

  log(
    level: ErrorLog['level'],
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) {
    const errorLog: ErrorLog = {
      id: Math.random().toString(36).substring(7),
      message,
      stack: error?.stack,
      level,
      timestamp: new Date(),
      context,
    };

    this.errors.push(errorLog);

    // Keep only the last maxErrors entries
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'critical' || level === 'error' ? console.error : console.log;
      logMethod(`[${level.toUpperCase()}] ${message}`, error || '', context || '');
    }

    // Send critical errors to monitoring service (placeholder)
    if (level === 'critical') {
      this.sendCriticalAlert(errorLog);
    }
  }

  private sendCriticalAlert(error: ErrorLog) {
    // TODO: Integrate with monitoring service (e.g., Sentry, Datadog)
    console.error('CRITICAL ERROR:', error);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, undefined, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, undefined, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('error', message, error, context);
  }

  critical(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log('critical', message, error, context);
  }

  getErrors(level?: ErrorLog['level']): ErrorLog[] {
    if (level) {
      return this.errors.filter(e => e.level === level);
    }
    return this.errors;
  }

  getRecentErrors(minutes: number = 60): ErrorLog[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errors.filter(e => e.timestamp > cutoff);
  }

  getSummary() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const errors24h = this.errors.filter(e => e.timestamp > last24h);
    const errorsLastHour = this.errors.filter(e => e.timestamp > lastHour);

    return {
      total: this.errors.length,
      last24Hours: errors24h.length,
      lastHour: errorsLastHour.length,
      byLevel: {
        critical: this.errors.filter(e => e.level === 'critical').length,
        error: this.errors.filter(e => e.level === 'error').length,
        warn: this.errors.filter(e => e.level === 'warn').length,
        info: this.errors.filter(e => e.level === 'info').length,
      },
      recentCritical: this.errors
        .filter(e => e.level === 'critical')
        .slice(-5)
        .reverse(),
    };
  }

  clear() {
    this.errors = [];
  }
}

export const errorLogger = new ErrorLogger();
