import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/common/Navbar'
import { AttributeIcon } from '@/components/brewery/AttributeIcon'
import { getStorageUrl, formatTime, DAY_LABELS } from '@/lib/utils'
import { PhotoCarousel } from '@/components/brewery/PhotoCarousel'

type Params = { slug: string }

// SSR — generates page-specific metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('breweries')
    .select('name, description, city, photos:brewery_photos(storage_path, is_primary)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!data) return { title: 'Brewery Not Found' }

  const primaryPhoto = (data.photos as { storage_path: string; is_primary: boolean }[])
    ?.find((p) => p.is_primary) ?? data.photos?.[0]

  return {
    title: data.name,
    description: data.description ?? `Visit ${data.name} in ${data.city ?? 'Central Florida'}. Find hours, amenities, and more on FloHops.`,
    openGraph: {
      title: data.name,
      description: data.description ?? undefined,
      images: primaryPhoto ? [getStorageUrl(primaryPhoto.storage_path)] : [],
    },
  }
}

export default async function BreweryProfilePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Auth for nav
  const { data: { user } } = await supabase.auth.getUser()
  let userProfile = null
  if (user) {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, role, brewery_id, created_at')
      .eq('id', user.id)
      .single()
    userProfile = data
  }

  // Brewery data
  const { data: brewery } = await supabase
    .from('breweries')
    .select(`
      *,
      photos:brewery_photos(id, storage_path, is_primary, display_order),
      events(id, title, is_active)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!brewery) notFound()

  const photos = (brewery.photos ?? []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  )
  const hasEvents = (brewery.events ?? []).some((e: { is_active: boolean }) => e.is_active)

  return (
    <>
      <Navbar userProfile={userProfile} />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Back link */}
        <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-amber-700">
          ← All Breweries
        </Link>

        {/* Photo carousel */}
        {photos.length > 0 && (
          <PhotoCarousel
            photos={photos}
            breweryName={brewery.name}
          />
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{brewery.name}</h1>
                {hasEvents && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                    🎉 Events
                  </span>
                )}
              </div>
              {brewery.city && (
                <p className="mt-1 text-gray-500">📍 {brewery.city}, {brewery.state}</p>
              )}
            </div>

            {brewery.description && (
              <p className="text-gray-700 leading-relaxed">{brewery.description}</p>
            )}

            {/* Attributes */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Amenities</h2>
              <AttributeIcon brewery={brewery} showAll size="md" />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Contact</h2>
              {brewery.address && <p className="text-sm text-gray-700">📍 {brewery.address}, {brewery.city}, {brewery.state} {brewery.zip}</p>}
              {brewery.phone && <p className="text-sm text-gray-700">📞 <a href={`tel:${brewery.phone}`} className="hover:underline">{brewery.phone}</a></p>}
              {brewery.website && <p className="text-sm text-gray-700">🌐 <a href={brewery.website} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">{brewery.website.replace(/^https?:\/\//, '')}</a></p>}
            </div>

            {/* Submit correction */}
            <div className="border-t border-gray-100 pt-4">
              <Link
                href={`/brewery/${brewery.slug}/correct`}
                className="text-sm text-gray-400 hover:text-amber-700 hover:underline"
              >
                Something wrong? Submit a correction →
              </Link>
            </div>
          </div>

          {/* Hours sidebar */}
          {brewery.hours && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Hours</h2>
              <ul className="space-y-1.5">
                {Object.entries(DAY_LABELS).map(([key, label]) => {
                  const day = brewery.hours?.[key as keyof typeof brewery.hours]
                  if (!day) return null
                  return (
                    <li key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600">{label}</span>
                      <span className={day.closed ? 'text-gray-400' : 'text-gray-900 font-medium'}>
                        {day.closed ? 'Closed' : `${formatTime(day.open)} – ${formatTime(day.close)}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
