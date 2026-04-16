import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { CreateEventSchema } from '@/lib/schemas/event'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'

// POST /api/events — admin only
export async function POST(request: NextRequest) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const body = await request.json()
  const parsed = CreateEventSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return errorResponse('Failed to create event', 500)
  }

  return successResponse(data, 201)
}
