if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'dev-jwt-secret-min-32-chars-long-trippy'

import { db, uid, j, slugify, nowIso } from '../db.js'
import { hashPassword } from '../lib/partnerAuth.js'
import { scrapePlanTheUnplanned, ScrapedTrip } from '../lib/scrapers/planTheUnplanned.js'
import { scrapeTripbae } from '../lib/scrapers/tripbae.js'

/**
 * Main Ingestion Script for Real Partner Trips (Plan the Unplanned & Tripbae).
 */
export async function ingestRealTrips() {
  console.log('🚀 Starting real trip ingestion for Plan the Unplanned & Tripbae...')

  // 1. Ensure Partner Orgs exist
  const planOrg = ensurePartnerOrg('Plan the Unplanned', 'plan-the-unplanned', 'contact@plantheunplanned.com', 'PlanUnplanned@123')
  const tripbaeOrg = ensurePartnerOrg('Tripbae', 'tripbae', 'contact@tripbae.com', 'Tripbae@123')

  // 2. Scrape/Fetch Real Trips
  const ptuTrips = await scrapePlanTheUnplanned()
  const tripbaeTrips = await scrapeTripbae()

  console.log(`📦 Loaded ${ptuTrips.length} trips from Plan the Unplanned`)
  console.log(`📦 Loaded ${tripbaeTrips.length} trips from Tripbae`)

  // 3. Save trips to database
  const ptuCount = saveScrapedTrips(ptuTrips, planOrg.id)
  const tripbaeCount = saveScrapedTrips(tripbaeTrips, tripbaeOrg.id)

  console.log(`✅ Ingested ${ptuCount} Plan the Unplanned trips under org '${planOrg.name}'`)
  console.log(`✅ Ingested ${tripbaeCount} Tripbae trips under org '${tripbaeOrg.name}'`)
  console.log('🎉 Real trip ingestion finished successfully!')
}

function ensurePartnerOrg(name: string, slug: string, email: string, defaultPassword: string) {
  let org = db.prepare('SELECT * FROM partner_orgs WHERE slug = ?').get(slug) as any
  if (!org) {
    const orgId = uid()
    db.prepare('INSERT INTO partner_orgs (id, name, slug) VALUES (?, ?, ?)').run(orgId, name, slug)
    org = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(orgId)
  }

  let admin = db.prepare('SELECT * FROM partner_admins WHERE email = ?').get(email)
  if (!admin) {
    const adminId = uid()
    const { hash, salt } = hashPassword(defaultPassword)
    db.prepare("INSERT INTO partner_admins (id, org_id, email, password_hash, password_salt, name, role) VALUES (?, ?, ?, ?, ?, ?, 'admin')")
      .run(adminId, org.id, email, hash, salt, `${name} Admin`)
  }

  return org
}

function saveScrapedTrips(trips: ScrapedTrip[], orgId: string): number {
  let count = 0
  const upcomingWeekends = getNextWeekendDates(trips.length)

  for (let i = 0; i < trips.length; i++) {
    const t = trips[i]
    const tripSlug = slugify(t.name)
    const weekend = upcomingWeekends[i % upcomingWeekends.length]

    // Check if trip with same slug already exists for org
    let existing = db.prepare('SELECT id FROM partner_trips WHERE org_id = ? AND slug = ?').get(orgId, tripSlug) as any
    const tripId = existing ? existing.id : uid()

    if (existing) {
      db.prepare(`UPDATE partner_trips SET 
        name = ?, short_desc = ?, long_desc = ?, destination = ?, destination_slug = ?,
        start_city = ?, start_date = ?, end_date = ?, duration_days = ?, price = ?, original_price = ?,
        currency = 'INR', cover_image = ?, payment_url = ?, inclusions = ?, exclusions = ?, status = 'published', updated_at = ?
        WHERE id = ? AND org_id = ?`)
        .run(
          t.name, t.shortDesc, t.longDesc || t.shortDesc, t.destination, t.destinationSlug || slugify(t.destination),
          t.startCity || 'Bengaluru', weekend.startDate, weekend.endDate, t.durationDays, t.price, t.originalPrice || t.price,
          t.coverImage, t.paymentUrl, j(t.inclusions || []), j(t.exclusions || []), nowIso(), tripId, orgId
        )
    } else {
      db.prepare(`INSERT INTO partner_trips (
        id, org_id, name, slug, short_desc, long_desc, destination, destination_slug,
        start_city, start_date, end_date, duration_days, price, original_price, currency,
        cover_image, payment_url, inclusions, exclusions, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, 'published', ?, ?)`)
        .run(
          tripId, orgId, t.name, tripSlug, t.shortDesc, t.longDesc || t.shortDesc, t.destination, t.destinationSlug || slugify(t.destination),
          t.startCity || 'Bengaluru', weekend.startDate, weekend.endDate, t.durationDays, t.price, t.originalPrice || t.price,
          t.coverImage, t.paymentUrl, j(t.inclusions || []), j(t.exclusions || []), nowIso(), nowIso()
        )
    }

    // Media
    db.prepare('DELETE FROM trip_media WHERE trip_id = ?').run(tripId)
    const mediaUrls = t.media && t.media.length ? t.media : [t.coverImage]
    const insMedia = db.prepare("INSERT INTO trip_media (id, trip_id, url, kind, sort_order) VALUES (?, ?, ?, 'image', ?)")
    mediaUrls.forEach((url, idx) => insMedia.run(uid(), tripId, url, idx))

    // Tags
    db.prepare('DELETE FROM trip_tags WHERE trip_id = ?').run(tripId)
    const tags = t.tags && t.tags.length ? t.tags : ['trekking', 'weekend-getaway']
    const insTag = db.prepare('INSERT OR IGNORE INTO trip_tags (trip_id, tag) VALUES (?, ?)')
    tags.forEach(tag => insTag.run(tripId, tag.toLowerCase()))

    // Itinerary Days
    if (t.itinerary && t.itinerary.length) {
      db.prepare('DELETE FROM trip_itinerary_days WHERE trip_id = ?').run(tripId)
      const insDay = db.prepare(`INSERT INTO trip_itinerary_days (id, trip_id, day_number, title, description, location, activities, meals, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      t.itinerary.forEach((d, idx) => {
        insDay.run(uid(), tripId, d.dayNumber || idx + 1, d.title, d.description, d.location || t.destination, j([]), j([]), idx + 1)
      })
    }

    count++
  }

  return count
}

/**
 * Generate upcoming weekend dates (Friday/Saturday start, Sunday end) starting from current date.
 */
function getNextWeekendDates(count: number): { startDate: string; endDate: string }[] {
  const result: { startDate: string; endDate: string }[] = []
  let current = new Date()
  
  for (let i = 0; i < count; i++) {
    const sat = new Date(current)
    const daysUntilSat = (6 - sat.getDay() + 7) % 7 || 7
    sat.setDate(sat.getDate() + (i * 7) + daysUntilSat)
    
    const fri = new Date(sat)
    fri.setDate(sat.getDate() - 1)

    const sun = new Date(sat)
    sun.setDate(sat.getDate() + 1)

    result.push({
      startDate: fri.toISOString().slice(0, 10),
      endDate: sun.toISOString().slice(0, 10)
    })
  }

  return result
}

ingestRealTrips()
