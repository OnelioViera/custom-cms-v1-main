import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    rateLimits: {
      login: {
        interval: '15 minutes',
        maxRequests: 5,
      },
      upload: {
        interval: '1 hour',
        maxRequests: 20,
      },
      general: {
        interval: '1 minute',
        maxRequests: 10,
      },
    },
    note: 'Rate limits are per IP address',
  });
}
