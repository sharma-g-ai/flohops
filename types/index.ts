// ─── Core domain types ────────────────────────────────────────────────────

export type UserRole = 'admin' | 'brewery' | 'consumer'

export interface UserProfile {
  id: string
  role: UserRole
  brewery_id: string | null
  created_at: string
}

// ─── Brewery ───────────────────────────────────────────────────────────────

export interface BreweryHours {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export interface DayHours {
  open: string   // e.g. "11:00"
  close: string  // e.g. "22:00"
  closed: boolean
}

export interface Brewery {
  id: string
  name: string
  slug: string
  description: string | null
  address: string | null
  city: string | null
  state: string
  zip: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  website: string | null
  hours: BreweryHours | null
  // Attributes
  kid_friendly: boolean
  dog_friendly: boolean
  has_food: boolean
  has_food_trucks: boolean
  outdoor_seating: boolean
  covered_outdoor: boolean
  has_wine: boolean
  full_bar: boolean
  sober_options: boolean
  // Meta
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined
  photos?: BreweryPhoto[]
  has_events?: boolean
  distance_km?: number  // populated when Near Me search is used
}

export interface BreweryPhoto {
  id: string
  brewery_id: string
  storage_path: string
  is_primary: boolean
  display_order: number
  created_at: string
  // Computed
  url?: string
}

// ─── Events ────────────────────────────────────────────────────────────────

export interface BreweryEvent {
  id: string
  brewery_id: string
  title: string
  description: string | null
  start_at: string | null
  end_at: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Favorites ─────────────────────────────────────────────────────────────

export interface Favorite {
  id: string
  user_id: string
  brewery_id: string
  created_at: string
  brewery?: Brewery
}

// ─── Change Requests (Admin Queue) ─────────────────────────────────────────

export type RequestType = 'correction' | 'profile_update' | 'event_request'
export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface ChangeRequest {
  id: string
  type: RequestType
  status: RequestStatus
  brewery_id: string
  submitted_by: string | null
  submitter_name: string | null
  submitter_email: string | null
  payload: Record<string, unknown>
  admin_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  brewery?: Pick<Brewery, 'id' | 'name' | 'slug'>
}

// ─── API response shapes ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error?: never
}

export interface ApiError {
  data?: never
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Filter / search params ─────────────────────────────────────────────────

export interface BreweryFilters {
  city?: string
  lat?: number
  lng?: number
  radius?: number        // km
  q?: string            // text search
  kid_friendly?: boolean
  dog_friendly?: boolean
  has_food?: boolean
  outdoor_seating?: boolean
  sober_options?: boolean
  full_bar?: boolean
}
