// Simplified middleware - no NextAuth interference
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isLogin = path.startsWith('/admin/masuk')
  
  // Protect admin routes except login
  const token = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token')
  if (path.startsWith('/admin') && !isLogin) {
    if (!token) {
      const url = new URL('/admin/masuk', req.url)
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
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