import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { techProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Get booking widget embed code for V0 websites
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const techId = parseInt(id);

    if (isNaN(techId)) {
      return NextResponse.json({ 
        error: 'Invalid tech ID', 
        received: id,
        expected: 'numeric ID' 
      }, { status: 400 });
    }

    // Verify tech profile exists
    const tech = await db.query.techProfiles.findFirst({
      where: eq(techProfiles.id, techId),
      with: {
        user: {
          columns: {
            username: true,
          },
        },
      },
    });

    if (!tech) {
      return NextResponse.json({ error: 'Tech not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'html'; // html, react, or script

    let embedCode = '';
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://ivoryschoice.com' 
      : 'http://localhost:3000';

    if (format === 'html') {
      embedCode = `<!-- Ivory Choice Booking Widget for ${tech.businessName} -->
<div id="ivory-booking-widget" data-tech-id="${techId}"></div>
<script src="${baseUrl}/booking-widget.js"></script>
<script>
  // Widget will auto-initialize when DOM is ready
  // Or manually call: IvoryBooking.init();
</script>`;
    } else if (format === 'react') {
      embedCode = `// React component for Ivory Choice Booking Widget
import { useEffect } from 'react';

export function BookingWidget() {
  useEffect(() => {
    // Load the booking widget script
    const script = document.createElement('script');
    script.src = '${baseUrl}/booking-widget.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize the widget after script loads
      if (window.IvoryBooking) {
        window.IvoryBooking.init();
      }
    };

    return () => {
      // Cleanup script on unmount
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div 
      id="ivory-booking-widget" 
      data-tech-id="${techId}"
      style={{ maxWidth: '500px', margin: '0 auto' }}
    />
  );
}`;
    } else if (format === 'script') {
      embedCode = `<script>
(function() {
  // Create widget container
  const container = document.createElement('div');
  container.id = 'ivory-booking-widget';
  container.setAttribute('data-tech-id', '${techId}');
  
  // Insert into current script's parent
  const currentScript = document.currentScript;
  currentScript.parentNode.insertBefore(container, currentScript);
  
  // Load widget script
  const script = document.createElement('script');
  script.src = '${baseUrl}/booking-widget.js';
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
    }

    const response = NextResponse.json({
      techId,
      businessName: tech.businessName,
      embedCode,
      format,
      instructions: {
        html: 'Copy and paste this HTML code into your website where you want the booking widget to appear.',
        react: 'Use this React component in your Next.js or React application.',
        script: 'This script tag will automatically create and initialize the booking widget.'
      }[format],
      customization: {
        note: 'The widget automatically matches your website\'s booking system and calendar.',
        features: [
          'Service selection',
          'Real-time availability',
          'Guest booking (no account required)',
          'Mobile responsive design',
          'Automatic notifications to nail tech'
        ]
      }
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  } catch (error) {
    console.error('Error generating embed code:', error);
    const response = NextResponse.json({ error: 'Failed to generate embed code' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;
  }
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}