import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only check auth routes in production
  if (request.nextUrl.pathname.startsWith('/api/auth') && process.env.NODE_ENV === 'production') {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXTAUTH_SECRET) {
      console.error('Missing required environment variables for authentication')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/auth/:path*'
}