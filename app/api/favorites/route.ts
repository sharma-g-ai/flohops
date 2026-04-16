import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/utils'

// GET /api/favorites — authenticated user's favorites
export async function GET() {
  let userId: string
  try {
    const auth = await requireAuth()
    userId = auth.userId
  } catch (response) {
    return response as Response
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      brewery_id,
      created_at,
      brewery:breweries(
        id, name, slug, city, kid_friendly, dog_friendly, has_food,
        has_food_trucks, outdoor_seating, covered_outdoor, has_wine,
        full_bar, sober_options,
        photos:brewery_photos(id, storage_path, is_primary, display_order)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return errorResponse('Failed to fetch favorites', 500)
  }

  return successResponse(data ?? [])
}
