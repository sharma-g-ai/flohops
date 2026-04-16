import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/utils'

type Ctx = { params: Promise<{ breweryId: string }> }

// POST /api/favorites/[breweryId] — add to favorites
export async function POST(_req: NextRequest, ctx: Ctx) {
  let userId: string
  try {
    const auth = await requireAuth()
    userId = auth.userId
  } catch (response) {
    return response as Response
  }

  const { breweryId } = await ctx.params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, brewery_id: breweryId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return errorResponse('Already in favorites', 409)
    }
    return errorResponse('Failed to add favorite', 500)
  }

  return successResponse(data, 201)
}

// DELETE /api/favorites/[breweryId] — remove from favorites
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  let userId: string
  try {
    const auth = await requireAuth()
    userId = auth.userId
  } catch (response) {
    return response as Response
  }

  const { breweryId } = await ctx.params
  const supabase = await createClient()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('brewery_id', breweryId)

  if (error) {
    return errorResponse('Failed to remove favorite', 500)
  }

  return new Response(null, { status: 204 })
}
