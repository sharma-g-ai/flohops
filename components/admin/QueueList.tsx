'use client'

import { useState } from 'react'
import type { ChangeRequest } from '@/types'

interface Props {
  initialRequests: ChangeRequest[]
}

const TYPE_LABELS: Record<string, string> = {
  correction: '🔧 Correction',
  profile_update: '✏️ Profile Update',
  event_request: '🎉 Event Request',
}

export function QueueList({ initialRequests }: Props) {
  const [requests, setRequests] = useState<ChangeRequest[]>(initialRequests)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const act = async (id: string, action: 'approve' | 'reject') => {
    setLoading((l) => ({ ...l, [id]: true }))
    const res = await fetch(`/api/requests/${id}/${action}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notes: notes[id] ?? '' }),
    })
    setLoading((l) => ({ ...l, [id]: false }))
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.id !== id))
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gray-50 py-16 text-center text-gray-400">
        <p className="text-3xl">✅</p>
        <p className="mt-2 font-medium">Queue is empty</p>
        <p className="text-sm">No pending requests right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req.id} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="text-sm font-semibold text-gray-800">
                {TYPE_LABELS[req.type] ?? req.type}
              </span>
              {req.brewery && (
                <span className="ml-2 text-sm text-gray-500">— {req.brewery.name}</span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {new Date(req.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Submitter */}
          {(req.submitter_name || req.submitter_email) && (
            <p className="mt-2 text-xs text-gray-500">
              From: {req.submitter_name ?? ''} {req.submitter_email ? `<${req.submitter_email}>` : ''}
            </p>
          )}

          {/* Payload */}
          <div className="mt-3 rounded-xl bg-gray-50 p-3">
            <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
              {JSON.stringify(req.payload, null, 2)}
            </pre>
          </div>

          {/* Admin notes */}
          <textarea
            rows={2}
            placeholder="Optional admin notes…"
            value={notes[req.id] ?? ''}
            onChange={(e) => setNotes((n) => ({ ...n, [req.id]: e.target.value }))}
            className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
          />

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => act(req.id, 'approve')}
              disabled={loading[req.id]}
              className="flex-1 rounded-xl bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {loading[req.id] ? '…' : '✅ Approve'}
            </button>
            <button
              onClick={() => act(req.id, 'reject')}
              disabled={loading[req.id]}
              className="flex-1 rounded-xl bg-red-50 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60 border border-red-200"
            >
              {loading[req.id] ? '…' : '❌ Reject'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
