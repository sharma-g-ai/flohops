import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server client for use in Server Components and Route Handlers.
// Creates a new client per request — never share across requests.
// Uses getAll/setAll (not deprecated get/set/remove).
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
            // setAll called from a Server Component — cookies cannot be set.
            // Middleware handles session refresh, so this is safe to ignore.
          }
        },
      },
    }
  )
}

// Admin client using the service role key — bypasses RLS.
// Only use in Route Handlers that enforce role checks manually.
export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
            // intentionally ignored — see note above
          }
        },
      },
    }
  )
}
