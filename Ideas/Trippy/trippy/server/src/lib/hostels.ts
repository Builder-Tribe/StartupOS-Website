import { db, pj } from '../db.js'
import { isHttpsUrl } from './trips.js'

// Full admin-facing shape for a hostel/property row.
export function hostelShape(h: any) {
  return {
    id: h.id, name: h.name, slug: h.slug, propertyType: h.property_type || 'hostel',
    status: h.status || 'published', featured: !!h.featured, source: h.source || 'seed',
    shortDesc: h.short_desc || '', description: h.description || '',
    destination: h.destination, city: h.city, state: h.state, country: h.country || 'India',
    locality: h.locality, address: h.address, postalCode: h.postal_code,
    latitude: h.latitude, longitude: h.longitude,
    area: h.area, pricePerNight: h.price_per_night, rating: h.rating, reviewCount: h.review_count,
    amenities: pj<string[]>(h.amenities, []), vibeTags: pj<string[]>(h.vibe_tags, []),
    highlights: pj<string[]>(h.highlights, []), suitableFor: pj<string[]>(h.suitable_for, []),
    categories: pj<string[]>(h.categories, []), tags: pj<string[]>(h.tags, []),
    coverImage: h.cover_image || '', gallery: pj<string[]>(h.gallery, []),
    email: h.email, phone: h.phone, website: h.website,
    checkinTime: h.checkin_time, checkoutTime: h.checkout_time, rules: h.rules, cancellation: h.cancellation,
    bookingUrl: h.booking_url, partner: !!h.partner,
    seoTitle: h.seo_title, seoDescription: h.seo_description, externalRef: h.external_ref,
    lastVerifiedAt: h.last_verified_at, publishedAt: h.published_at,
    createdAt: h.created_at, updatedAt: h.updated_at,
  }
}

// Compact consumer-facing card (only ever built from PUBLISHED rows).
export function hostelCard(h: any) {
  return {
    id: h.id, name: h.name, slug: h.slug, destination: h.destination,
    city: h.city || h.area, state: h.state, area: h.area,
    pricePerNight: h.price_per_night, rating: h.rating, reviewCount: h.review_count,
    amenities: pj<string[]>(h.amenities, []), vibeTags: pj<string[]>(h.vibe_tags, []),
    coverImage: h.cover_image || '', featured: !!h.featured,
    bookingUrl: h.booking_url, partner: !!h.partner,
  }
}

export function validateHostelForPublish(h: any): string[] {
  const errors: string[] = []
  if (!h.name?.trim()) errors.push('Hostel name is required')
  if (!h.city?.trim() && !h.area?.trim()) errors.push('City is required')
  if (!h.destination?.trim()) errors.push('Destination is required')
  if (!h.description?.trim() && !h.short_desc?.trim()) errors.push('A description is required')
  if (!(Number(h.price_per_night) > 0)) errors.push('A valid price per night is required')
  if (!h.cover_image?.trim()) errors.push('A cover image is required')
  if (h.booking_url && !isHttpsUrl(h.booking_url)) errors.push('Booking URL must be a valid https:// link')
  return errors
}

export function uniqueHostelSlug(base: string, excludeId?: string): string {
  let slug = base || 'hostel'
  let n = 1
  while (db.prepare('SELECT 1 FROM hostels WHERE slug = ? AND id != ?').get(slug, excludeId || '')) slug = `${base}-${++n}`
  return slug
}
