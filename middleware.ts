import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Skip if it's the main domain or www
  if (subdomain === 'ivoryschoice' || subdomain === 'www' || !hostname.includes('ivoryschoice.com')) {
    return NextResponse.next();
  }
  
  // This is a potential nail tech subdomain
  console.log(`Subdomain detected: ${subdomain}`);
  
  // For now, just continue to main site
  // Later we'll add: return NextResponse.rewrite(new URL(`/tech-website/${subdomain}`, request.url));
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};