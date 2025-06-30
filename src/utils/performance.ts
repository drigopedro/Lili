interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      const navObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('FCP', navEntry.loadEventEnd - navEntry.fetchStart);
            this.recordMetric('DOMContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart);
            this.recordMetric('LoadComplete', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        });
      });

      try {
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported');
      }

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric(entry.name, entry.startTime);
        });
      });

      try {
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (error) {
        console.warn('Paint timing observer not supported');
      }

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('LCP', entry.startTime);
        });
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }

      // Observe first input delay
      const fidObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const fidEntry = entry as any;
          this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported');
      }
    }
  }

  recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
    };

    this.metrics.push(metric);
    this.sendMetricToAnalytics(metric);

    // Log performance issues
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: PerformanceMetric) {
    const thresholds = {
      'first-contentful-paint': 1800,
      'largest-contentful-paint': 2500,
      'FID': 100,
      'LoadComplete': 3000,
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      console.warn(`Performance threshold exceeded for ${metric.name}: ${metric.value}ms (threshold: ${threshold}ms)`);
      
      // In production, send alert to monitoring service
      this.sendPerformanceAlert(metric, threshold);
    }
  }

  private sendMetricToAnalytics(metric: PerformanceMetric) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric:', metric);
    }

    // Example: Send to Google Analytics, Mixpanel, etc.
    // analytics.track('performance_metric', metric);
  }

  private sendPerformanceAlert(metric: PerformanceMetric, threshold: number) {
    // In production, send alert to monitoring service
    console.error('Performance alert:', {
      metric: metric.name,
      value: metric.value,
      threshold,
      url: metric.url,
    });

    // Example: Send to monitoring service
    // monitoringService.captureMessage('Performance threshold exceeded', {
    //   level: 'warning',
    //   extra: { metric, threshold }
    // });
  }

  measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    return apiCall()
      .then((result) => {
        const duration = performance.now() - startTime;
        this.recordMetric(`API_${name}`, duration);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        this.recordMetric(`API_${name}_ERROR`, duration);
        throw error;
      });
  }

  measureUserInteraction(name: string, interaction: () => void) {
    const startTime = performance.now();
    
    try {
      interaction();
    } finally {
      const duration = performance.now() - startTime;
      this.recordMetric(`INTERACTION_${name}`, duration);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics() {
    this.metrics = [];
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility functions for measuring performance
export const measureAsync = async <T>(
  name: string,
  asyncOperation: () => Promise<T>
): Promise<T> => {
  return performanceMonitor.measureApiCall(name, asyncOperation);
};

export const measureSync = (name: string, operation: () => void): void => {
  performanceMonitor.measureUserInteraction(name, operation);
};

// Web Vitals measurement
export const measureWebVitals = () => {
  // This would typically use the web-vitals library
  // import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
  
  // getCLS(console.log);
  // getFID(console.log);
  // getFCP(console.log);
  // getLCP(console.log);
  // getTTFB(console.log);
};