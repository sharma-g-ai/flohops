import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'
import { randomUUID } from 'crypto'

type Ctx = { params: Promise<{ id: string }> }

// POST /api/breweries/[id]/photos — admin only, multipart upload
export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id: breweryId } = await ctx.params
  const supabase = createAdminClient()

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return errorResponse('No file provided', 400)
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp']
  if (!allowedExts.includes(ext)) {
    return errorResponse('Only jpg, png, and webp files are allowed', 400)
  }

  const storagePath = `${breweryId}/${randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from('brewery-photos')
    .upload(storagePath, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    return errorResponse('Failed to upload photo', 500)
  }

  // Check if this is the first photo — make it primary automatically
  const { count } = await supabase
    .from('brewery_photos')
    .select('id', { count: 'exact', head: true })
    .eq('brewery_id', breweryId)

  const isPrimary = count === 0

  const { data, error } = await supabase
    .from('brewery_photos')
    .insert({ brewery_id: breweryId, storage_path: storagePath, is_primary: isPrimary })
    .select()
    .single()

  if (error) {
    return errorResponse('Failed to save photo record', 500)
  }

  return successResponse(data, 201)
}
