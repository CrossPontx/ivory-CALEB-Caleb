import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow in development or for specific users
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Debug endpoint not available in production' }, { status: 403 });
    }

    const debugInfo = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        V0_API_KEY_AVAILABLE: !!process.env.V0_API_KEY,
        V0_API_KEY_LENGTH: process.env.V0_API_KEY?.length || 0,
        DATABASE_URL_AVAILABLE: !!process.env.DATABASE_URL,
      },
      session: {
        userId: session.id,
        hasSession: !!session,
      },
      packages: {
        v0SDK: (() => {
          try {
            require('v0-sdk');
            return 'available';
          } catch (error) {
            return `error: ${error instanceof Error ? error.message : 'unknown'}`;
          }
        })(),
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}