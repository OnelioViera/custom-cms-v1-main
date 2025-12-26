import fs from 'fs';
import path from 'path';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Use /tmp in serverless environments
const METRICS_FILE = process.env.VERCEL
  ? '/tmp/.metrics.json'
  : path.join(process.cwd(), '.metrics.json');

class PerformanceMonitor {
  private maxMetrics = 1000;

  private readMetrics(): PerformanceMetric[] {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        const data = fs.readFileSync(METRICS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return parsed.map((m: { timestamp: string; [key: string]: unknown }) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error reading metrics:', error);
    }
    return [];
  }

  private writeMetrics(metrics: PerformanceMetric[]) {
    try {
      fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Error writing metrics:', error);
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, unknown>) {
    const metrics = this.readMetrics();
    
    metrics.push({
      name,
      value,
      timestamp: new Date(),
      metadata,
    });

    // Keep only the last maxMetrics entries
    if (metrics.length > this.maxMetrics) {
      metrics.shift();
    }

    this.writeMetrics(metrics);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    const metrics = this.readMetrics();
    if (name) {
      return metrics.filter(m => m.name === name);
    }
    return metrics;
  }

  getAverageMetric(name: string, timeWindowMs: number = 60000): number | null {
    const now = Date.now();
    const metrics = this.readMetrics();
    const recentMetrics = metrics.filter(
      m => m.name === name && now - m.timestamp.getTime() < timeWindowMs
    );

    if (recentMetrics.length === 0) return null;

    const sum = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / recentMetrics.length;
  }

  getSummary() {
    const metrics = this.readMetrics();
    const metricNames = [...new Set(metrics.map(m => m.name))];
    
    return metricNames.map(name => {
      const metricsByName = metrics.filter(m => m.name === name);
      const values = metricsByName.map(m => m.value);
      
      return {
        name,
        count: metricsByName.length,
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        latest: metricsByName[metricsByName.length - 1]?.value,
      };
    });
  }

  clear() {
    try {
      if (fs.existsSync(METRICS_FILE)) {
        fs.unlinkSync(METRICS_FILE);
      }
    } catch (error) {
      console.error('Error clearing metrics:', error);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Helper to measure async function execution time
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  const start = Date.now(); // Use Date.now() instead of performance.now()
  try {
    const result = await fn();
    const duration = Date.now() - start;
    performanceMonitor.recordMetric(name, duration, metadata);
    console.log(`[PERF] ${name}: ${duration}ms`); // Debug log
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    performanceMonitor.recordMetric(name, duration, {
      ...metadata,
      error: true,
    });
    throw error;
  }
}
