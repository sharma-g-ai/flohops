import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/utils'

type Ctx = { params: Promise<{ id: string }> }

const UpdateRoleSchema = z.object({
  role: z.enum(['admin', 'brewery', 'consumer']),
  brewery_id: z.string().uuid().nullable().optional(),
})

// PUT /api/users/[id]/role — admin only
export async function PUT(request: NextRequest, ctx: Ctx) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = UpdateRoleSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    return errorResponse('Failed to update user role', 500)
  }

  return successResponse(data)
}
