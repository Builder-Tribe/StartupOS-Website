import { db, pj } from '../db.js'

// Only https URLs are accepted for payment links / media — blocks javascript:,
// data: and http: which would enable open-redirect / XSS style abuse.
export function isHttpsUrl(v: unknown): boolean {
  if (typeof v !== 'string') return false
  try {
    const u = new URL(v)
    return u.protocol === 'https:'
  } catch {
    return false
  }
}

export function orgShape(o: any) {
  if (!o) return null
  return {
    id: o.id, name: o.name, slug: o.slug,
    logoEmoji: o.logo_emoji, logoColor: o.logo_color,
    about: o.about, website: o.website,
  }
}

export function itineraryFor(tripId: string) {
  return (db.prepare('SELECT * FROM trip_itinerary_days WHERE trip_id = ? ORDER BY sort_order, day_number').all(tripId) as any[])
    .map(d => ({
      id: d.id, dayNumber: d.day_number, title: d.title, description: d.description,
      location: d.location, activities: pj<string[]>(d.activities, []),
      accommodation: d.accommodation, meals: pj<string[]>(d.meals, []), sortOrder: d.sort_order,
    }))
}

export function mediaFor(tripId: string) {
  return (db.prepare('SELECT * FROM trip_media WHERE trip_id = ? ORDER BY sort_order, created_at').all(tripId) as any[])
    .map(m => ({ id: m.id, url: m.url, kind: m.kind, sortOrder: m.sort_order }))
}

export function tagsFor(tripId: string): string[] {
  return (db.prepare('SELECT tag FROM trip_tags WHERE trip_id = ? ORDER BY tag').all(tripId) as any[]).map(t => t.tag)
}

// A trip is "completed" the moment its end date is in the past — computed, not
// stored, so it stays correct without a cron. (archived is an explicit status.)
export function effectiveStatus(t: any): string {
  if (t.status === 'published' && t.end_date && t.end_date < new Date().toISOString().slice(0, 10)) return 'completed'
  return t.status
}

// Full shape for the owning partner (drafts included) and for preview.
export function partnerTripShape(t: any) {
  const org = db.prepare('SELECT * FROM partner_orgs WHERE id = ?').get(t.org_id)
  return {
    id: t.id, orgId: t.org_id, slug: t.slug, status: effectiveStatus(t), rawStatus: t.status,
    name: t.name, shortDesc: t.short_desc, longDesc: t.long_desc,
    destination: t.destination, destinationSlug: t.destination_slug,
    startCity: t.start_city, startDate: t.start_date, endDate: t.end_date, durationDays: t.duration_days,
    category: t.category, tripType: t.trip_type, difficulty: t.difficulty,
    minAge: t.min_age, maxGroupSize: t.max_group_size,
    price: t.price, originalPrice: t.original_price, currency: t.currency, pricingNotes: t.pricing_notes,
    inclusions: pj<string[]>(t.inclusions, []), exclusions: pj<string[]>(t.exclusions, []),
    coverImage: t.cover_image, paymentUrl: t.payment_url,
    publishedAt: t.published_at, createdAt: t.created_at, updatedAt: t.updated_at,
    host: orgShape(org),
    itinerary: itineraryFor(t.id), media: mediaFor(t.id), tags: tagsFor(t.id),
  }
}

// Compact card for consumer discovery listings.
export function publicTripCard(t: any) {
  const ratingRow = db.prepare("SELECT ROUND(AVG(rating)*10)/10 AS avg, COUNT(*) AS cnt FROM trip_reviews WHERE target_type='partner_trip' AND target_id=?").get(t.id) as any
  return {
    id: t.id, slug: t.slug, name: t.name, destination: t.destination, destinationSlug: t.destination_slug,
    startDate: t.start_date, endDate: t.end_date, durationDays: t.duration_days,
    price: t.price, originalPrice: t.original_price, currency: t.currency,
    coverImage: t.cover_image, category: t.category, difficulty: t.difficulty,
    hostName: (db.prepare('SELECT name FROM partner_orgs WHERE id = ?').get(t.org_id) as any)?.name || 'Travel community',
    tags: tagsFor(t.id),
    avgRating: ratingRow?.avg || null,
    reviewCount: ratingRow?.cnt || 0,
  }
}

// Mandatory fields that must be present before a trip can go live.
export function validateForPublish(t: any): string[] {
  const errors: string[] = []
  if (!t.name?.trim()) errors.push('Trip name is required')
  if (!t.destination?.trim()) errors.push('Destination is required')
  if (!t.start_date) errors.push('Start date is required')
  if (!t.end_date) errors.push('End date is required')
  if (t.start_date && t.end_date && t.end_date < t.start_date) errors.push('End date must be on or after the start date')
  if (!(Number(t.price) > 0)) errors.push('A valid price is required')
  if (!t.cover_image?.trim()) errors.push('A cover image is required')
  if (!t.long_desc?.trim() && !t.short_desc?.trim()) errors.push('A trip description is required')
  const dayCount = (db.prepare('SELECT COUNT(*) AS c FROM trip_itinerary_days WHERE trip_id = ?').get(t.id) as any).c
  if (dayCount < 1) errors.push('At least one itinerary day is required')
  if (!isHttpsUrl(t.payment_url)) errors.push('A valid https payment link is required')
  return errors
}
