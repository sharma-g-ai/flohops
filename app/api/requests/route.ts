import { NextRequest } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { SubmitRequestSchema } from '@/lib/schemas/request'
import { requireRole } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/utils'

// POST /api/requests — any user including anonymous
export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = SubmitRequestSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0].message, 400)
  }

  const supabase = await createClient()

  // Get current user if logged in (optional)
  const { data: { user } } = await supabase.auth.getUser()

  const adminSupabase = await createAdminClient()
  const { data, error } = await adminSupabase
    .from('change_requests')
    .insert({
      ...parsed.data,
      submitted_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error) {
    return errorResponse('Failed to submit request', 500)
  }

  return successResponse(data, 201)
}

// GET /api/requests — admin only
export async function GET(request: NextRequest) {
  try {
    await requireRole('admin')
  } catch (response) {
    return response as Response
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') ?? 'pending'

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('change_requests')
    .select(`
      *,
      brewery:breweries(id, name, slug)
    `)
    .eq('status', status)
    .order('created_at', { ascending: true })

  if (error) {
    return errorResponse('Failed to fetch requests', 500)
  }

  return successResponse(data ?? [])
}
