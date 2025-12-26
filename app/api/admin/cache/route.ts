import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

export async function GET() {
  const stats = cache.getStats();

  return NextResponse.json({
    success: true,
    cache: stats,
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pattern = searchParams.get('pattern');

  if (pattern) {
    cache.deletePattern(pattern);
    return NextResponse.json({
      success: true,
      message: `Cache entries matching "${pattern}" deleted`,
    });
  }

  cache.clear();
  return NextResponse.json({
    success: true,
    message: 'All cache cleared',
  });
}
