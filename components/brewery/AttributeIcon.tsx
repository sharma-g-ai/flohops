import type { Brewery } from '@/types'

// Maps each brewery attribute to a label and emoji icon.
// Update icons here to change the visual across the entire app.
const ATTRIBUTE_CONFIG: {
  key: keyof Pick<
    Brewery,
    | 'kid_friendly'
    | 'dog_friendly'
    | 'has_food'
    | 'has_food_trucks'
    | 'outdoor_seating'
    | 'covered_outdoor'
    | 'has_wine'
    | 'full_bar'
    | 'sober_options'
  >
  icon: string
  label: string
}[] = [
  { key: 'kid_friendly',    icon: '🧒', label: 'Kid-Friendly' },
  { key: 'dog_friendly',    icon: '🐶', label: 'Dog-Friendly' },
  { key: 'has_food',        icon: '🍽️', label: 'Food' },
  { key: 'has_food_trucks', icon: '🌮', label: 'Food Trucks' },
  { key: 'outdoor_seating', icon: '🌿', label: 'Outdoor Seating' },
  { key: 'covered_outdoor', icon: '⛱️', label: 'Covered Outdoor' },
  { key: 'has_wine',        icon: '🍷', label: 'Wine' },
  { key: 'full_bar',        icon: '🍸', label: 'Full Bar' },
  { key: 'sober_options',   icon: '🫗', label: 'Sober Options' },
]

interface Props {
  brewery: Pick<Brewery,
    | 'kid_friendly' | 'dog_friendly' | 'has_food' | 'has_food_trucks'
    | 'outdoor_seating' | 'covered_outdoor' | 'has_wine' | 'full_bar'
    | 'sober_options'
  >
  // When true, show all attributes with dimming for inactive ones.
  // When false (default), show only active attributes.
  showAll?: boolean
  size?: 'sm' | 'md'
}

export function AttributeIcon({ brewery, showAll = false, size = 'sm' }: Props) {
  const items = showAll
    ? ATTRIBUTE_CONFIG
    : ATTRIBUTE_CONFIG.filter(({ key }) => brewery[key])

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(({ key, icon, label }) => {
        const active = brewery[key]
        return (
          <span
            key={key}
            title={label}
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium',
              size === 'sm' ? 'text-xs' : 'text-sm',
              active
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-gray-200 bg-gray-50 text-gray-400 opacity-50',
            ].join(' ')}
          >
            <span aria-hidden="true">{icon}</span>
            <span className="sr-only sm:not-sr-only">{label}</span>
          </span>
        )
      })}
    </div>
  )
}

export { ATTRIBUTE_CONFIG }
