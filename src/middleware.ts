import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes
        if (pathname.startsWith('/auth/')) {
          return true
        }
        
        // Protected routes require token
        if (pathname.startsWith('/dashboard') || 
            pathname.startsWith('/transactions') || 
            pathname.startsWith('/analytics')) {
          return !!token
        }
        
        return true
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
