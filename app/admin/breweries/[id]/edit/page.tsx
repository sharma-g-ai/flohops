import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { BreweryForm } from '@/components/admin/BreweryForm'
import { PhotoUploader } from '@/components/admin/PhotoUploader'
import type { Brewery } from '@/types'

type Params = { id: string }

export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const supabase = await createAdminClient()
  const { data } = await supabase.from('breweries').select('name').eq('id', id).single()
  return { title: data ? `Edit — ${data.name}` : 'Edit Brewery' }
}

export default async function EditBreweryPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data: brewery } = await supabase
    .from('breweries')
    .select(`*, photos:brewery_photos(id, storage_path, is_primary, display_order)`)
    .eq('id', id)
    .single()

  if (!brewery) notFound()

  const sorted = {
    ...brewery,
    photos: (brewery.photos ?? []).sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    ),
  } as Brewery

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Edit — {brewery.name}</h1>
      <BreweryForm brewery={sorted} />
      <div className="border-t border-gray-100 pt-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Photos</h2>
        <PhotoUploader breweryId={id} initialPhotos={sorted.photos ?? []} />
      </div>
    </div>
  )
}
