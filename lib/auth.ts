import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { UserRole } from '@/types'

// Verifies the session and returns the authenticated user + their role.
// Throws a Response with the appropriate HTTP status if auth fails.
// Use this at the top of every protected Route Handler.
export async function requireAuth(): Promise<{ userId: string; role: UserRole }> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignored — middleware handles session refresh
          }
        },
      },
    }
  )

  // getUser() hits the Auth server — safe for authorization decisions.
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch role from user_profiles using service role to bypass RLS
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )

  const { data: profile } = await adminSupabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role ?? 'consumer') as UserRole

  return { userId: user.id, role }
}

// Convenience: require a specific role. Throws 403 if role doesn't match.
export async function requireRole(requiredRole: UserRole): Promise<{ userId: string; role: UserRole }> {
  const auth = await requireAuth()

  if (auth.role !== requiredRole) {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return auth
}

// For public routes that optionally benefit from knowing the user.
export async function getOptionalUser(): Promise<{ userId: string | null; role: UserRole | null }> {
  try {
    const auth = await requireAuth()
    return auth
  } catch {
    return { userId: null, role: null }
  }
}
