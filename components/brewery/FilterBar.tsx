'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { ATTRIBUTE_CONFIG } from './AttributeIcon'

// The subset of attribute keys we expose as filters on the browse page
const FILTER_KEYS = [
  'kid_friendly',
  'dog_friendly',
  'has_food',
  'has_food_trucks',
  'outdoor_seating',
  'covered_outdoor',
  'has_wine',
  'full_bar',
  'sober_options',
] as const

type FilterKey = typeof FILTER_KEYS[number]

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeFilters = new Set(
    FILTER_KEYS.filter((key) => searchParams.get(key) === 'true')
  )

  const toggle = useCallback(
    (key: FilterKey) => {
      const params = new URLSearchParams(searchParams.toString())
      if (params.get(key) === 'true') {
        params.delete(key)
      } else {
        params.set(key, 'true')
      }
      // Reset to page 1 when filters change
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    FILTER_KEYS.forEach((key) => params.delete(key))
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const visibleConfig = ATTRIBUTE_CONFIG.filter((a) =>
    FILTER_KEYS.includes(a.key as FilterKey)
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleConfig.map(({ key, icon, label }) => {
        const active = activeFilters.has(key as FilterKey)
        return (
          <button
            key={key}
            onClick={() => toggle(key as FilterKey)}
            aria-pressed={active}
            className={[
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition',
              active
                ? 'border-amber-400 bg-amber-100 text-amber-900'
                : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50',
            ].join(' ')}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        )
      })}

      {activeFilters.size > 0 && (
        <button
          onClick={clearAll}
          className="text-sm text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
