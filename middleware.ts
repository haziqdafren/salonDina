// Middleware for protecting admin routes and rate limiting
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Rate limiting for login attempts
    if (req.nextUrl.pathname === '/admin/masuk') {
      const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
      // In production, implement Redis-based rate limiting here
      console.log(`Login attempt from IP: ${ip}`)
    }

    // Security headers for admin pages
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const response = NextResponse.next()
      
      // Add security headers
      response.headers.set('X-Frame-Options', 'DENY')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
      
      return response
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all admin routes except login page
        if (req.nextUrl.pathname.startsWith('/admin') && 
            req.nextUrl.pathname !== '/admin/masuk') {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}