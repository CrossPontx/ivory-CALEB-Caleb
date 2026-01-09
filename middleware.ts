import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production');

// Routes that require authentication
const protectedRoutes = ['/home', '/capture', '/look', '/profile', '/send-to-tech', '/tech', '/billing', '/settings'];

// Public routes that don't require authentication (browsable without account per Apple Guideline 5.1.1)
const publicRoutes = ['/shared', '/explore', '/privacy-policy', '/terms'];



export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Verify session token and extract user info
  let isAuthenticated = false;
  let userId: string | null = null;
  
  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, secret);
      isAuthenticated = true;
      userId = payload.userId as string;
    } catch (error) {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // Create response with user ID header for API routes
  const response = NextResponse.next();
  if (userId && pathname.startsWith('/api/')) {
    response.headers.set('x-user-id', userId);
  }

  // Allow public routes without authentication
  if (isPublicRoute) {
    return response;
  }

  // Redirect to landing page if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth page to their dashboard
  if (pathname === '/auth' && isAuthenticated) {
    const url = new URL('/home', request.url);
    return NextResponse.redirect(url);
  }

  // Allow landing page (/) for both authenticated and unauthenticated users
  // This ensures users can browse the landing page freely per Apple Guideline 5.1.1

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
