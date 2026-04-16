import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/common/Navbar'
import { AttributeIcon } from '@/components/brewery/AttributeIcon'
import { BreweryRequestForm } from '@/components/brewery/BreweryRequestForm'
import { getStorageUrl, formatTime, DAY_LABELS } from '@/lib/utils'
import Image from 'next/image'

export const metadata = { title: 'My Brewery' }

export default async function MyBreweryPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/my-brewery')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, role, brewery_id, created_at')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'brewery') {
    redirect('/')
  }

  if (!profile.brewery_id) {
    return (
      <>
        <Navbar userProfile={profile} />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-gray-500">
          <p className="text-4xl">🏭</p>
          <p className="mt-4 text-lg font-medium text-gray-900">No brewery linked to your account</p>
          <p className="mt-2 text-sm">
            Please contact the FloHops admin team to link your account to your brewery.
          </p>
        </main>
      </>
    )
  }

  const { data: brewery } = await supabase
    .from('breweries')
    .select(`
      *,
      photos:brewery_photos(id, storage_path, is_primary, display_order)
    `)
    .eq('id', profile.brewery_id)
    .single()

  if (!brewery) redirect('/')

  const photos = (brewery.photos ?? []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  )
  const primaryPhoto = photos.find((p: { is_primary: boolean }) => p.is_primary) ?? photos[0]

  return (
    <>
      <Navbar userProfile={profile} />

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{brewery.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Read-only view · Changes require admin approval</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
            {brewery.is_active ? 'Live' : 'Inactive'}
          </span>
        </div>

        {/* Primary photo */}
        {primaryPhoto && (
          <div className="relative aspect-[16/7] overflow-hidden rounded-2xl bg-amber-50">
            <Image
              src={getStorageUrl(primaryPhoto.storage_path)}
              alt={brewery.name}
              fill
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {brewery.description && (
              <p className="text-gray-700 leading-relaxed">{brewery.description}</p>
            )}

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">Amenities</h2>
              <AttributeIcon brewery={brewery} showAll size="md" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Contact</h2>
              {brewery.address && <p className="text-sm text-gray-700">📍 {brewery.address}, {brewery.city}, {brewery.state}</p>}
              {brewery.phone && <p className="text-sm text-gray-700">📞 {brewery.phone}</p>}
              {brewery.website && <p className="text-sm text-gray-700">🌐 {brewery.website}</p>}
            </div>
          </div>

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
                      <span className={day.closed ? 'text-gray-400' : 'font-medium text-gray-900'}>
                        {day.closed ? 'Closed' : `${formatTime(day.open)} – ${formatTime(day.close)}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Request submission */}
        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Submit a Request</h2>
          <p className="mb-4 text-sm text-gray-500">
            Need to update your profile or add an event? Submit a request and the FloHops team will review it.
          </p>
          <BreweryRequestForm breweryId={brewery.id} />
        </div>
      </main>
    </>
  )
}
