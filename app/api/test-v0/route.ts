import { NextResponse } from 'next/server';
import { createClient } from 'v0-sdk';

export async function GET() {
  try {
    console.log('Testing V0 API connection...');
    console.log('V0_API_KEY available:', !!process.env.V0_API_KEY);
    console.log('V0_API_KEY format:', process.env.V0_API_KEY?.substring(0, 10) + '...');

    if (!process.env.V0_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'V0_API_KEY environment variable is not set',
        debug: {
          nodeEnv: process.env.NODE_ENV,
          hasKey: false,
        }
      }, { status: 500 });
    }

    // Create v0 client
    const v0Client = createClient({
      apiKey: process.env.V0_API_KEY
    });

    // Test with a simple chat creation
    const chat = await v0Client.chats.create({
      message: 'Create a simple React button component',
    });

    console.log('V0 API test successful:', chat.id);

    return NextResponse.json({
      success: true,
      chatId: chat.id,
      demoUrl: chat.latestVersion?.demoUrl || 'No demo URL',
      debug: {
        nodeEnv: process.env.NODE_ENV,
        hasKey: true,
        keyFormat: process.env.V0_API_KEY?.substring(0, 10) + '...',
      }
    });

  } catch (error: any) {
    console.error('V0 API test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        nodeEnv: process.env.NODE_ENV,
        hasKey: !!process.env.V0_API_KEY,
        keyFormat: process.env.V0_API_KEY?.substring(0, 10) + '...',
        errorType: error.constructor.name,
        stack: error.stack?.split('\n').slice(0, 3),
      }
    }, { status: 500 });
  }
}