import { NextRequest, NextResponse } from 'next/server';
import { websiteBuilder } from '@/lib/website-builder';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$|^[a-z0-9]$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { available: false, error: 'Invalid subdomain format' },
        { status: 200 }
      );
    }

    // Check availability
    const available = await websiteBuilder.checkSubdomainAvailability(subdomain);

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return NextResponse.json(
      { error: 'Failed to check subdomain availability' },
      { status: 500 }
    );
  }
}