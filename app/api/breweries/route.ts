import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CreateBrewerySchema } from '@/lib/schemas/brewery'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse, distanceKm } from '@/lib/utils'
import type { Brewery } from '@/types'

// GET /api/breweries
// Public. Supports query params: city, lat, lng, radius, q, kid_friendly,
// dog_friendly, has_food, outdoor_seating, sober_options, full_bar
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = request.nextUrl

  const city = searchParams.get('city')
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null
  const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : 50
  const q = searchParams.get('q')

  let query = supabase
    .from('breweries')
    .select(`
      *,
      photos:brewery_photos(id, storage_path, is_primary, display_order),
      has_events:events(count)
    `)
    .eq('is_active', true)
    .order('name')

  // Text search
  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  // City filter
  if (city) {
    query = query.ilike('city', `%${city}%`)
  }

  // Boolean attribute filters
  const booleanFilters = [
    'kid_friendly', 'dog_friendly', 'has_food', 'has_food_trucks',
    'outdoor_seating', 'covered_outdoor', 'has_wine', 'full_bar', 'sober_options',
  ] as const

  for (const attr of booleanFilters) {
    if (searchParams.get(attr) === 'true') {
      query = query.eq(attr, true)
    }
  }

  const { data, error } = await query

  if (error) {
    return errorResponse('Failed to fetch breweries', 500)
  }

  // Normalize + compute distance if GPS provided
  let breweries = (data ?? []).map((row) => ({
    ...row,
    has_events: Array.isArray(row.has_events) && row.has_events.length > 0
      ? (row.has_events[0] as { count: number }).count > 0
      : false,
    photos: (row.photos ?? []).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order),
  })) as Brewery[]

  // Near Me: if GPS coords provided, filter by radius and sort by distance
  if (lat !== null && lng !== null) {
    breweries = breweries
      .filter((b) => {
        if (b.lat == null || b.lng == null) return false
        return distanceKm(lat, lng, b.lat, b.lng) <= radius
      })
      .map((b) => ({
        ...b,
        distance_km: distanceKm(lat, lng, b.lat!, b.lng!),
      }))
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0))
  }

  return successResponse(breweries)
}

// POST /api/breweries — admin only
export async function POST(request: NextRequest) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const body = await request.json()
  const parsed = CreateBrewerySchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('breweries')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return errorResponse('A brewery with this slug already exists', 409)
    }
    return errorResponse('Failed to create brewery', 500)
  }

  return successResponse(data, 201)
}
