import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CorrectionForm } from './CorrectionForm'

export default async function CorrectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: brewery } = await supabase
    .from('breweries')
    .select('id, name')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!brewery) notFound()

  return <CorrectionForm breweryId={brewery.id} breweryName={brewery.name} />
}
