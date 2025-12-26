import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET() {
  const allConfig = config.getAll();

  // Sanitize sensitive data
  const sanitized = {
    ...allConfig,
    MONGODB_URI: allConfig.MONGODB_URI ? '***CONFIGURED***' : '***MISSING***',
    JWT_SECRET: allConfig.JWT_SECRET ? '***CONFIGURED***' : '***MISSING***',
  };

  return NextResponse.json({
    success: true,
    environment: config.get('NODE_ENV'),
    isProduction: config.isProduction(),
    config: sanitized,
    featureFlags: {
      caching: config.isFeatureEnabled('ENABLE_CACHING'),
      rateLimiting: config.isFeatureEnabled('ENABLE_RATE_LIMITING'),
      monitoring: config.isFeatureEnabled('ENABLE_MONITORING'),
      errorLogging: config.isFeatureEnabled('ENABLE_ERROR_LOGGING'),
    },
  });
}
