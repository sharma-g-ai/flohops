// ─── Slug generation ──────────────────────────────────────────────────────

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')  // remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-')   // spaces and underscores → hyphens
    .replace(/-+/g, '-')       // collapse multiple hyphens
    .replace(/^-|-$/g, '')     // trim leading/trailing hyphens
}

// ─── Distance calculation (Haversine formula) ─────────────────────────────

export function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// ─── Hours formatting ─────────────────────────────────────────────────────

export function formatTime(time: string): string {
  // Converts "14:00" → "2:00 PM"
  const [hourStr, minute] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${period}`
}

export const DAY_LABELS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

// ─── Supabase Storage public URL ─────────────────────────────────────────

export function getStorageUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  return `${supabaseUrl}/storage/v1/object/public/brewery-photos/${storagePath}`
}

// ─── API helpers ──────────────────────────────────────────────────────────

export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status })
}

export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status })
}
