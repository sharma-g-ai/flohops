import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

// All /admin/* pages are guarded here in addition to middleware.
// This double-check ensures the role is verified at the layout level too.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  const navLinks = [
    { href: '/admin/queue',      label: '📥 Queue' },
    { href: '/admin/breweries',  label: '🏭 Breweries' },
    { href: '/admin/events',     label: '🎉 Events' },
    { href: '/admin/users',      label: '👤 Users' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-100 bg-gray-50 lg:flex lg:flex-col">
        <div className="border-b border-gray-100 px-5 py-4">
          <Link href="/" className="text-lg font-bold text-amber-700">🍺 FloHops</Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-amber-50 hover:text-amber-800"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-100 px-5 py-4">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
            ← View site
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/" className="text-base font-bold text-amber-700">🍺 FloHops Admin</Link>
        <nav className="flex gap-2">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className="text-xs text-gray-600 hover:text-amber-700">
              {label.split(' ')[0]}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto px-4 py-8 pt-20 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
