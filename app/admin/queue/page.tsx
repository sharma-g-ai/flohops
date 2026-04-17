import { createAdminClient } from '@/lib/supabase/server'
import { QueueList } from '@/components/admin/QueueList'

export const metadata = { title: 'Admin Queue' }

export default async function QueuePage() {
  const supabase = createAdminClient()

  const { data: requests } = await supabase
    .from('change_requests')
    .select(`*, brewery:breweries(id, name, slug)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📥 Admin Queue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and act on pending requests from breweries and consumers.
        </p>
      </div>
      <QueueList initialRequests={requests ?? []} />
    </div>
  )
}
