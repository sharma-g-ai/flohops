'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

interface Props {
  userProfile: UserProfile | null
}

export function Navbar({ userProfile }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-amber-700">
          <span aria-hidden="true">🍺</span>
          <span>FloHops</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-4">
          {userProfile?.role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-amber-700">
              Admin
            </Link>
          )}
          {userProfile?.role === 'brewery' && (
            <Link href="/my-brewery" className="text-sm font-medium text-gray-600 hover:text-amber-700">
              My Brewery
            </Link>
          )}

          {userProfile ? (
            <>
              <Link
                href="/favorites"
                className="text-sm font-medium text-gray-600 hover:text-amber-700"
              >
                ❤️ Favorites
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-amber-700"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
