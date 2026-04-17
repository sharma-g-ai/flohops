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
// Must NOT use request cookies — passing a user session would cause @supabase/ssr
// to override the service role key with the user's JWT for all API calls.
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
