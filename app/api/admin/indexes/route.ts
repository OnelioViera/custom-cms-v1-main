import { NextResponse } from 'next/server';
import { checkIndexes } from '@/lib/monitoring/indexes';

export async function GET() {
  try {
    const report = await checkIndexes();
    
    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Index check error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check indexes' },
      { status: 500 }
    );
  }
}
