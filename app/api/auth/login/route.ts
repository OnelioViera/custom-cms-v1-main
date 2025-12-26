import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import { User } from '@/lib/models/User';
import { withRateLimit } from '@/lib/middleware/withRateLimit';
import { measureAsync } from '@/lib/monitoring/performance';
import { errorLogger } from '@/lib/monitoring/errors';
import { config } from '@/lib/config';

export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async (req) => {
      try {
        const { email, password } = await req.json();

        if (!email || !password) {
          return NextResponse.json({
            success: false,
            message: 'Email and password are required'
          }, { status: 400 });
        }

        // Find user by email with performance tracking
        const user = await measureAsync('api.auth.login.verify', async () => {
          const db = await getDatabase();
          const usersCollection = db.collection<User>('users');
          return await usersCollection.findOne({ email });
        });

        if (!user) {
          errorLogger.warn('Login attempt with invalid email', {
            email,
            endpoint: '/api/auth/login',
          });

          return NextResponse.json({
            success: false,
            message: 'Invalid credentials'
          }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
          errorLogger.warn('Login attempt with invalid password', {
            email,
            endpoint: '/api/auth/login',
          });

          return NextResponse.json({
            success: false,
            message: 'Invalid credentials'
          }, { status: 401 });
        }

        // Generate token
        const userWithoutPassword = {
          _id: user._id?.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        const token = generateToken(userWithoutPassword);

        // Create response with cookie
        const response = NextResponse.json({
          success: true,
          message: 'Login successful',
          user: userWithoutPassword
        });

        response.cookies.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        errorLogger.info('User logged in successfully', {
          userId: user._id?.toString(),
          email: user.email,
        });

        return response;
      } catch (error) {
        errorLogger.error('Login failed', error as Error, {
          endpoint: '/api/auth/login',
          method: 'POST',
        });

        console.error('Login error:', error);
        return NextResponse.json({
          success: false,
          message: 'Login failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    },
    {
      interval: config.get('RATE_LIMIT_LOGIN_WINDOW'),
      maxRequests: config.get('RATE_LIMIT_LOGIN_MAX'),
    }
  );
}
