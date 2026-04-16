import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { ReviewRequestSchema } from '@/lib/schemas/request'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string }> }

// PUT /api/requests/[id]/reject — admin only
export async function PUT(request: NextRequest, ctx: Ctx) {
  let userId: string
  try {
    const auth = await requireRole('admin')
    userId = auth.userId
  } catch (response) {
    return response as Response
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = ReviewRequestSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('change_requests')
    .update({
      status: 'rejected',
      admin_notes: parsed.data.admin_notes ?? null,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return errorResponse('Failed to reject request', 500)
  }

  return successResponse(data)
}
