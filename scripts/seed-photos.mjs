/**
 * FloHops — Photo Seeder
 *
 * Fetches brewery photos from Unsplash and uploads them to Supabase Storage,
 * then links them to each brewery in the database.
 *
 * Prerequisites:
 *   1. Run seed.sql first so the brewery rows exist.
 *   2. Create a free Unsplash developer account at https://unsplash.com/developers
 *      → "New Application" → copy the "Access Key"
 *   3. Run:
 *        UNSPLASH_ACCESS_KEY=your_key node scripts/seed-photos.mjs
 *
 * The script is idempotent — re-running it skips breweries that already have photos.
 */

import { createClient } from '@supabase/supabase-js'

// ─── Environment variables ────────────────────────────────────────────────────
// Set all three in PowerShell before running:
//
//   $env:SUPABASE_URL="https://xxxx.supabase.co"
//   $env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."
//   $env:UNSPLASH_ACCESS_KEY="your_key"
//   node scripts/seed-photos.mjs

const SUPABASE_URL        = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

const missing = []
if (!SUPABASE_URL)        missing.push('SUPABASE_URL')
if (!SERVICE_ROLE_KEY)    missing.push('SUPABASE_SERVICE_ROLE_KEY')
if (!UNSPLASH_ACCESS_KEY) missing.push('UNSPLASH_ACCESS_KEY')

if (missing.length > 0) {
  console.error('❌  Missing environment variables:', missing.join(', '))
  console.error('\nSet them in PowerShell first:')
  console.error('  $env:SUPABASE_URL="https://xxxx.supabase.co"')
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."')
  console.error('  $env:UNSPLASH_ACCESS_KEY="your_key"')
  console.error('  node scripts/seed-photos.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ─── Per-brewery search terms ─────────────────────────────────────────────────
// Each entry maps a brewery slug to a specific Unsplash search query so the
// photos are varied and relevant rather than all showing the same stock image.
const BREWERY_QUERIES = {
  'cigar-city-brewing':       'brewery',
  'crooked-can-brewing':      'beer tap',
  'hourglass-brewery':        'craft beer',
  'ivanhoe-park-brewing':     'beer glass',
  'sideward-brewing':         'beer brewing',
  'persimmon-hollow-brewing': 'brewery bar',
  '3-daughters-brewing':      'beer outdoor',
  'motorworks-brewing':       'bar drinks',
  'tactical-brewing':         'beer pint',
  'orange-blossom-brewing':   'beer garden',
  'redlight-redlight':        'bar night',
  'brew-theory':              'beer mug',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function fetchUnsplashPhoto(query) {
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high&client_id=${UNSPLASH_ACCESS_KEY}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Unsplash API error ${res.status}: ${body}`)
  }
  const data = await res.json()
  // Use the "regular" size (~1080px wide) — good quality without being huge
  return {
    downloadUrl: data.urls.regular,
    credit: `Photo by ${data.user.name} on Unsplash`,
    unsplashId: data.id,
  }
}

async function downloadImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

async function uploadToStorage(buffer, storagePath) {
  const { error } = await supabase.storage
    .from('brewery-photos')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)
}

async function linkPhotoToBrewery(breweryId, storagePath) {
  const { error } = await supabase
    .from('brewery_photos')
    .insert({
      brewery_id: breweryId,
      storage_path: storagePath,
      is_primary: true,
      display_order: 0,
    })
  if (error) throw new Error(`DB insert failed: ${error.message}`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🍺  FloHops photo seeder starting…\n')

  // Load all breweries that are in our seed list
  const slugs = Object.keys(BREWERY_QUERIES)
  const { data: breweries, error } = await supabase
    .from('breweries')
    .select('id, name, slug')
    .in('slug', slugs)

  if (error) {
    console.error('❌  Failed to load breweries:', error.message)
    process.exit(1)
  }

  if (breweries.length === 0) {
    console.error('❌  No breweries found. Run seed.sql first.')
    process.exit(1)
  }

  console.log(`Found ${breweries.length} breweries to process.\n`)

  // Check which breweries already have a primary photo
  const { data: existingPhotos } = await supabase
    .from('brewery_photos')
    .select('brewery_id')
    .eq('is_primary', true)
    .in('brewery_id', breweries.map(b => b.id))

  const alreadySeeded = new Set((existingPhotos ?? []).map(p => p.brewery_id))

  for (const brewery of breweries) {
    if (alreadySeeded.has(brewery.id)) {
      console.log(`⏭️   ${brewery.name} — already has a photo, skipping`)
      continue
    }

    const query = BREWERY_QUERIES[brewery.slug]
    const storagePath = `${brewery.slug}/primary.jpg`

    try {
      process.stdout.write(`📷  ${brewery.name} — fetching from Unsplash…`)

      const { downloadUrl, credit } = await fetchUnsplashPhoto(query)

      process.stdout.write(' downloading…')
      const buffer = await downloadImage(downloadUrl)

      process.stdout.write(' uploading…')
      await uploadToStorage(buffer, storagePath)

      process.stdout.write(' linking…')
      await linkPhotoToBrewery(brewery.id, storagePath)

      console.log(` ✅\n    ${credit}`)

      // Unsplash free tier: 50 requests/hour. A small delay keeps us well clear.
      await new Promise(r => setTimeout(r, 500))

    } catch (err) {
      console.log(` ❌\n    Error: ${err.message}`)
    }
  }

  console.log('\n✨  Done! Refresh the app to see the photos.')
}

main()
