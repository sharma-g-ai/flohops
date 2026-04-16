'use client'

import { useState } from 'react'

type RequestType = 'profile_update' | 'event_request'

interface Props {
  breweryId: string
}

export function BreweryRequestForm({ breweryId }: Props) {
  const [type, setType] = useState<RequestType>('profile_update')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        brewery_id: breweryId,
        payload: { message: message.trim() },
      }),
    })

    setSubmitting(false)

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Failed to submit. Please try again.')
      return
    }

    setSubmitted(true)
    setMessage('')
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-2xl">✅</p>
        <p className="mt-2 font-medium text-green-800">Request submitted!</p>
        <p className="text-sm text-green-700">The FloHops team will review and apply the changes shortly.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-3 text-sm text-green-700 underline"
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { value: 'profile_update', label: '✏️ Profile Update' },
          { value: 'event_request', label: '🎉 Event Request' },
        ] as { value: RequestType; label: string }[]).map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={[
              'rounded-xl border py-2.5 text-sm font-medium transition',
              type === value
                ? 'border-amber-400 bg-amber-50 text-amber-900'
                : 'border-gray-200 text-gray-600 hover:border-amber-300',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {type === 'profile_update'
            ? 'What would you like to update?'
            : 'Event details (name, date/time, description)'}
          <span className="text-red-500"> *</span>
        </label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            type === 'profile_update'
              ? 'e.g. Update our Friday hours to 4pm–11pm, and we now have outdoor seating'
              : 'e.g. Trivia Night every Thursday starting June 5, 7pm–9pm'
          }
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Request'}
      </button>
    </form>
  )
}
