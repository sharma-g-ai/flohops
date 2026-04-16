import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/common/Navbar'
import { BreweryCard } from '@/components/brewery/BreweryCard'
import type { Brewery } from '@/types'

export const metadata = { title: 'My Favorites' }

export default async function FavoritesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/favorites')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, role, brewery_id, created_at')
    .eq('id', user.id)
    .single()

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      brewery_id,
      created_at,
      brewery:breweries(
        *,
        photos:brewery_photos(id, storage_path, is_primary, display_order),
        has_events:events(count)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const breweries = (favorites ?? [])
    .map((f) => {
      const b = (Array.isArray(f.brewery) ? f.brewery[0] : f.brewery) as (Brewery & { has_events: { count: number }[] }) | null
      if (!b) return null
      return {
        ...b,
        has_events: Array.isArray(b.has_events) && b.has_events.length > 0
          ? b.has_events[0].count > 0
          : false,
        photos: (b.photos ?? []).sort(
          (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
        ),
      } as Brewery
    })
    .filter(Boolean) as Brewery[]

  return (
    <>
      <Navbar userProfile={profile} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">❤️ My Favorites</h1>

        {breweries.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-4xl">🤍</p>
            <p className="mt-2 text-lg font-medium">No favorites yet</p>
            <p className="text-sm">Browse breweries and tap the heart to save them here.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {breweries.map((brewery) => (
              <BreweryCard key={brewery.id} brewery={brewery} isFavorited />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
