import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { UpdateEventSchema } from '@/lib/schemas/event'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string }> }

// PUT /api/events/[id] — admin only
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = UpdateEventSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return errorResponse('Failed to update event', 500)
  }

  return successResponse(data)
}

// DELETE /api/events/[id] — admin only
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id } = await ctx.params
  const supabase = await createAdminClient()

  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) {
    return errorResponse('Failed to delete event', 500)
  }

  return new Response(null, { status: 204 })
}
