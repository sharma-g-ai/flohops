'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  breweryId: string
  breweryName: string
}

export function CorrectionForm({ breweryId, breweryName }: Props) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
        type: 'correction',
        brewery_id: breweryId,
        submitter_name: name.trim() || undefined,
        submitter_email: email.trim() || undefined,
        payload: { message: message.trim() },
      }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? 'Failed to submit. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100">
          <p className="text-4xl">✅</p>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">Thanks for the correction!</h1>
          <p className="mt-2 text-sm text-gray-500">Our team will review your submission shortly.</p>
          <button
            onClick={() => router.back()}
            className="mt-6 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Back to brewery
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <Link href="/" className="mb-4 inline-block text-sm text-gray-500 hover:text-amber-700">← Back</Link>
        <h1 className="text-xl font-semibold text-gray-900">Submit a Correction</h1>
        <p className="mt-1 mb-1 text-sm font-medium text-amber-700">{breweryName}</p>
        <p className="mb-5 text-sm text-gray-500">
          Notice something wrong? Let us know and we&apos;ll review it.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Your Name <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Your Email <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              What&apos;s incorrect? <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hours are wrong — they close at 10pm on Fridays, not 9pm"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 resize-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Correction'}
          </button>
        </form>
      </div>
    </div>
  )
}
