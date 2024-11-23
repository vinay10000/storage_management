import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const appwriteSession = request.cookies.get('appwrite-session')
  
  // List of paths that don't require authentication
  const publicPaths = ['/sign-in', '/sign-up']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // If there's no session and trying to access protected route
  if (!appwriteSession && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // If there's a session and trying to access auth routes
  if (appwriteSession && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configure which paths should trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
