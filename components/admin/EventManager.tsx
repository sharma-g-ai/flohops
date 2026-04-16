'use client'

import { useState } from 'react'
import type { BreweryEvent } from '@/types'

interface Props {
  initialEvents: (BreweryEvent & { brewery: { id: string; name: string } | null })[]
  breweries: { id: string; name: string }[]
}

const EMPTY_FORM = {
  brewery_id: '',
  title: '',
  description: '',
  start_at: '',
  end_at: '',
  is_recurring: false,
  recurrence_rule: '',
}

export function EventManager({ initialEvents, breweries }: Props) {
  const [events, setEvents] = useState(initialEvents)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => { setForm(EMPTY_FORM); setEditId(null); setError(null) }

  const startEdit = (event: typeof events[number]) => {
    setEditId(event.id)
    setForm({
      brewery_id: event.brewery_id,
      title: event.title,
      description: event.description ?? '',
      start_at: event.start_at?.slice(0, 16) ?? '',
      end_at: event.end_at?.slice(0, 16) ?? '',
      is_recurring: event.is_recurring,
      recurrence_rule: event.recurrence_rule ?? '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const payload = {
      ...form,
      start_at: form.start_at ? new Date(form.start_at).toISOString() : undefined,
      end_at: form.end_at ? new Date(form.end_at).toISOString() : undefined,
      recurrence_rule: form.recurrence_rule || undefined,
      description: form.description || undefined,
    }

    const url = editId ? `/api/events/${editId}` : '/api/events'
    const method = editId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editId ? payload : { ...payload, brewery_id: form.brewery_id }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Failed to save'); return }

    if (editId) {
      setEvents((prev) => prev.map((e) => e.id === editId ? { ...e, ...data.data } : e))
    } else {
      setEvents((prev) => [{ ...data.data, brewery: breweries.find((b) => b.id === form.brewery_id) ?? null }, ...prev])
    }
    reset()
  }

  const toggleActive = async (event: typeof events[number]) => {
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !event.is_active }),
    })
    if (res.ok) {
      setEvents((prev) => prev.map((e) => e.id === event.id ? { ...e, is_active: !e.is_active } : e))
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (res.ok) setEvents((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">{editId ? 'Edit Event' : 'Add Event'}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Brewery *</label>
            <select required value={form.brewery_id}
              onChange={(e) => setForm((f) => ({ ...f, brewery_id: e.target.value }))}
              disabled={!!editId}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400">
              <option value="">Select brewery…</option>
              {breweries.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input required value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Start</label>
            <input type="datetime-local" value={form.start_at}
              onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">End</label>
            <input type="datetime-local" value={form.end_at}
              onChange={(e) => setForm((f) => ({ ...f, end_at: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea rows={2} value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400 resize-none" />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.is_recurring}
              onChange={(e) => setForm((f) => ({ ...f, is_recurring: e.target.checked }))}
              className="h-4 w-4 rounded accent-amber-600" />
            Recurring
          </label>
          {form.is_recurring && (
            <input value={form.recurrence_rule} placeholder="e.g. FREQ=WEEKLY;BYDAY=FR"
              onChange={(e) => setForm((f) => ({ ...f, recurrence_rule: e.target.value }))}
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-amber-400" />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
            {saving ? 'Saving…' : editId ? 'Update' : 'Create Event'}
          </button>
          {editId && (
            <button type="button" onClick={reset}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Events list */}
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{event.title}</p>
              <p className="text-xs text-gray-500">{event.brewery?.name}</p>
            </div>
            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${event.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {event.is_active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={() => startEdit(event)} className="text-xs text-amber-700 hover:underline">Edit</button>
            <button onClick={() => toggleActive(event)} className="text-xs text-gray-500 hover:underline">
              {event.is_active ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={() => deleteEvent(event.id)} className="text-xs text-red-500 hover:underline">Delete</button>
          </div>
        ))}
        {events.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">No events yet.</p>
        )}
      </div>
    </div>
  )
}
