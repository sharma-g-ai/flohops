import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/utils'

// GET /api/users — admin only
export async function GET() {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const supabase = await createAdminClient()

  // Join user_profiles with auth.users via the Supabase admin auth API
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      role,
      brewery_id,
      created_at,
      brewery:breweries(id, name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return errorResponse('Failed to fetch users', 500)
  }

  return successResponse(profiles ?? [])
}
