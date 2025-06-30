interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  context?: any;
}

interface PerformanceReport {
  metric: string;
  value: number;
  url: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class MonitoringService {
  private sessionId: string;
  private userId?: string;
  private errorQueue: ErrorReport[] = [];
  private performanceQueue: PerformanceReport[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueues();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error, {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
      });
    });
  }

  private startPeriodicFlush() {
    // Flush queues every 30 seconds
    setInterval(() => {
      if (this.isOnline) {
        this.flushQueues();
      }
    }, 30000);
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  captureError(error: Error, context?: any) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      context,
    };

    this.errorQueue.push(errorReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorReport);
    }

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue();
    }
  }

  capturePerformance(metric: string, value: number) {
    const performanceReport: PerformanceReport = {
      metric,
      value,
      url: window.location.href,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.performanceQueue.push(performanceReport);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance captured:', performanceReport);
    }

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushPerformanceQueue();
    }
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrors(errors);
    } catch (error) {
      // Re-queue errors if sending failed
      this.errorQueue.unshift(...errors);
      console.error('Failed to send error reports:', error);
    }
  }

  private async flushPerformanceQueue() {
    if (this.performanceQueue.length === 0) return;

    const metrics = [...this.performanceQueue];
    this.performanceQueue = [];

    try {
      await this.sendPerformanceMetrics(metrics);
    } catch (error) {
      // Re-queue metrics if sending failed
      this.performanceQueue.unshift(...metrics);
      console.error('Failed to send performance metrics:', error);
    }
  }

  private async flushQueues() {
    await Promise.all([
      this.flushErrorQueue(),
      this.flushPerformanceQueue(),
    ]);
  }

  private async sendErrors(errors: ErrorReport[]) {
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
    const response = await fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send errors: ${response.status}`);
    }
  }

  private async sendPerformanceMetrics(metrics: PerformanceReport[]) {
    // In production, send to analytics service
    const response = await fetch('/api/monitoring/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metrics }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send performance metrics: ${response.status}`);
    }
  }

  // Method to manually trigger queue flush
  flush() {
    return this.flushQueues();
  }

  // Method to get current queue sizes (for debugging)
  getQueueSizes() {
    return {
      errors: this.errorQueue.length,
      performance: this.performanceQueue.length,
    };
  }
}

export const monitoringService = new MonitoringService();

// Utility functions
export const captureError = (error: Error, context?: any) => {
  monitoringService.captureError(error, context);
};

export const capturePerformance = (metric: string, value: number) => {
  monitoringService.capturePerformance(metric, value);
};

export const setUserId = (userId: string) => {
  monitoringService.setUserId(userId);
};