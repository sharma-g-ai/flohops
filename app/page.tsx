import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/common/Navbar'
import { BreweryGrid } from '@/components/brewery/BreweryGrid'
import { FilterBar } from '@/components/brewery/FilterBar'
import { SearchBar } from '@/components/brewery/SearchBar'
import { distanceKm } from '@/lib/utils'
import type { Brewery } from '@/types'

interface SearchParams {
  city?: string
  lat?: string
  lng?: string
  kid_friendly?: string
  dog_friendly?: string
  has_food?: string
  has_food_trucks?: string
  outdoor_seating?: string
  covered_outdoor?: string
  has_wine?: string
  full_bar?: string
  sober_options?: string
  q?: string
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Load user profile for nav + favorites
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile = null
  let favoritedIds: string[] = []
  if (user) {
    const [profileRes, favoritesRes] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('id, role, brewery_id, created_at')
        .eq('id', user.id)
        .single(),
      supabase
        .from('favorites')
        .select('brewery_id')
        .eq('user_id', user.id),
    ])
    userProfile = profileRes.data
    favoritedIds = (favoritesRes.data ?? []).map((f) => f.brewery_id)
  }

  // Build query
  let query = supabase
    .from('breweries')
    .select(`
      *,
      photos:brewery_photos(id, storage_path, is_primary, display_order),
      has_events:events(count)
    `)
    .eq('is_active', true)
    .order('name')

  if (params.q) query = query.ilike('name', `%${params.q}%`)
  if (params.city) query = query.ilike('city', `%${params.city}%`)

  const booleanFilters = [
    'kid_friendly', 'dog_friendly', 'has_food', 'has_food_trucks',
    'outdoor_seating', 'covered_outdoor', 'has_wine', 'full_bar', 'sober_options',
  ] as const

  for (const attr of booleanFilters) {
    if (params[attr] === 'true') {
      query = query.eq(attr, true)
    }
  }

  const { data: rows } = await query

  const lat = params.lat ? parseFloat(params.lat) : null
  const lng = params.lng ? parseFloat(params.lng) : null

  let breweries = (rows ?? []).map((row) => ({
    ...row,
    has_events: Array.isArray(row.has_events) && row.has_events.length > 0
      ? (row.has_events[0] as { count: number }).count > 0
      : false,
    photos: (row.photos ?? []).sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    ),
  })) as Brewery[]

  if (lat !== null && lng !== null) {
    breweries = breweries
      .filter((b) => b.lat != null && b.lng != null && distanceKm(lat, lng, b.lat!, b.lng!) <= 80)
      .map((b) => ({ ...b, distance_km: distanceKm(lat, lng, b.lat!, b.lng!) }))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
  }

  const isNearMe = lat !== null && lng !== null

  return (
    <>
      <Navbar userProfile={userProfile} />

      {/* Hero band */}
      <div className="bg-linear-to-b from-amber-50 to-transparent pb-10 pt-12 text-center">
        <p className="mb-2 text-3xl">🍺</p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Discover Central Florida Breweries
        </h1>
        <p className="mt-2 text-base text-gray-500">
          Find your next craft beer adventure — filter by what matters to you.
        </p>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-12">
        {/* Search + Filters */}
        <div className="mb-6 space-y-3">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {/* Results count */}
        <p className="mb-4 text-sm text-gray-500">
          {isNearMe
            ? `${breweries.length} breweries near you`
            : `${breweries.length} ${breweries.length === 1 ? 'brewery' : 'breweries'} found`}
        </p>

        {/* Grid */}
        <BreweryGrid
          breweries={breweries}
          initialFavoritedIds={favoritedIds}
          isLoggedIn={!!user}
        />
      </main>
    </>
  )
}
