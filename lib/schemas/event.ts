import { z } from 'zod'

export const CreateEventSchema = z.object({
  brewery_id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_at: z.string().datetime().optional(),
  end_at: z.string().datetime().optional(),
  is_recurring: z.boolean().default(false),
  recurrence_rule: z.string().optional(),
})

export const UpdateEventSchema = CreateEventSchema.omit({ brewery_id: true }).partial()

export type CreateEventInput = z.infer<typeof CreateEventSchema>
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>
