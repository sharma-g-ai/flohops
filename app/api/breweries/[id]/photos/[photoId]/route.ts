import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string; photoId: string }> }

// PUT /api/breweries/[id]/photos/[photoId] — set primary or update display_order
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id: breweryId, photoId } = await ctx.params
  const body = await request.json() as { is_primary?: boolean; display_order?: number }
  const supabase = await createAdminClient()

  // If setting as primary, clear all other photos' primary flag first
  if (body.is_primary) {
    await supabase
      .from('brewery_photos')
      .update({ is_primary: false })
      .eq('brewery_id', breweryId)
  }

  const { data, error } = await supabase
    .from('brewery_photos')
    .update(body)
    .eq('id', photoId)
    .eq('brewery_id', breweryId)
    .select()
    .single()

  if (error || !data) {
    return errorResponse('Failed to update photo', 500)
  }

  return successResponse(data)
}

// DELETE /api/breweries/[id]/photos/[photoId]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id: breweryId, photoId } = await ctx.params
  const supabase = await createAdminClient()

  // Get storage path before deleting the record
  const { data: photo } = await supabase
    .from('brewery_photos')
    .select('storage_path, is_primary')
    .eq('id', photoId)
    .eq('brewery_id', breweryId)
    .single()

  if (!photo) {
    return errorResponse('Photo not found', 404)
  }

  // Delete from Storage
  await supabase.storage.from('brewery-photos').remove([photo.storage_path])

  // Delete the DB record
  const { error } = await supabase
    .from('brewery_photos')
    .delete()
    .eq('id', photoId)

  if (error) {
    return errorResponse('Failed to delete photo', 500)
  }

  // If the deleted photo was primary, promote the next one
  if (photo.is_primary) {
    const { data: next } = await supabase
      .from('brewery_photos')
      .select('id')
      .eq('brewery_id', breweryId)
      .order('display_order')
      .limit(1)
      .single()

    if (next) {
      await supabase
        .from('brewery_photos')
        .update({ is_primary: true })
        .eq('id', next.id)
    }
  }

  return new Response(null, { status: 204 })
}
