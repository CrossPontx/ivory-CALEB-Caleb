import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  
  // Check if this is a subdomain request
  if (hostname.includes('ivoryschoice.com') && !hostname.startsWith('www.') && !hostname.startsWith('ivoryschoice.com')) {
    const subdomain = hostname.split('.')[0];
    
    // Skip API routes and static files
    if (url.pathname.startsWith('/api') || 
        url.pathname.startsWith('/_next') || 
        url.pathname.includes('.')) {
      return NextResponse.next();
    }
    
    console.log(`Subdomain request: ${subdomain} -> ${url.pathname}`);
    
    // Rewrite to the subdomain handler
    url.pathname = `/subdomain/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};