import { createAdminClient } from '@/lib/supabase/server'
import { UserRoleManager } from '@/components/admin/UserRoleManager'

export const metadata = { title: 'Manage Users' }

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  const { data: rawProfiles } = await supabase
    .from('user_profiles')
    .select(`id, role, brewery_id, created_at, brewery:breweries(id, name)`)
    .order('created_at', { ascending: false })

  // Supabase returns joined relations as arrays; normalize to single object
  const profiles = (rawProfiles ?? []).map((p) => ({
    ...p,
    brewery: Array.isArray(p.brewery) ? (p.brewery[0] ?? null) : p.brewery,
  }))

  const { data: breweries } = await supabase
    .from('breweries')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">👤 Users</h1>
      <UserRoleManager
        initialProfiles={profiles ?? []}
        breweries={breweries ?? []}
      />
    </div>
  )
}
