'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Brewery } from '@/types'
import { generateSlug } from '@/lib/utils'

interface Props {
  brewery?: Brewery
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map((d) => [d, { open: '11:00', close: '22:00', closed: false }])
)

const ATTRIBUTES = [
  { key: 'kid_friendly',    label: '🧒 Kid-Friendly' },
  { key: 'dog_friendly',    label: '🐶 Dog-Friendly' },
  { key: 'has_food',        label: '🍽️ Food' },
  { key: 'has_food_trucks', label: '🌮 Food Trucks' },
  { key: 'outdoor_seating', label: '🌿 Outdoor Seating' },
  { key: 'covered_outdoor', label: '⛱️ Covered Outdoor' },
  { key: 'has_wine',        label: '🍷 Wine' },
  { key: 'full_bar',        label: '🍸 Full Bar' },
  { key: 'sober_options',   label: '🫗 Sober Options' },
] as const

export function BreweryForm({ brewery }: Props) {
  const router = useRouter()
  const isEdit = !!brewery

  const [name, setName] = useState(brewery?.name ?? '')
  const [slug, setSlug] = useState(brewery?.slug ?? '')
  const [description, setDescription] = useState(brewery?.description ?? '')
  const [address, setAddress] = useState(brewery?.address ?? '')
  const [city, setCity] = useState(brewery?.city ?? '')
  const [zip, setZip] = useState(brewery?.zip ?? '')
  const [lat, setLat] = useState(brewery?.lat?.toString() ?? '')
  const [lng, setLng] = useState(brewery?.lng?.toString() ?? '')
  const [phone, setPhone] = useState(brewery?.phone ?? '')
  const [website, setWebsite] = useState(brewery?.website ?? '')
  const [isActive, setIsActive] = useState(brewery?.is_active ?? true)

  const [attrs, setAttrs] = useState<Record<string, boolean>>(
    Object.fromEntries(ATTRIBUTES.map(({ key }) => [key, brewery?.[key] ?? false]))
  )

  const [hours, setHours] = useState(brewery?.hours ?? DEFAULT_HOURS)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEdit) setSlug(generateSlug(val))
  }

  const setHour = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHours((h) => ({ ...h, [day]: { ...h[day as keyof typeof h], [field]: value } }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const body = {
      name, slug, description, address, city, state: 'FL', zip,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      phone, website, is_active: isActive, hours,
      ...attrs,
    }

    const url = isEdit ? `/api/breweries/${brewery.id}` : '/api/breweries'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to save brewery')
      return
    }

    router.push('/admin/breweries')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!brewery || !confirm(`Archive "${brewery.name}"? It will be hidden from the public.`)) return
    await fetch(`/api/breweries/${brewery.id}`, { method: 'DELETE' })
    router.push('/admin/breweries')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {/* Basic info */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Info</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
            <input required value={name} onChange={(e) => handleNameChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Slug *</label>
            <input required value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-amber-400" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 accent-amber-600" />
          <label htmlFor="is_active" className="text-sm text-gray-700">Active (visible to public)</label>
        </div>
      </section>

      {/* Location */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Location</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">ZIP</label>
            <input value={zip} onChange={(e) => setZip(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Latitude</label>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Longitude</label>
            <input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
        </div>
      </section>

      {/* Attributes */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Amenities</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ATTRIBUTES.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={attrs[key] ?? false}
                onChange={(e) => setAttrs((a) => ({ ...a, [key]: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 accent-amber-600"
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      {/* Hours */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Hours</h2>
        {DAYS.map((day) => {
          const h = hours[day] ?? { open: '11:00', close: '22:00', closed: false }
          return (
            <div key={day} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 font-medium text-gray-700">{DAY_LABELS[day]}</span>
              <input type="checkbox" checked={h.closed}
                onChange={(e) => setHour(day, 'closed', e.target.checked)}
                className="h-4 w-4 accent-amber-600" />
              <span className="text-gray-400 text-xs">Closed</span>
              {!h.closed && (
                <>
                  <input type="time" value={h.open} onChange={(e) => setHour(day, 'open', e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-amber-400" />
                  <span className="text-gray-400">–</span>
                  <input type="time" value={h.close} onChange={(e) => setHour(day, 'close', e.target.value)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-amber-400" />
                </>
              )}
            </div>
          )
        })}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Brewery'}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            Archive
          </button>
        )}
      </div>
    </form>
  )
}
