import { createBrowserClient } from '@supabase/ssr'

// Singleton browser client — safe to call multiple times in Client Components.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { isSingleton: true }
  )
}
