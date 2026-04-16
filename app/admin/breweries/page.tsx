import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'

export const metadata = { title: 'Manage Breweries' }

export default async function AdminBreweriesPage() {
  const supabase = await createAdminClient()

  const { data: breweries } = await supabase
    .from('breweries')
    .select('id, name, slug, city, is_active, created_at')
    .order('name')

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🏭 Breweries</h1>
          <p className="mt-1 text-sm text-gray-500">{breweries?.length ?? 0} total</p>
        </div>
        <Link
          href="/admin/breweries/new"
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          + Add Brewery
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(breweries ?? []).map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.city ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    b.is_active
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/breweries/${b.id}/edit`}
                    className="text-amber-700 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
