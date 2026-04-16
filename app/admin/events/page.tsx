import { createAdminClient } from '@/lib/supabase/server'
import { EventManager } from '@/components/admin/EventManager'

export const metadata = { title: 'Manage Events' }

export default async function AdminEventsPage() {
  const supabase = await createAdminClient()

  const { data: breweries } = await supabase
    .from('breweries')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  const { data: events } = await supabase
    .from('events')
    .select(`*, brewery:breweries(id, name)`)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">🎉 Events</h1>
      <EventManager
        initialEvents={events ?? []}
        breweries={breweries ?? []}
      />
    </div>
  )
}
