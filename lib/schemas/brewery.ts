import { z } from 'zod'

const DayHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
})

const HoursSchema = z.object({
  mon: DayHoursSchema,
  tue: DayHoursSchema,
  wed: DayHoursSchema,
  thu: DayHoursSchema,
  fri: DayHoursSchema,
  sat: DayHoursSchema,
  sun: DayHoursSchema,
})

export const CreateBrewerySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('FL'),
  zip: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  hours: HoursSchema.optional(),
  kid_friendly: z.boolean().default(false),
  dog_friendly: z.boolean().default(false),
  has_food: z.boolean().default(false),
  has_food_trucks: z.boolean().default(false),
  outdoor_seating: z.boolean().default(false),
  covered_outdoor: z.boolean().default(false),
  has_wine: z.boolean().default(false),
  full_bar: z.boolean().default(false),
  sober_options: z.boolean().default(false),
})

export const UpdateBrewerySchema = CreateBrewerySchema.partial()

export type CreateBreweryInput = z.infer<typeof CreateBrewerySchema>
export type UpdateBreweryInput = z.infer<typeof UpdateBrewerySchema>
