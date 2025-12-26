import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance';
import { errorLogger } from '@/lib/monitoring/errors';

export async function GET() {
  const performanceSummary = performanceMonitor.getSummary();
  const errorSummary = errorLogger.getSummary();

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    performance: {
      summary: performanceSummary,
      recentMetrics: performanceMonitor.getMetrics().slice(-20),
    },
    errors: {
      summary: errorSummary,
      recent: errorLogger.getRecentErrors(60),
    },
    system: {
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  });
}

export async function DELETE() {
  performanceMonitor.clear();
  errorLogger.clear();

  return NextResponse.json({
    success: true,
    message: 'Monitoring data cleared',
  });
}
