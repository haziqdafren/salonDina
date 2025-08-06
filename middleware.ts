import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Middleware logic here if needed
    console.log('Middleware running for:', req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to admin pages only if user is authenticated
        if (req.nextUrl.pathname.startsWith('/admin')) {
          // Allow access to login page without authentication
          if (req.nextUrl.pathname === '/admin/masuk') {
            return true
          }
          // Require authentication for other admin pages
          return !!token
        }
        // Allow access to all other pages
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}