import { NextResponse } from 'next/server';

export async function GET() {
  const securityConfig = {
    contentSecurityPolicy: {
      enabled: true,
      directives: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "frame-ancestors 'none'",
      ],
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
    cors: {
      enabled: true,
      allowedOrigins: process.env.ALLOWED_ORIGINS || '*',
      allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    https: {
      strictTransportSecurity: process.env.NODE_ENV === 'production',
      upgradeInsecureRequests: true,
    },
  };

  const response = NextResponse.json({
    success: true,
    security: securityConfig,
    environment: process.env.NODE_ENV,
  });

  return response;
}
