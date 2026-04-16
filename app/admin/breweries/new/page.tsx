import { BreweryForm } from '@/components/admin/BreweryForm'

export const metadata = { title: 'Add Brewery' }

export default function NewBreweryPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add Brewery</h1>
      <BreweryForm />
    </div>
  )
}
