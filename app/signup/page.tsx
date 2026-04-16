'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'consumer' | 'brewery'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('consumer')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Pass the chosen role in user metadata — the Postgres trigger reads it
    const { error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <div className="mb-6 text-center">
          <Link href="/" className="text-2xl font-bold text-amber-700">🍺 FloHops</Link>
          <h1 className="mt-2 text-xl font-semibold text-gray-900">Create an account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">I am a…</p>
            <div className="grid grid-cols-2 gap-2">
              {(['consumer', 'brewery'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={[
                    'rounded-xl border py-2.5 text-sm font-medium transition',
                    role === r
                      ? 'border-amber-400 bg-amber-50 text-amber-900'
                      : 'border-gray-200 text-gray-600 hover:border-amber-300',
                  ].join(' ')}
                >
                  {r === 'consumer' ? '🍺 Beer Lover' : '🏭 Brewery'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
            <p className="mt-1 text-xs text-gray-400">Minimum 8 characters</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-amber-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
