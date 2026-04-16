import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { UpdateBrewerySchema } from '@/lib/schemas/brewery'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/breweries/[id] — public
export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('breweries')
    .select(`
      *,
      photos:brewery_photos(id, storage_path, is_primary, display_order),
      events(id, title, start_at, end_at, is_recurring, is_active)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return errorResponse('Brewery not found', 404)
  }

  return successResponse(data)
}

// PUT /api/breweries/[id] — admin only
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = UpdateBrewerySchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('breweries')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return errorResponse('Failed to update brewery', 500)
  }

  return successResponse(data)
}

// DELETE /api/breweries/[id] — admin only (soft delete)
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id } = await ctx.params
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('breweries')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    return errorResponse('Failed to delete brewery', 500)
  }

  return new Response(null, { status: 204 })
}
