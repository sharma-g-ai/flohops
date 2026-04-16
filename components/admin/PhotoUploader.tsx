'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { BreweryPhoto } from '@/types'
import { getStorageUrl } from '@/lib/utils'

interface Props {
  breweryId: string
  initialPhotos: BreweryPhoto[]
}

export function PhotoUploader({ breweryId, initialPhotos }: Props) {
  const [photos, setPhotos] = useState<BreweryPhoto[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (files: FileList) => {
    setError(null)
    setUploading(true)

    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/breweries/${breweryId}/photos`, {
        method: 'POST',
        body: form,
      })
      if (res.ok) {
        const { data } = await res.json()
        setPhotos((prev) => [...prev, data])
      } else {
        const { error: msg } = await res.json()
        setError(msg ?? 'Upload failed')
      }
    }
    setUploading(false)
  }

  const setPrimary = async (photoId: string) => {
    const res = await fetch(`/api/breweries/${breweryId}/photos/${photoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_primary: true }),
    })
    if (res.ok) {
      setPhotos((prev) =>
        prev.map((p) => ({ ...p, is_primary: p.id === photoId }))
      )
    }
  }

  const deletePhoto = async (photoId: string) => {
    const res = await fetch(`/api/breweries/${breweryId}/photos/${photoId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload button */}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl border-2 border-dashed border-gray-300 px-6 py-3 text-sm text-gray-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : '+ Upload Photos'}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={getStorageUrl(photo.storage_path)}
                alt=""
                fill
                className="object-cover"
                sizes="128px"
              />
              {photo.is_primary && (
                <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-xs font-bold text-white">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                {!photo.is_primary && (
                  <button
                    onClick={() => setPrimary(photo.id)}
                    className="rounded bg-white px-2 py-1 text-xs font-medium text-gray-800 hover:bg-amber-50"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
