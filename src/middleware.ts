import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = [
    '/production',
    '/dashboard',
    '/projects',
    '/settings',
    '/admin',
];

// Routes that should redirect to /production if already authenticated
const authRoutes = [
    '/login',
];

// Public routes that don't need any checks
const publicRoutes = [
    '/',
    '/api',
    '/review',
    '/_next',
    '/favicon.ico',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Skip middleware for public routes and API routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }
    
    // Get the session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });
    
    const isAuthenticated = !!token;
    
    // Check if accessing a protected route without authentication
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }
    
    // Check if accessing auth routes while authenticated
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/production', request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
