import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techWebsites, techProfiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const websiteId = parseInt(id);
    if (isNaN(websiteId)) {
      return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 });
    }

    // Get website data
    const [website] = await db
      .select({
        id: techWebsites.id,
        subdomain: techWebsites.subdomain,
        demoUrl: techWebsites.demoUrl,
        isPublished: techWebsites.isPublished,
        customDomain: techWebsites.customDomain,
      })
      .from(techWebsites)
      .where(eq(techWebsites.id, websiteId))
      .limit(1);

    if (!website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    if (!website.isPublished) {
      return NextResponse.json({ error: 'Website is not published' }, { status: 403 });
    }

    // If we have a demo URL, fetch the content from V0
    if (website.demoUrl) {
      try {
        const response = await fetch(website.demoUrl);
        if (response.ok) {
          const html = await response.text();
          
          // Return the HTML content with proper headers
          return new NextResponse(html, {
            headers: {
              'Content-Type': 'text/html',
              'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            },
          });
        }
      } catch (error) {
        console.error('Error fetching website content:', error);
      }
    }

    // Fallback: return a simple placeholder page
    const placeholderHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Coming Soon</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8f7f5 0%, #ffffff 100%);
        }
        .container {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
        }
        h1 {
            color: #1a1a1a;
            font-size: 2.5rem;
            font-weight: 300;
            margin-bottom: 1rem;
        }
        p {
            color: #6b6b6b;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
            border: 1px solid #e8e8e8;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🌟</div>
        <h1>Website Coming Soon</h1>
        <p>This professional website is being prepared and will be available shortly.</p>
        <p>Thank you for your patience!</p>
    </div>
</body>
</html>
    `;

    return new NextResponse(placeholderHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Error serving website:', error);
    return NextResponse.json(
      { error: 'Failed to serve website' },
      { status: 500 }
    );
  }
}