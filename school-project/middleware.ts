import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and Next.js internals
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // Skip middleware for public routes
  if (
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/landing' ||
    request.nextUrl.pathname === '/auth'
  ) {
    return NextResponse.next()
  }

  // Update session for authenticated routes safely
  try {
    return await updateSession(request)
  } catch (error) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth page)
     * - landing (landing page)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth|landing).*)',
  ],
}