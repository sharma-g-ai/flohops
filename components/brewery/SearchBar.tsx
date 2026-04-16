'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [city, setCity] = useState(searchParams.get('city') ?? '')
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const applyCity = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (city.trim()) {
      params.set('city', city.trim())
    } else {
      params.delete('city')
    }
    // Clear GPS params if searching by city
    params.delete('lat')
    params.delete('lng')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [city, router, pathname, searchParams])

  const useNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('lat', pos.coords.latitude.toString())
        params.set('lng', pos.coords.longitude.toString())
        params.delete('city')
        params.delete('page')
        setLocating(false)
        setCity('')
        router.push(`${pathname}?${params.toString()}`)
      },
      () => {
        setGeoError('Unable to get your location. Please allow location access and try again.')
        setLocating(false)
      }
    )
  }, [router, pathname, searchParams])

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyCity()}
          placeholder="Search by city…"
          className="flex-1 px-4 py-2.5 text-sm outline-none placeholder:text-gray-400"
        />
        <button
          onClick={applyCity}
          className="border-l border-gray-200 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50"
        >
          Search
        </button>
      </div>

      <button
        onClick={useNearMe}
        disabled={locating}
        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-amber-50 hover:border-amber-300 disabled:opacity-60"
      >
        <span aria-hidden="true">📍</span>
        {locating ? 'Locating…' : 'Near Me'}
      </button>

      {geoError && (
        <p className="text-xs text-red-500 sm:col-span-2">{geoError}</p>
      )}
    </div>
  )
}
