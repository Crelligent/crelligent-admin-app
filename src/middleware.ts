import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('admin_auth')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If there's no auth cookie and we are not on the login page, redirect to /login
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If there is an auth cookie and we are on the login page, redirect to dashboard
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Apply middleware to all routes except api, _next static files, images, icons
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.svg$).*)'],
}
