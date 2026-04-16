'use client'

import { useState } from 'react'
import type { UserRole } from '@/types'

type Profile = {
  id: string
  role: UserRole
  brewery_id: string | null
  created_at: string
  brewery: { id: string; name: string } | null
}

interface Props {
  initialProfiles: Profile[]
  breweries: { id: string; name: string }[]
}

export function UserRoleManager({ initialProfiles, breweries }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const updateRole = async (profile: Profile, role: UserRole, breweryId?: string | null) => {
    setSaving((s) => ({ ...s, [profile.id]: true }))
    const res = await fetch(`/api/users/${profile.id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, brewery_id: breweryId ?? null }),
    })
    setSaving((s) => ({ ...s, [profile.id]: false }))
    if (res.ok) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id
            ? { ...p, role, brewery_id: breweryId ?? null, brewery: breweries.find((b) => b.id === breweryId) ?? null }
            : p
        )
      )
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">User ID</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Brewery</th>
            <th className="px-4 py-3">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {profiles.map((profile) => (
            <tr key={profile.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[140px] truncate">
                {profile.id}
              </td>
              <td className="px-4 py-3">
                <select
                  value={profile.role}
                  disabled={saving[profile.id]}
                  onChange={(e) => updateRole(profile, e.target.value as UserRole)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="consumer">Consumer</option>
                  <option value="brewery">Brewery</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-4 py-3">
                {profile.role === 'brewery' ? (
                  <select
                    value={profile.brewery_id ?? ''}
                    disabled={saving[profile.id]}
                    onChange={(e) => updateRole(profile, 'brewery', e.target.value || null)}
                    className="rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-amber-400 disabled:opacity-60"
                  >
                    <option value="">No brewery</option>
                    {breweries.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {new Date(profile.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
