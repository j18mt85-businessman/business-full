import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes: all dashboard routes require authentication
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/sign-up-success')

  const isPublicPage = request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/auth/') ||
    isAuthPage

  if (!user && !isPublicPage) {
    // No user and trying to access protected route -> redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (isAuthPage || request.nextUrl.pathname === '/')) {
    // User is logged in on auth page or root -> find their branch and redirect to dashboard
    try {
      // Try profile_branches first
      const { data: pb } = await supabase
        .from('profile_branches')
        .select('branch_id')
        .eq('profile_id', user.id)
        .limit(1)
        .single()

      if (pb?.branch_id) {
        const url = request.nextUrl.clone()
        url.pathname = `/${pb.branch_id}`
        return NextResponse.redirect(url)
      }

      // Fallback: get branch from company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

      if (profile?.company_id) {
        const { data: branch } = await supabase
          .from('branches')
          .select('id')
          .eq('company_id', profile.company_id)
          .eq('is_active', true)
          .limit(1)
          .single()

        if (branch?.id) {
          const url = request.nextUrl.clone()
          url.pathname = `/${branch.id}`
          return NextResponse.redirect(url)
        }
      }
    } catch (e) {
      // If DB query fails, let the request through to root page fallback
      console.error('[v0] Middleware branch lookup failed:', e)
    }
  }

  return supabaseResponse
}
