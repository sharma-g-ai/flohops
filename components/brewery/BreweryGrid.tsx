'use client'

import { useState } from 'react'
import { BreweryCard } from './BreweryCard'
import type { Brewery } from '@/types'

interface Props {
  breweries: Brewery[]
  initialFavoritedIds: string[]
  isLoggedIn: boolean
}

export function BreweryGrid({ breweries, initialFavoritedIds, isLoggedIn }: Props) {
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(
    new Set(initialFavoritedIds)
  )

  const handleToggleFavorite = async (breweryId: string) => {
    const wasFavorited = favoritedIds.has(breweryId)

    // Optimistic update
    setFavoritedIds((prev) => {
      const next = new Set(prev)
      if (wasFavorited) next.delete(breweryId)
      else next.add(breweryId)
      return next
    })

    const res = await fetch(`/api/favorites/${breweryId}`, {
      method: wasFavorited ? 'DELETE' : 'POST',
    })

    // Roll back on failure
    if (!res.ok) {
      setFavoritedIds((prev) => {
        const next = new Set(prev)
        if (wasFavorited) next.add(breweryId)
        else next.delete(breweryId)
        return next
      })
    }
  }

  if (breweries.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-4xl">🍺</p>
        <p className="mt-2 text-lg font-medium">No breweries found</p>
        <p className="text-sm">Try adjusting your filters or search term.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {breweries.map((brewery) => (
        <BreweryCard
          key={brewery.id}
          brewery={brewery}
          isFavorited={favoritedIds.has(brewery.id)}
          onToggleFavorite={isLoggedIn ? handleToggleFavorite : undefined}
        />
      ))}
    </div>
  )
}
