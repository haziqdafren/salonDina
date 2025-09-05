// Simplified middleware for Vercel Edge Runtime compatibility
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isLogin = path.startsWith('/admin/masuk') || path.startsWith('/admin/login-new') || path.startsWith('/admin/test-login')
  const isApiTest = path.startsWith('/api/test-admin') || path.startsWith('/api/create-admin') || path.startsWith('/api/health')
  const isApiAuth = path.startsWith('/api/auth/')
  
  // Redirect old login to new login
  if (path === '/admin/masuk') {
    return NextResponse.redirect(new URL('/admin/login-new', req.url))
  }
  
  // Allow API test endpoints and auth endpoints
  if (isApiTest || isApiAuth) {
    return NextResponse.next()
  }
  
  // For admin routes, let the client-side handle auth checking
  // This avoids Edge Runtime compatibility issues with JWT
  if (path.startsWith('/admin') && !isLogin) {
    // Check if auth token exists (basic check)
    const token = req.cookies.get('auth-token')?.value
    
    if (!token) {
      const url = new URL('/admin/login-new', req.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
    
    // Let the client-side AdminLayout handle JWT verification
    // This avoids Edge Runtime issues with jsonwebtoken
  }

  // Handle simple redirects
  const redirectMap: Record<string, string> = {
    '/admin/kelola-therapist': '/admin/therapists',
    '/admin/pembukuan-bulanan': '/admin/reports',
    '/admin/kelola-customer': '/admin/customers',
    '/admin/kelola-layanan': '/admin/treatments',
    '/admin/manajemen-booking': '/admin/bookings',
    '/admin/pengaturan': '/admin/settings'
  }
  
  if (redirectMap[path]) {
    console.log(`🔄 Redirecting ${path} to ${redirectMap[path]}`)
    return NextResponse.redirect(new URL(redirectMap[path], req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}