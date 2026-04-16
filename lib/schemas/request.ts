import { z } from 'zod'

export const SubmitRequestSchema = z.object({
  type: z.enum(['correction', 'profile_update', 'event_request']),
  brewery_id: z.string().uuid(),
  submitter_name: z.string().optional(),
  submitter_email: z.string().email().optional(),
  payload: z.record(z.string(), z.unknown()),
})

export const ReviewRequestSchema = z.object({
  admin_notes: z.string().optional(),
})

export type SubmitRequestInput = z.infer<typeof SubmitRequestSchema>
export type ReviewRequestInput = z.infer<typeof ReviewRequestSchema>
