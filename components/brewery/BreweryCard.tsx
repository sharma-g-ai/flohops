import Link from 'next/link'
import Image from 'next/image'
import type { Brewery } from '@/types'
import { AttributeIcon } from './AttributeIcon'
import { getStorageUrl } from '@/lib/utils'

interface Props {
  brewery: Brewery
  isFavorited?: boolean
  onToggleFavorite?: (breweryId: string) => void
  priority?: boolean
}

export function BreweryCard({ brewery, isFavorited, onToggleFavorite, priority = false }: Props) {
  const primaryPhoto = brewery.photos?.find((p) => p.is_primary) ?? brewery.photos?.[0]
  const photoUrl = primaryPhoto ? getStorageUrl(primaryPhoto.storage_path) : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Photo */}
      <Link href={`/brewery/${brewery.slug}`} className="relative block aspect-4/3 overflow-hidden bg-amber-50">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={brewery.name}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-amber-200">
            🍺
          </div>
        )}
      </Link>

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={() => onToggleFavorite(brewery.id)}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm transition hover:scale-110"
        >
          <span aria-hidden="true">{isFavorited ? '❤️' : '🤍'}</span>
        </button>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/brewery/${brewery.slug}`}>
            <h2 className="text-base font-semibold leading-tight text-gray-900 hover:text-amber-700">
              {brewery.name}
            </h2>
          </Link>
          {brewery.has_events && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Events
            </span>
          )}
        </div>

        {brewery.city && (
          <p className="text-xs text-gray-500">
            📍 {brewery.city}
            {brewery.distance_km !== undefined && (
              <span className="ml-1 text-gray-400">
                · {brewery.distance_km < 1
                    ? `${Math.round(brewery.distance_km * 1000)} m`
                    : `${brewery.distance_km.toFixed(1)} km`}
              </span>
            )}
          </p>
        )}

        <AttributeIcon brewery={brewery} size="sm" />
      </div>
    </div>
  )
}
