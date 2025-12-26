import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests in the window
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (will reset on server restart)
const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Get client identifier (IP address)
    const identifier = 
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const key = `${identifier}:${request.nextUrl.pathname}`;
    const now = Date.now();

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + config.interval,
      };
    }

    // Increment request count
    store[key].count++;

    const remaining = Math.max(0, config.maxRequests - store[key].count);
    const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

    // Add rate limit headers
    const headers = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
    };

    // Check if limit exceeded
    if (store[key].count > config.maxRequests) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: resetTime,
        },
        {
          status: 429,
          headers: {
            ...headers,
            'Retry-After': resetTime.toString(),
          },
        }
      );
    }

    // Return null to continue (limit not exceeded)
    // Headers will be added by the wrapper
    return null;
  };
}

export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  return response;
}
