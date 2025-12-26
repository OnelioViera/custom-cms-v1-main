import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/middleware/withRateLimit';

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      return NextResponse.json({
        success: true,
        message: 'Rate limit test successful',
        timestamp: new Date().toISOString(),
      });
    },
    {
      interval: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests per minute
    }
  );
}
