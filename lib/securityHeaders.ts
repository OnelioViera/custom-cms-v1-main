export const securityHeaders = [
  // Content Security Policy - Prevents XSS attacks
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline and unsafe-eval
      "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.anthropic.com", // For any external API calls
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'", // Prevents clickjacking
      "upgrade-insecure-requests",
    ].join('; '),
  },
  // Prevents browsers from MIME-sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Prevents page from being displayed in iframe (clickjacking protection)
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Controls how much referrer information is sent
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Controls which browser features can be used
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()', // Disables FLoC
    ].join(', '),
  },
  // Forces HTTPS (only in production)
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]
    : []),
  // Prevents page caching for sensitive pages
  {
    key: 'Cache-Control',
    value: 'no-store, max-age=0',
  },
];
