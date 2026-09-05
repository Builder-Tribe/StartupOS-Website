import { db, uid } from '../db.js'

// Bookings backbone (PRD 2.9 / 2.13 / 2.14, first-party supply).
// Capacity = partner_trips.max_group_size (nullable → unlimited). A booking is
// 'claimed' by the traveller after paying on the host's page and 'confirmed'
// (or rejected) by the partner in the CRM. claimed + confirmed both hold a
// seat so a full trip can't be oversold while claims await review.

export function availabilityOf(trip: { id: string; max_group_size: number | null }) {
  const counts = db.prepare(
    "SELECT SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) confirmed, SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) claimed FROM bookings WHERE trip_id = ?"
  ).get(trip.id) as any
  const confirmed = counts?.confirmed || 0
  const claimed = counts?.claimed || 0
  const capacity = trip.max_group_size || null
  const seatsLeft = capacity == null ? null : Math.max(0, capacity - confirmed - claimed)
  return {
    capacity,
    confirmed,
    claimed,
    seatsLeft,
    full: capacity != null && confirmed + claimed >= capacity,
    fillingFast: capacity != null && seatsLeft != null && seatsLeft > 0 && seatsLeft <= Math.max(1, Math.ceil(capacity * 0.2)),
  }
}

export function notify(userId: string, n: { type: string; title: string; body?: string; link?: string }) {
  db.prepare('INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)')
    .run(uid(), userId, n.type, n.title, n.body || '', n.link || '')
}

// When seats free up (cancel / reject / capacity raise), tell the earliest
// un-notified waitlisted travellers — one per open seat.
export function processWaitlist(tripId: string) {
  const trip = db.prepare('SELECT id, slug, name, max_group_size FROM partner_trips WHERE id = ?').get(tripId) as any
  if (!trip) return
  const avail = availabilityOf(trip)
  if (avail.capacity == null || avail.seatsLeft == null || avail.seatsLeft <= 0) return
  const waiting = db.prepare('SELECT * FROM waitlist WHERE trip_id = ? AND notified = 0 ORDER BY created_at ASC LIMIT ?')
    .all(tripId, avail.seatsLeft) as any[]
  for (const w of waiting) {
    notify(w.user_id, {
      type: 'waitlist_spot',
      title: `A spot opened on "${trip.name}" 🎉`,
      body: 'You were on the waitlist — seats are limited, book while it lasts.',
      link: `/trip/${trip.slug}`,
    })
    db.prepare('UPDATE waitlist SET notified = 1 WHERE id = ?').run(w.id)
  }
}
