import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '../rateLimit';

export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: { interval: number; maxRequests: number }
): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitCheck = await rateLimit(config)(request);
  
  // If rate limit exceeded, return error response
  if (rateLimitCheck) {
    return rateLimitCheck;
  }

  // Otherwise, proceed with the handler
  return handler(request);
}
