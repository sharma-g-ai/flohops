'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { getStorageUrl } from '@/lib/utils'

interface Photo {
  id: string
  storage_path: string
  is_primary: boolean
}

interface Props {
  photos: Photo[]
  breweryName: string
}

export function PhotoCarousel({ photos, breweryName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % photos.length)
  }, [photos.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, prev, next])

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  if (photos.length === 0) return null

  const activePhoto = photos[activeIndex]

  return (
    <>
      {/* Hero image — click to open lightbox */}
      <div
        className="relative mb-4 aspect-16/7 cursor-zoom-in overflow-hidden rounded-2xl bg-amber-50"
        onClick={() => setLightboxOpen(true)}
        title="Click to enlarge"
      >
        <Image
          src={getStorageUrl(activePhoto.storage_path)}
          alt={breweryName}
          fill
          className="object-cover transition-opacity duration-300"
          priority
          sizes="(max-width: 896px) 100vw, 896px"
        />

        {/* Nav arrows — only show when multiple photos */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
            >
              ›
            </button>
          </>
        )}

        {/* Photo count badge */}
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {photos.length}
          </span>
        )}

        {/* Enlarge hint */}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm">
          🔍 Click to enlarge
        </span>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setActiveIndex(i)}
              aria-label={`View photo ${i + 1}`}
              className={[
                'relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-amber-50 transition',
                i === activeIndex
                  ? 'ring-2 ring-amber-500 ring-offset-1'
                  : 'opacity-70 hover:opacity-100',
              ].join(' ')}
            >
              <Image
                src={getStorageUrl(photo.storage_path)}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white text-xl transition hover:bg-white/20"
          >
            ✕
          </button>

          {/* Counter */}
          {photos.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
              {activeIndex + 1} / {photos.length}
            </span>
          )}

          {/* Image container */}
          <div
            className="relative max-h-[85vh] max-w-[90vw] w-full"
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: '16/9' }}
          >
            <Image
              src={getStorageUrl(activePhoto.storage_path)}
              alt={breweryName}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Lightbox nav arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                aria-label="Previous photo"
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-2xl transition hover:bg-white/20"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                aria-label="Next photo"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-2xl transition hover:bg-white/20"
              >
                ›
              </button>
            </>
          )}

          {/* Thumbnail strip inside lightbox */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                  aria-label={`View photo ${i + 1}`}
                  className={[
                    'relative h-12 w-16 shrink-0 overflow-hidden rounded-lg transition',
                    i === activeIndex
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-black'
                      : 'opacity-50 hover:opacity-90',
                  ].join(' ')}
                >
                  <Image
                    src={getStorageUrl(photo.storage_path)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
