/**
 * CALL TIMES - Middleware Multi-Level Access Control
 * 
 * Protège les routes selon le type d'utilisateur :
 * - Membres org : accès dashboard, projects, contacts, call sheets
 * - Guests projet : accès seulement aux projets invités (lecture seule)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const path = req.nextUrl.pathname

  // Routes publiques (pas besoin d'auth)
  const publicRoutes = [
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
    '/invite/', // Toutes les invitations (org + projet)
    '/_next',
    '/api',
    '/favicon',
    '/auth/no-access',
    '/legal/', // Pages légales (privacy, terms, cookies)
  ]

  // Landing page (racine uniquement)
  if (path === '/') {
    return res
  }

  if (publicRoutes.some(route => path.startsWith(route))) {
    return res
  }

  // Routes projet accessibles aux guests avec token (pas de vérification auth)
  const projectMatch = path.match(/^\/projects\/([a-f0-9-]+)/)
  if (projectMatch) {
    // Laisser passer, le composant vérifiera le token guest ou l'auth
    return res
  }

  // Récupérer l'utilisateur (getUser est plus fiable que getSession dans le middleware)
  console.log('🔍 Middleware: Checking auth for path:', path)
  console.log('🔍 Cookies available:', req.cookies.getAll().map(c => c.name))
  
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  console.log('🔍 Auth result:', { 
    hasUser: !!user, 
    error: authError?.message,
    userId: user?.id 
  })

  // Rediriger vers login si pas authentifié
  if (!user || authError) {
    console.log('🔒 Middleware: No user found, redirecting to login from:', path)
    console.log('🔒 Error details:', authError)
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', path)
    return NextResponse.redirect(redirectUrl)
  }

  console.log('✅ Middleware: User authenticated:', user.email, 'accessing:', path)

  const userId = user.id

  // Routes réservées aux membres organisation UNIQUEMENT
  const orgOnlyRoutes = [
    '/dashboard',
    '/projects',
    '/contacts',
    '/settings/team',
    '/call-sheets'
  ]

  const isOrgOnlyRoute = orgOnlyRoutes.some(route => path.startsWith(route))

  if (isOrgOnlyRoute) {
    // Vérifier si l'utilisateur est membre d'une organisation
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!membership) {
      // Pas membre d'une org → vérifier s'il a des invitations projet
      const { data: projectAccess } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', userId)
        .limit(1)
        .single()

      if (projectAccess) {
        // Rediriger vers son premier projet
        return NextResponse.redirect(new URL(`/projects/${projectAccess.project_id}`, req.url))
      }

      // Aucun accès → erreur 403
      return NextResponse.redirect(new URL('/auth/no-access', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

