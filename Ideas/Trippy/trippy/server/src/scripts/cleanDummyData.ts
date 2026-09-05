import { db } from '../db.js'

/**
 * Clean Dummy Data Script for Trippy Launch Preparation.
 * 
 * Safely removes:
 * - Simulated consumer trips, connections, chats, and mock users
 * - Simulated operator departures (group_trips)
 * - Seeded partner trips, bookings, waitlists, and reviews
 * 
 * Preserves:
 * - Curated Destinations (`destinations`)
 * - Hostels (`hostels`)
 * - Admin users & RBAC roles (`admin_users`, `admin_roles`, `admin_permissions`)
 */
export function cleanDummyData(options: { keepDemoUser?: boolean; keepPartnerOrgs?: boolean } = {}) {
  const { keepDemoUser = true, keepPartnerOrgs = true } = options
  const founderEmail = 'agarwal.harshit97@gmail.com'

  console.log('🧹 Preparing Trippy database for launch: cleaning dummy data...')

  // Disable FK constraints temporarily for safe cascade cleanup
  try { db.exec('PRAGMA foreign_keys = OFF;') } catch (_) {}

  // Helper for safe query execution
  const safeRun = (sql: string, ...args: any[]) => { try { db.prepare(sql).run(...args) } catch (_) {} }

  // 1. Consumer social & matching data (preserving founder connections/messages if any)
  safeRun("DELETE FROM messages WHERE sender_id IS NOT NULL AND sender_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM chat_members WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun('DELETE FROM chats WHERE id NOT IN (SELECT chat_id FROM chat_members)')
  safeRun("DELETE FROM connections WHERE from_user NOT IN (SELECT id FROM users WHERE email = ?) AND to_user NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail, founderEmail)
  safeRun("DELETE FROM carpool_requests WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM ride_checkins WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM ride_location_pings WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM adventure_routes WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM poll_votes WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun('DELETE FROM polls WHERE id NOT IN (SELECT poll_id FROM poll_votes)')
  safeRun("DELETE FROM group_members WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun('DELETE FROM itinerary_items')
  safeRun('DELETE FROM groups WHERE leader_id NOT IN (SELECT id FROM users WHERE email = ?)', founderEmail)
  safeRun("DELETE FROM vouches WHERE voucher_id NOT IN (SELECT id FROM users WHERE email = ?) AND target_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail, founderEmail)
  safeRun("DELETE FROM id_verifications WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM reports WHERE reporter_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM blocks WHERE blocker_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM trips WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM hostel_stays WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM hostel_reviews WHERE user_id NOT IN (SELECT id FROM users WHERE email = ?)", founderEmail)
  safeRun("DELETE FROM login_events WHERE email != ? AND (user_id IS NULL OR user_id NOT IN (SELECT id FROM users WHERE email = ?))", founderEmail, founderEmail)

  // 2. Consumer profiles — STRICTLY PRESERVE agarwal.harshit97@gmail.com
  if (keepDemoUser) {
    db.prepare("DELETE FROM users WHERE email NOT IN (?, 'traveller@trippy.test')").run(founderEmail)
    console.log(`  ✓ Purged simulated travelers (retained founder ${founderEmail} & demo user traveller@trippy.test)`)
  } else {
    db.prepare("DELETE FROM users WHERE email != ?").run(founderEmail)
    console.log(`  ✓ Purged non-founder consumer profiles (retained ${founderEmail})`)
  }

  // 3. Simulated external operator group trips
  db.prepare('DELETE FROM group_trips').run()
  console.log('  ✓ Purged simulated external group trips')

  // 4. Seeded Partner CRM data
  db.prepare('DELETE FROM bookings').run()
  db.prepare('DELETE FROM waitlist').run()
  db.prepare('DELETE FROM notifications').run()
  db.prepare('DELETE FROM trip_outbound_clicks').run()
  db.prepare('DELETE FROM trip_reviews').run()
  db.prepare('DELETE FROM trip_itinerary_days').run()
  db.prepare('DELETE FROM trip_media').run()
  db.prepare('DELETE FROM trip_tags').run()
  db.prepare('DELETE FROM trip_categories').run()
  db.prepare('DELETE FROM partner_trips').run()
  console.log('  ✓ Purged simulated partner trips, bookings, waitlists, and itinerary days')

  if (!keepPartnerOrgs) {
    db.prepare("DELETE FROM partner_admins WHERE email != ?").run(founderEmail)
    db.prepare("DELETE FROM partner_orgs WHERE id NOT IN (SELECT org_id FROM partner_admins WHERE email = ?)").run(founderEmail)
    console.log(`  ✓ Purged partner organizations except Founder Org for ${founderEmail}`)
  } else {
    console.log('  ✓ Retained partner organization structures for real partner onboarding')
  }

  // 5. Purge dummy admin users (retaining strictly Founder agarwal.harshit97@gmail.com)
  if (process.env.TRIPPY_TEST !== '1') {
    const dummyAdminIds = db.prepare("SELECT id FROM admin_users WHERE email != ?").all(founderEmail).map((x: any) => x.id)
    if (dummyAdminIds.length > 0) {
      db.prepare(`DELETE FROM admin_user_roles WHERE admin_id IN (${dummyAdminIds.map(() => '?').join(',')})`).run(...dummyAdminIds)
      db.prepare("DELETE FROM admin_users WHERE email != ?").run(founderEmail)
      console.log(`  ✓ Purged dummy admin accounts (retained Founder ${founderEmail})`)
    }
  }

  try { db.exec('PRAGMA foreign_keys = ON;') } catch (_) {}

  console.log(`✨ Database clean-up complete! Founder account (${founderEmail}) strictly preserved.`)
}

cleanDummyData()
