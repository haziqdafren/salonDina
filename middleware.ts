// Simplified middleware - no NextAuth interference
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  // Only handle URL redirects, no auth protection for now
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