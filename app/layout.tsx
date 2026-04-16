import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: {
    default: 'FloHops — Discover Central Florida Breweries',
    template: '%s | FloHops',
  },
  description:
    'Find the best craft breweries in Central Florida. Search by location, filter by amenities, and discover your next favorite spot.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'https://flohops.com'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
