import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Verifier si Supabase est configure
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('[WARNING] Supabase not configured - auth middleware disabled')
    return NextResponse.next()
  }

  console.log(`[MIDDLEWARE] ${request.method} ${request.nextUrl.pathname}`)

  // Routes publiques (pas besoin d'auth)
  const publicRoutes = ['/auth/login', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname)
  
  // SIMPLIFICATION: Routes publiques passent sans verification
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Pour toutes les autres routes, rediriger vers dashboard pour le moment
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Laisser passer toutes les autres routes sans verification
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
