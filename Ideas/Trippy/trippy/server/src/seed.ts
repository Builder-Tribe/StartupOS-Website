import { db, uid, j, daysFromNow, slugify, nowIso, today } from './db.js'
import { personalityFor } from './lib/matching.js'
import { hashPassword } from './lib/partnerAuth.js'
import { PERMISSIONS, ROLES, DEFAULT_ROLE_PERMISSIONS } from './lib/permissions.js'

// Seeds the database with demo destinations, hostels, operator group trips,
// demo travelers, and partner organizations so the full workflow (consumer +
// Partner CRM) works on first run. Consumer and partner seeds are guarded
// independently so partners seed even on a DB that already has consumer data.

export function seedIfEmpty() {
  cleanupDummyData()
  seedConsumerIfEmpty()
  if (process.env.TRIPPY_TEST === '1') {
    seedPartnersIfEmpty()
  }
  seedRealCommunities()
  seedDemoConsumer()
  seedAdmin()
  seedFounderAccount()
  seedStoriesIfEmpty()
  updateExpiredTripDates()
}

export function cleanupDummyData() {
  if (process.env.TRIPPY_TEST === '1') return
  const dummySlugs = ['himalayan-wolves', 'coastal-nomads', 'peak-chasers', 'test-community', 'demo-partner', 'test']
  for (const slug of dummySlugs) {
    const org = db.prepare('SELECT id FROM partner_orgs WHERE slug = ?').get(slug) as any
    if (org) {
      db.prepare('DELETE FROM trip_itinerary_days WHERE trip_id IN (SELECT id FROM partner_trips WHERE org_id = ?)').run(org.id)
      db.prepare('DELETE FROM trip_media WHERE trip_id IN (SELECT id FROM partner_trips WHERE org_id = ?)').run(org.id)
      db.prepare('DELETE FROM trip_tags WHERE trip_id IN (SELECT id FROM partner_trips WHERE org_id = ?)').run(org.id)
      db.prepare('DELETE FROM bookings WHERE trip_id IN (SELECT id FROM partner_trips WHERE org_id = ?)').run(org.id)
      db.prepare('DELETE FROM waitlist WHERE trip_id IN (SELECT id FROM partner_trips WHERE org_id = ?)').run(org.id)
      db.prepare('DELETE FROM trip_outbound_clicks WHERE trip_id IN (SELECT id FROM partner_trips WHERE org_id = ?)').run(org.id)
      db.prepare("DELETE FROM trip_reviews WHERE target_type = 'partner_trip' AND target_id IN (SELECT id FROM partner_trips WHERE org_id = ?)").run(org.id)
      db.prepare('DELETE FROM partner_trips WHERE org_id = ?').run(org.id)
      db.prepare('DELETE FROM partner_admins WHERE org_id = ?').run(org.id)
      db.prepare('DELETE FROM partner_orgs WHERE id = ?').run(org.id)
    }
  }
  const orphanTripSubquery = `SELECT id FROM partner_trips WHERE org_id NOT IN (SELECT id FROM partner_orgs)`
  db.prepare(`DELETE FROM trip_itinerary_days WHERE trip_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM trip_media WHERE trip_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM trip_tags WHERE trip_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM bookings WHERE trip_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM waitlist WHERE trip_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM trip_outbound_clicks WHERE trip_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM trip_reviews WHERE target_type = 'partner_trip' AND target_id IN (${orphanTripSubquery})`).run()
  db.prepare(`DELETE FROM partner_trips WHERE org_id NOT IN (SELECT id FROM partner_orgs)`).run()

  // Purge any dummy admin accounts, strictly preserving Founder agarwal.harshit97@gmail.com
  const founderEmail = 'agarwal.harshit97@gmail.com'
  const dummyAdminIds = (db.prepare("SELECT id FROM admin_users WHERE email != ?").all(founderEmail) as any[]).map(x => x.id)
  if (dummyAdminIds.length > 0) {
    db.prepare(`DELETE FROM admin_user_roles WHERE admin_id IN (${dummyAdminIds.map(() => '?').join(',')})`).run(...dummyAdminIds)
    db.prepare("DELETE FROM admin_users WHERE email != ?").run(founderEmail)
    console.log(`[cleanup] Purged dummy admin accounts (retained Founder ${founderEmail})`)
  }
}

export function updateExpiredTripDates() {
  const tToday = today()
  const expiredPartnerTrips = db.prepare("SELECT id, duration_days FROM partner_trips WHERE end_date IS NOT NULL AND end_date < ?").all(tToday) as any[]
  for (const t of expiredPartnerTrips) {
    const dur = Math.max(1, t.duration_days || 3)
    const start = daysFromNow(15)
    const end = daysFromNow(15 + dur - 1)
    db.prepare("UPDATE partner_trips SET start_date = ?, end_date = ? WHERE id = ?").run(start, end, t.id)
  }

  const expiredGroupTrips = db.prepare("SELECT id, duration_days FROM group_trips WHERE start_date IS NOT NULL AND start_date < ?").all(tToday) as any[]
  for (const t of expiredGroupTrips) {
    const start = daysFromNow(14)
    db.prepare("UPDATE group_trips SET start_date = ? WHERE id = ?").run(start, t.id)
  }
}


export function seedFounderAccount() {
  const founderEmail = 'agarwal.harshit97@gmail.com'
  const founderName = 'Harshit Agarwal'
  const defaultPw = hashPassword('harshit@14597')

  // 1. Consumer DB: First Traveller
  let founderUser = db.prepare('SELECT * FROM users WHERE email = ?').get(founderEmail) as any
  if (founderUser) {
    if (!founderUser.password_hash) {
      db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(defaultPw.hash, defaultPw.salt, founderUser.id)
    }
    db.prepare(`UPDATE users SET
      email = ?, name = ?, gender = 'male', city = 'Bengaluru',
      avatar_color = '#0d9488', avatar_emoji = '🧭', travel_style = 'adventure',
      interests = ?, budget = 'mid-range', languages = ?,
      bio = 'Founder & Chief Explorer @ Trippy. Building the ultimate solo travel platform.',
      personality = 'Explorer', email_verified = 1, phone_verified = 1, id_verified = 1, onboarded = 1, status = 'active'
      WHERE id = ?`).run(founderEmail, founderName, j(['trekking', 'photography', 'mountains', 'cafes']), j(['english', 'hindi']), founderUser.id)
  } else {
    db.prepare(`INSERT OR IGNORE INTO users (id, email, password_hash, password_salt, name, gender, city, avatar_color, avatar_emoji, travel_style, interests, budget, languages, bio, personality, email_verified, phone_verified, id_verified, onboarded, status)
      VALUES (?, ?, ?, ?, ?, 'male', 'Bengaluru', '#0d9488', '🧭', 'adventure', ?, 'mid-range', ?, 'Founder & Chief Explorer @ Trippy. Building the ultimate solo travel platform.', 'Explorer', 1, 1, 1, 1, 'active')`)
      .run('3caa9a07-9729-4bcc-9d61-8217f588926b', founderEmail, defaultPw.hash, defaultPw.salt, founderName, j(['trekking', 'photography', 'mountains', 'cafes']), j(['english', 'hindi']))
  }

  // 2. Admin Console: Founder & Super Admin
  let founderAdmin = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(founderEmail) as any
  if (founderAdmin) {
    if (!founderAdmin.password_hash) {
      db.prepare('UPDATE admin_users SET password_hash = ?, password_salt = ? WHERE id = ?').run(defaultPw.hash, defaultPw.salt, founderAdmin.id)
    }
    db.prepare("UPDATE admin_users SET name = ?, status = 'active' WHERE id = ?").run(founderName, founderAdmin.id)
    db.prepare("INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, 'FOUNDER')").run(founderAdmin.id)
    db.prepare("INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, 'SUPER_ADMIN')").run(founderAdmin.id)
  } else {
    const adminId = uid()
    db.prepare("INSERT OR IGNORE INTO admin_users (id, email, password_hash, password_salt, name, status) VALUES (?, ?, ?, ?, ?, 'active')").run(adminId, founderEmail, defaultPw.hash, defaultPw.salt, founderName)
    db.prepare("INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, 'FOUNDER')").run(adminId)
    db.prepare("INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, 'SUPER_ADMIN')").run(adminId)
  }

  // 3. Partner Database: Founder Partner Org & Owner
  let founderOrg = db.prepare("SELECT * FROM partner_orgs WHERE id = 'effa9dd7-0f01-446c-9b2f-c5a32092b0b3' OR slug = 'trippy-official'").get() as any
  if (!founderOrg) {
    const orgId = 'effa9dd7-0f01-446c-9b2f-c5a32092b0b3'
    db.prepare(`INSERT OR IGNORE INTO partner_orgs (id, name, slug, logo_emoji, logo_color, about, website, status)
      VALUES (?, 'Trippy Official & Host Community', 'trippy-official', '🏔️', '#0d9488', 'Official travel community & hosted trips by Trippy Founder.', 'https://trippy.in', 'active')`)
      .run(orgId)
    founderOrg = db.prepare("SELECT * FROM partner_orgs WHERE id = ?").get(orgId) as any
  } else {
    db.prepare("UPDATE partner_orgs SET name = 'Trippy Official & Host Community', slug = 'trippy-official', website = 'https://trippy.in', status = 'active' WHERE id = ?").run(founderOrg.id)
  }

  if (founderOrg && founderOrg.id) {
    let founderPartnerAdmin = db.prepare('SELECT * FROM partner_admins WHERE email = ?').get(founderEmail) as any
    if (founderPartnerAdmin) {
      if (!founderPartnerAdmin.password_hash) {
        db.prepare('UPDATE partner_admins SET password_hash = ?, password_salt = ? WHERE id = ?').run(defaultPw.hash, defaultPw.salt, founderPartnerAdmin.id)
      }
      db.prepare("UPDATE partner_admins SET org_id = ?, name = ?, role = 'owner', status = 'active' WHERE id = ?").run(founderOrg.id, founderName, founderPartnerAdmin.id)
    } else {
      db.prepare("INSERT OR IGNORE INTO partner_admins (id, org_id, email, password_hash, password_salt, name, role, status) VALUES (?, ?, ?, ?, ?, ?, 'owner', 'active')")
        .run(uid(), founderOrg.id, founderEmail, defaultPw.hash, defaultPw.salt, founderName)
    }
  }
}

// Admin roles/permissions are always reconciled (idempotent); admin users +
// hostel lifecycle variety seed once when there are no admins yet.
function seedAdmin() {
  const insPerm = db.prepare('INSERT OR IGNORE INTO admin_permissions (key, grp, label) VALUES (?, ?, ?)')
  for (const p of PERMISSIONS) insPerm.run(p.key, p.grp, p.label)
  const insRole = db.prepare('INSERT OR IGNORE INTO admin_roles (key, label, description) VALUES (?, ?, ?)')
  for (const r of ROLES) insRole.run(r.key, r.label, r.description)
  const insRP = db.prepare('INSERT OR IGNORE INTO admin_role_permissions (role_key, permission) VALUES (?, ?)')
  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) for (const p of perms) insRP.run(role, p)

  if ((db.prepare('SELECT COUNT(*) AS c FROM admin_users').get() as any).c > 0) return
  console.log('[seed] Seeding admin users, roles & hostel lifecycle variety...')

  const mkAdmin = (email: string, name: string, password: string, roles: string[]) => {
    const id = uid()
    const { hash, salt } = hashPassword(password)
    db.prepare('INSERT INTO admin_users (id, email, password_hash, password_salt, name) VALUES (?, ?, ?, ?, ?)').run(id, email, hash, salt, name)
    const insUR = db.prepare('INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, ?)')
    for (const r of roles) insUR.run(id, r)
  }
  if (process.env.TRIPPY_TEST === '1') {
    mkAdmin('founder@trippy.test', 'Aditi Founder', 'Founder@123', ['FOUNDER'])
    mkAdmin('super@trippy.test', 'Super Admin', 'Super@123', ['SUPER_ADMIN'])
    mkAdmin('ops@trippy.test', 'Ravi Ops', 'Ops@12345', ['OPERATIONS_ADMIN'])
    mkAdmin('partners@trippy.test', 'Priya Partners', 'Partner@123', ['PARTNER_MANAGER'])
    mkAdmin('trips@trippy.test', 'Tarun Trips', 'Trips@12345', ['TRIP_MANAGER'])
    mkAdmin('hostels@trippy.test', 'Hema Hostels', 'Hostel@123', ['HOSTEL_MANAGER'])
    mkAdmin('analyst@trippy.test', 'Anya Analyst', 'Analyst@123', ['ANALYST'])
    mkAdmin('readonly@trippy.test', 'Rohan ReadOnly', 'Readonly@123', ['READ_ONLY_ADMIN'])
  }

  // Give seeded hostels cover images + slugs, then a spread of lifecycle statuses.
  for (const h of db.prepare('SELECT id, name FROM hostels').all() as any[]) {
    db.prepare("UPDATE hostels SET cover_image = ?, slug = COALESCE(NULLIF(slug,''), ?), source = 'seed', status = COALESCE(NULLIF(status,''),'published'), country = COALESCE(country,'India') WHERE id = ?")
      .run(`https://picsum.photos/seed/${slugify(h.name)}/1200/800`, slugify(h.name), h.id)
  }
  const setStatus = (name: string, status: string) => db.prepare('UPDATE hostels SET status = ? WHERE name = ?').run(status, name)
  setStatus('Nomads Hive', 'draft')
  setStatus('Parvati Woods Camp', 'suspended')
  setStatus('Bunk Stay Ashram Rd', 'permanently_closed')
  db.prepare("UPDATE hostels SET featured = 1 WHERE name IN ('Zostel Old Manali', 'Zostel Gokarna')").run()

  // A couple of internal notes + login events so 360 pages show data on day one.
  const demo = db.prepare("SELECT id FROM users WHERE email = 'traveller@trippy.test'").get() as any
  if (demo) {
    db.prepare("INSERT INTO internal_notes (id, entity_type, entity_id, author_name, content) VALUES (?, 'traveller', ?, 'Ops (seed)', 'Demo traveller account used for QA.')").run(uid(), demo.id)
    for (let i = 0; i < 3; i++) {
      db.prepare("INSERT INTO login_events (id, user_type, user_id, email, success, provider, device, browser, os, created_at) VALUES (?, 'traveller', ?, 'traveller@trippy.test', 1, 'password', 'Desktop', 'Chrome', 'macOS', datetime('now', ?))")
        .run(uid(), demo.id, `-${i} days`)
    }
    db.prepare("UPDATE users SET last_login_at = datetime('now'), login_count = 3 WHERE id = ?").run(demo.id)
  }
  const wolves = db.prepare("SELECT id FROM partner_orgs WHERE slug = 'himalayan-wolves'").get() as any
  if (wolves) db.prepare("INSERT INTO internal_notes (id, entity_type, entity_id, author_name, content) VALUES (?, 'partner', ?, 'Ops (seed)', 'High-quality Himalayan trekking community. Priority partner.')").run(uid(), wolves.id)
}

// A ready-to-use, fully-onboarded consumer login for testing (idempotent).
function seedDemoConsumer() {
  const email = 'traveller@trippy.test'
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) return
  const { hash, salt } = hashPassword('Traveller@123')
  db.prepare(`INSERT INTO users (id, email, password_hash, password_salt, email_verified, name, age, gender, city,
    avatar_emoji, avatar_color, travel_style, interests, budget, languages, bio, personality, onboarded)
    VALUES (?, ?, ?, ?, 1, 'Demo Traveller', 27, 'female', 'Bengaluru', '🧭', '#0d9488', 'adventure',
    ?, 'mid-range', ?, 'Demo account for testing the traveller experience.', 'Explorer', 1)`)
    .run(uid(), email, hash, salt, j(['trekking', 'photography', 'cafes']), j(['english', 'hindi']))
  console.log('[seed] Demo consumer: traveller@trippy.test / Traveller@123')
}

function seedConsumerIfEmpty() {
  const count = (db.prepare('SELECT COUNT(*) AS c FROM destinations').get() as any).c
  if (count > 0) return
  console.log('[seed] Empty database — seeding demo data...')

  // ---- Destinations (cost model powers the DIY estimate) ----
  const destinations = [
    { slug: 'manali', name: 'Manali', state: 'Himachal Pradesh', emoji: '🏔️', tagline: 'Old town cafés, snow peaks and trail heads',
      hostel_night: 600, food_day: 500, transport_day: 300, intercity: 2400,
      activities: [{ name: 'Hampta Pass day trek', cost: 1500 }, { name: 'Solang Valley paragliding', cost: 2200 }, { name: 'Jogini waterfall hike', cost: 0 }, { name: 'Old Manali café crawl', cost: 400 }],
      extras: ['Book Volvo bus from Delhi in advance', 'Carry layers — evenings get cold'],
      best_months: 'Mar–Jun, Sep–Nov', tags: ['mountains', 'trekking', 'cafes'] },
    { slug: 'kasol', name: 'Kasol', state: 'Himachal Pradesh', emoji: '🌲', tagline: 'Parvati valley, riverside camps and trance nights',
      hostel_night: 500, food_day: 450, transport_day: 250, intercity: 2200,
      activities: [{ name: 'Kheerganga trek (overnight)', cost: 1200 }, { name: 'Chalal village walk', cost: 0 }, { name: 'Manikaran hot springs', cost: 100 }, { name: 'Riverside bonfire night', cost: 300 }],
      extras: ['Network is patchy beyond Kasol market', 'ATMs are scarce — carry cash'],
      best_months: 'Mar–Jun, Oct–Nov', tags: ['mountains', 'trekking', 'music'] },
    { slug: 'spiti-valley', name: 'Spiti Valley', state: 'Himachal Pradesh', emoji: '🏜️', tagline: 'High-altitude cold desert, monasteries and moonscapes',
      hostel_night: 700, food_day: 550, transport_day: 700, intercity: 3500,
      activities: [{ name: 'Key Monastery visit', cost: 100 }, { name: 'Chandratal lake camp', cost: 1800 }, { name: 'Pin Valley day trip', cost: 900 }, { name: 'Fossil hunting in Langza', cost: 0 }],
      extras: ['Acclimatise a day in Kaza — altitude is 3,800m', 'Inner line permit needed for some routes'],
      best_months: 'Jun–Sep', tags: ['mountains', 'biking', 'photography'] },
    { slug: 'udaipur', name: 'Udaipur', state: 'Rajasthan', emoji: '🏰', tagline: 'Lakes, palaces and rooftop sunset views',
      hostel_night: 550, food_day: 500, transport_day: 250, intercity: 2000,
      activities: [{ name: 'City Palace tour', cost: 400 }, { name: 'Lake Pichola boat ride', cost: 500 }, { name: 'Monsoon Palace sunset', cost: 200 }, { name: 'Old city heritage walk', cost: 0 }],
      extras: ['Summers are hot — plan mornings and evenings out'],
      best_months: 'Sep–Mar', tags: ['heritage', 'food', 'photography'] },
    { slug: 'gokarna', name: 'Gokarna', state: 'Karnataka', emoji: '🏖️', tagline: 'Quiet beaches, cliff walks and shack sunsets',
      hostel_night: 500, food_day: 450, transport_day: 200, intercity: 2600,
      activities: [{ name: 'Beach trek: Om to Paradise', cost: 0 }, { name: 'Kayaking at Om beach', cost: 700 }, { name: 'Mirjan Fort day trip', cost: 300 }, { name: 'Sunset at Kudle cliff', cost: 0 }],
      extras: ['Beach shacks close in monsoon (Jun–Aug)'],
      best_months: 'Oct–Mar', tags: ['beaches', 'yoga', 'chill'] },
    { slug: 'rishikesh', name: 'Rishikesh', state: 'Uttarakhand', emoji: '🛶', tagline: 'Ganga rapids, yoga ashrams and mountain air',
      hostel_night: 450, food_day: 400, transport_day: 200, intercity: 1400,
      activities: [{ name: 'River rafting (16 km)', cost: 900 }, { name: 'Sunrise Kunjapuri trek', cost: 600 }, { name: 'Ganga aarti at Triveni Ghat', cost: 0 }, { name: 'Drop-in yoga class', cost: 300 }],
      extras: ['Rafting shuts during peak monsoon'],
      best_months: 'Sep–Jun', tags: ['yoga', 'water sports', 'spiritual'] },
    { slug: 'hampi', name: 'Hampi', state: 'Karnataka', emoji: '🗿', tagline: 'Ancient ruins, giant boulders and laid-back traveller culture',
      hostel_night: 450, food_day: 380, transport_day: 200, intercity: 1800,
      activities: [{ name: 'Bicycle ruins tour', cost: 150 }, { name: 'Matanga Hill sunrise', cost: 0 }, { name: 'Tungabhadra river coracle', cost: 100 }, { name: 'Vittala temple complex', cost: 600 }],
      extras: ['Cross the coracle to Virupapur Gadde for quieter guesthouses', 'Best light for photography at golden hour on boulders'],
      best_months: 'Oct–Mar', tags: ['heritage', 'backpacking', 'photography'] },
    { slug: 'pondicherry', name: 'Pondicherry', state: 'Tamil Nadu', emoji: '🏛️', tagline: 'French quarter, sea promenade and great food on any budget',
      hostel_night: 600, food_day: 500, transport_day: 200, intercity: 1600,
      activities: [{ name: 'French Quarter café walk', cost: 400 }, { name: 'Auroville day visit', cost: 150 }, { name: 'Promenade beach sunrise', cost: 0 }, { name: 'Paradise Beach ferry', cost: 300 }],
      extras: ['Rent a cycle — the city is flat and easy to navigate', 'Most good restaurants are BYOB or serve no alcohol'],
      best_months: 'Oct–Mar', tags: ['culture', 'food', 'chill'] },
    { slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', emoji: '🪔', tagline: 'The oldest living city — ghats, fire and the Ganga at dawn',
      hostel_night: 500, food_day: 400, transport_day: 200, intercity: 1800,
      activities: [{ name: 'Dawn boat ride on the Ganges', cost: 300 }, { name: 'Ganga Aarti at Dashashwamedh Ghat', cost: 0 }, { name: 'Old city lanes walk', cost: 0 }, { name: 'Sarnath day trip', cost: 400 }],
      extras: ['Wake up at 5am — Varanasi at dawn is a completely different city', 'The old city is best navigated on foot or cycle rickshaw'],
      best_months: 'Oct–Mar', tags: ['spiritual', 'culture', 'history'] },
    { slug: 'coorg', name: 'Coorg', state: 'Karnataka', emoji: '☕', tagline: 'Coffee trails, misty jungles and waterfall hikes',
      hostel_night: 800, food_day: 550, transport_day: 300, intercity: 2000,
      activities: [{ name: 'Coffee plantation walk', cost: 500 }, { name: 'Abbey Falls trek', cost: 0 }, { name: 'River rafting at Barapole', cost: 1200 }, { name: 'Tadiandamol peak trek', cost: 800 }],
      extras: ['Book homestays — they include meals and give you the real Coorg experience', 'Monsoon (Jun–Sep) is lush but roads can be tricky'],
      best_months: 'Oct–May', tags: ['nature', 'adventure', 'food'] },
    { slug: 'ladakh', name: 'Leh–Ladakh', state: 'Jammu & Kashmir', emoji: '🏔️', tagline: 'Empty roads at 5,000m, monasteries and magnetic skies',
      hostel_night: 700, food_day: 600, transport_day: 800, intercity: 8000,
      activities: [{ name: 'Pangong Lake day trip', cost: 1500 }, { name: 'Khardung La pass visit', cost: 400 }, { name: 'Nubra Valley dunes', cost: 1200 }, { name: 'Magnetic Hill and Indus confluence', cost: 200 }],
      extras: ['Acclimatise 2 full days in Leh before any excursions', 'Inner line permits needed for Pangong and Nubra'],
      best_months: 'Jun–Sep', tags: ['mountains', 'biking', 'photography'] },
    { slug: 'bir-billing', name: 'Bir Billing', state: 'Himachal Pradesh', emoji: '🪂', tagline: 'World-class paragliding, tea trails and Himalayan views',
      hostel_night: 550, food_day: 450, transport_day: 300, intercity: 2200,
      activities: [{ name: 'Tandem paragliding flight', cost: 2500 }, { name: 'Tea estate walk', cost: 0 }, { name: 'Baijnath temple visit', cost: 0 }, { name: 'Sunrise trek to Billing', cost: 600 }],
      extras: ['Book paragliding in advance — spots fill up fast on weekends', 'Billing take-off point is at 2,400m — dress warm'],
      best_months: 'Mar–Jun, Sep–Nov', tags: ['adventure', 'paragliding', 'mountains'] },
    { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', emoji: '🏯', tagline: 'Pink city palaces, forts and the best street food in Rajasthan',
      hostel_night: 550, food_day: 500, transport_day: 250, intercity: 1600,
      activities: [{ name: 'Amber Fort with elephant view', cost: 500 }, { name: 'Hawa Mahal photo stop', cost: 50 }, { name: 'City Palace tour', cost: 700 }, { name: 'Bapu Bazaar shopping walk', cost: 0 }],
      extras: ['Combine with Pushkar (2.5h away) for a magical 4-5 day Rajasthan loop', 'Summers are brutal — stick to Oct–Mar'],
      best_months: 'Oct–Mar', tags: ['heritage', 'culture', 'food'] },
    { slug: 'varkala', name: 'Varkala', state: 'Kerala', emoji: '🌅', tagline: 'Red cliffs, Ayurvedic bliss and Kerala backwater vibes',
      hostel_night: 650, food_day: 500, transport_day: 250, intercity: 2400,
      activities: [{ name: 'Clifftop promenade walk', cost: 0 }, { name: 'Papanasam beach swim', cost: 0 }, { name: 'Ayurvedic massage session', cost: 1200 }, { name: 'Backwater canoe ride', cost: 800 }],
      extras: ['The cliff restaurants are pricier but the sunset view is worth it once', 'Jan–Mar is peak — book a week ahead'],
      best_months: 'Oct–Mar', tags: ['beaches', 'spiritual', 'yoga'] },
  ]
  const insDest = db.prepare(`INSERT INTO destinations (slug, name, state, emoji, tagline, hostel_night, food_day, transport_day, intercity, activities, extras, best_months, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const d of destinations) {
    insDest.run(d.slug, d.name, d.state, d.emoji, d.tagline, d.hostel_night, d.food_day, d.transport_day, d.intercity, j(d.activities), j(d.extras), d.best_months, j(d.tags))
  }

  // ---- Hostels ----
  const hostels: [string, string, string, number, number, number, string[], string[], string][] = [
    ['manali', 'Zostel Old Manali', 'Old Manali', 649, 4.6, 812, ['wifi', 'cafe', 'bonfire', 'mountain view'], ['social', 'party'], 'The classic backpacker hub above the Manalsu river.'],
    ['manali', 'The Lost Tribe Hostel', 'Vashisht', 549, 4.4, 431, ['wifi', 'common kitchen', 'workspace'], ['chill', 'social'], 'Quiet hostel with a big sun deck facing the peaks.'],
    ['manali', 'Nomads Hive', 'Naggar Road', 449, 4.2, 265, ['wifi', 'bonfire', 'parking'], ['quiet', 'chill'], 'Budget stay popular with long-term remote workers.'],
    ['kasol', 'Whoopers Hostel', 'Kasol Market', 499, 4.5, 655, ['wifi', 'cafe', 'riverside'], ['party', 'social'], 'Riverside bunks a minute from the main market.'],
    ['kasol', 'The Hosteller Kasol', 'Chalal Road', 549, 4.4, 502, ['wifi', 'bonfire', 'games room'], ['social', 'chill'], 'Big common area, nightly bonfires, trek desk.'],
    ['kasol', 'Parvati Woods Camp', 'Chalal', 399, 4.1, 187, ['bonfire', 'riverside', 'meals'], ['quiet', 'chill'], 'Tented camp across the bridge in the pine woods.'],
    ['spiti-valley', 'Zostel Spiti', 'Kaza', 749, 4.7, 390, ['wifi', 'cafe', 'heater', 'mountain view'], ['social', 'chill'], 'Warm common room at 3,800m — the Kaza meeting point.'],
    ['spiti-valley', 'The Nomad\'s Cottage', 'Kaza Old Town', 599, 4.3, 214, ['meals', 'heater', 'terrace'], ['quiet', 'chill'], 'Family-run mud house with home-cooked thalis.'],
    ['spiti-valley', 'Tashi Homestay Bunks', 'Langza', 499, 4.5, 98, ['meals', 'village stay'], ['quiet'], 'Sleep under the Buddha statue in a fossil village.'],
    ['udaipur', 'Zostel Udaipur', 'Lal Ghat', 599, 4.6, 903, ['wifi', 'rooftop cafe', 'lake view'], ['social', 'party'], 'Rooftop looks straight over Lake Pichola.'],
    ['udaipur', 'GoStops Udaipur', 'Chandpole', 499, 4.3, 476, ['wifi', 'cafe', 'games room'], ['social', 'chill'], 'Colourful haveli conversion near the footbridge.'],
    ['udaipur', 'Bunkyard Hostel', 'Hanuman Ghat', 549, 4.5, 388, ['wifi', 'rooftop', 'lake view'], ['chill', 'social'], 'Small, artsy, and right on the quieter west bank.'],
    ['gokarna', 'Zostel Gokarna', 'Kudle Beach', 699, 4.5, 561, ['wifi', 'cafe', 'sea view'], ['social', 'chill'], 'On the cliff above Kudle — sunset from the dorm balcony.'],
    ['gokarna', 'Trippr Gokarna', 'Om Beach Road', 499, 4.3, 322, ['wifi', 'cafe', 'hammocks'], ['party', 'social'], 'Hammock garden halfway between town and Om beach.'],
    ['gokarna', 'Shanti Beach House', 'Paradise Beach Trail', 399, 4.0, 140, ['meals', 'sea view'], ['quiet'], 'Bare-bones beach hut stay for switch-off trips.'],
    ['rishikesh', 'Zostel Rishikesh', 'Tapovan', 549, 4.6, 788, ['wifi', 'cafe', 'yoga deck'], ['social', 'chill'], 'Yoga deck upstairs, rafting desk downstairs.'],
    ['rishikesh', 'Live Free Hostel', 'Laxman Jhula', 449, 4.4, 415, ['wifi', 'cafe', 'river view'], ['chill', 'social'], 'Ganga-facing common room, big breakfast menu.'],
    ['rishikesh', 'Bunk Stay Ashram Rd', 'Ram Jhula', 349, 4.1, 203, ['wifi', 'meals'], ['quiet'], 'Simple and silent — next door to the ashram quarter.'],
    ['hampi', 'Zostel Hampi', 'Virupapur Gadde', 549, 4.6, 612, ['wifi', 'cafe', 'rooftop', 'river view'], ['social', 'chill'], 'Across the river — the quiet side of Hampi with mango grove views.'],
    ['hampi', 'Rocky Boulders Hostel', 'Hampi Bazaar', 399, 4.3, 298, ['wifi', 'common kitchen', 'cycle hire'], ['backpacking', 'social'], 'Literally surrounded by boulders. Great for sunrise walks.'],
    ['hampi', 'Mango Tree Stay', 'Virupapur Gadde', 349, 4.1, 176, ['meals', 'riverside', 'hammocks'], ['quiet', 'chill'], 'Simple rooms by the rice paddy — Tungabhadra at your doorstep.'],
    ['pondicherry', 'The Promenade Hostel', 'White Town', 649, 4.5, 445, ['wifi', 'cafe', 'french quarter walk'], ['social', 'chill'], 'Heritage villa conversion in the French Quarter.'],
    ['pondicherry', 'Ithaca Hostel', 'Mission Street', 549, 4.4, 312, ['wifi', 'rooftop', 'games room'], ['social', 'party'], 'Bright, modern hostel two streets from the beach promenade.'],
    ['varanasi', 'Stops Hostel Varanasi', 'Assi Ghat', 499, 4.5, 534, ['wifi', 'cafe', 'ganga view', 'rooftop'], ['social', 'chill'], 'Rooftop overlooks the Assi Ghat — perfect for the aarti.'],
    ['varanasi', 'Brown Bread Bakery Hostel', 'Shivala Ghat', 449, 4.3, 267, ['wifi', 'cafe', 'meals'], ['quiet', 'chill'], 'Artsy ghat-side stay with a legendary in-house bakery.'],
    ['coorg', 'Zostel Coorg', 'Madikeri', 649, 4.5, 389, ['wifi', 'cafe', 'valley view', 'bonfire'], ['social', 'chill'], 'Misty valley views and a bonfire that goes till midnight.'],
    ['coorg', 'Coffee Trail Homestay', 'Siddapur', 899, 4.6, 198, ['meals', 'plantation tour', 'wifi'], ['quiet', 'chill'], 'Family-run plantation stay with home-cooked Kodava food.'],
    ['ladakh', 'Zostel Leh', 'Old Town Leh', 799, 4.7, 678, ['wifi', 'cafe', 'mountain view', 'heater'], ['social', 'chill'], 'Central Leh base — closest hostel to the palace viewpoint.'],
    ['ladakh', 'Stok Palace Heritage', 'Stok Village', 999, 4.8, 145, ['meals', 'wifi', 'mountain view'], ['quiet'], 'Guesthouse inside a 200-year-old Ladakhi palace.'],
    ['bir-billing', 'The Hosteller Bir', 'Bir Chowgan', 549, 4.6, 432, ['wifi', 'cafe', 'bonfire', 'paragliding desk'], ['social', 'adventure'], 'Ground zero for paragliding — they book your flights at reception.'],
    ['bir-billing', 'Zostel Bir', 'Tibet Colony', 499, 4.4, 287, ['wifi', 'games room', 'views'], ['social', 'chill'], 'Above the Tibetan colony with a clear landing field view.'],
    ['jaipur', 'Zostel Jaipur', 'Bani Park', 549, 4.5, 821, ['wifi', 'pool', 'cafe', 'rooftop'], ['social', 'party'], 'Pool hostel 10 min from the old city — usually a party.'],
    ['jaipur', 'Moustache Jaipur', 'Civil Lines', 499, 4.4, 563, ['wifi', 'cafe', 'heritage tours'], ['social', 'chill'], 'Heritage bungalow with a great rooftop and city tour desk.'],
    ['varkala', 'Zostel Varkala', 'North Cliff', 599, 4.6, 498, ['wifi', 'cafe', 'cliff view', 'yoga deck'], ['social', 'chill'], 'North Cliff perch with unobstructed Arabian Sea sunsets.'],
    ['varkala', 'Abba Beach Hostel', 'Helipad Beach', 499, 4.3, 234, ['wifi', 'hammocks', 'sea view'], ['quiet', 'chill'], 'Clifftop hideout above the quieter Helipad beach.'],
  ]
  const insHostel = db.prepare(`INSERT INTO hostels (id, destination, name, area, price_per_night, rating, review_count, amenities, vibe_tags, description, partner, booking_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const hostelIds: Record<string, string[]> = {}
  for (const [dest, name, area, price, rating, reviews, amenities, vibes, desc] of hostels) {
    const id = uid()
    ;(hostelIds[dest] ||= []).push(id)
    insHostel.run(id, dest, name, area, price, rating, reviews, j(amenities), j(vibes), desc, name.startsWith('Zostel') ? 1 : 0, 'https://example.com/book/' + encodeURIComponent(name))
  }

  // ---- Operator group trips (powers DIY-vs-group comparison, PRD 1.6) ----
  const trips: [string, string, string, number, number, string, number, string[], string[], string, number, number, number, number, number | null, number | null][] = [
    ['manali', 'WanderOn', 'Manali & Hampta Weekend Escape', 8999, 4, 'Delhi', 12, ['transport', 'stay', 'meals', 'trek guide'], ['trekking', 'camping'], 'moderate', 4.5, 342, 20, 14, 8, 6],
    ['manali', 'Plan the Unplan', 'Manali Backpacking 5D', 10499, 5, 'Delhi', 18, ['transport', 'hostel stay', 'breakfast', 'paragliding'], ['sightseeing', 'adventure'], 'easy', 4.3, 188, 22, 12, 7, 5],
    ['kasol', 'TripBae', 'Kasol Kheerganga Trek Batch', 7499, 4, 'Delhi', 10, ['transport', 'camps', 'meals', 'trek lead'], ['trekking', 'camping', 'music'], 'moderate', 4.4, 267, 18, 15, 9, 6],
    ['kasol', 'Adventure Buddha', 'Parvati Valley Explorer', 9299, 5, 'Chandigarh', 8, ['transport', 'stay', 'breakfast', 'village walks'], ['trekking', 'culture'], 'easy', 4.2, 121, 16, 9, null, null],
    ['spiti-valley', 'WanderOn', 'Spiti Full Circuit 7D', 17999, 7, 'Delhi', 15, ['tempo traveller', 'stay', 'meals', 'permits', 'oxygen support'], ['road trip', 'photography'], 'difficult', 4.7, 456, 14, 11, 6, 5],
    ['spiti-valley', 'Zo Trips', 'Winter-less Spiti 6D', 15499, 6, 'Manali', 9, ['transport', 'homestays', 'meals'], ['road trip', 'culture'], 'difficult', 4.5, 203, 12, 7, null, null],
    ['udaipur', 'TripBae', 'Royal Udaipur Weekend', 6999, 3, 'Jaipur', 20, ['transport', 'hostel stay', 'heritage walk', 'boat ride'], ['sightseeing', 'food'], 'easy', 4.3, 154, 24, 13, 6, 7],
    ['gokarna', 'Plan the Unplan', 'Gokarna Beach Trek 3D', 6499, 3, 'Bengaluru', 25, ['transport', 'beach stay', 'breakfast', 'trek lead'], ['beaches', 'trekking'], 'easy', 4.4, 289, 25, 19, 10, 9],
    ['gokarna', 'Adventure Buddha', 'Gokarna + Murudeshwar 4D', 8299, 4, 'Bengaluru', 14, ['transport', 'stay', 'kayaking', 'temple visit'], ['beaches', 'water sports'], 'easy', 4.1, 96, 20, 8, null, null],
    ['rishikesh', 'Zo Trips', 'Rishikesh Rafting Weekend', 5999, 3, 'Delhi', 30, ['transport', 'camp stay', 'meals', 'rafting', 'bonfire'], ['water sports', 'camping'], 'easy', 4.5, 511, 28, 21, 12, 9],
    ['rishikesh', 'WanderOn', 'Yoga & Rapids Retreat 4D', 8499, 4, 'Delhi', 22, ['transport', 'hostel stay', 'yoga sessions', 'rafting'], ['yoga', 'water sports'], 'easy', 4.6, 178, 16, 10, 4, 6],
    // Ladakh — adventure / biking / premium
    ['ladakh', 'WanderOn', 'Leh–Ladakh Bike Trip 8D', 22999, 8, 'Delhi', 28, ['flight to Leh', 'Royal Enfield rental', 'guesthouses', 'breakfast', 'permits'], ['biking', 'road-trip', 'photography'], 'difficult', 4.8, 312, 12, 8, 5, 3],
    ['ladakh', 'Zo Trips', 'Pangong & Nubra Circuit 7D', 27999, 7, 'Delhi', 35, ['flights', 'SUV', 'hotels', 'all meals', 'permits', 'guide'], ['road-trip', 'photography', 'adventure'], 'moderate', 4.7, 201, 10, 6, null, null],
    ['ladakh', 'Plan the Unplan', 'Ladakh Backpacker Circuit 9D', 18499, 9, 'Delhi', 32, ['flight', 'budget stays', 'breakfast', 'permits', 'local guide'], ['backpacking', 'trekking', 'culture'], 'moderate', 4.6, 144, 14, 10, 7, 3],
    // Hampi — cultural / backpacking / heritage
    ['hampi', 'Plan the Unplan', 'Hampi Ruins & River Weekend', 6499, 3, 'Bengaluru', 14, ['sleeper bus', 'heritage guesthouse', 'breakfast', 'cycle hire', 'guided ruins walk'], ['culture', 'heritage', 'backpacking'], 'easy', 4.4, 189, 20, 15, 8, 7],
    ['hampi', 'TripBae', 'Hampi & Badami Heritage 4D', 8999, 4, 'Bengaluru', 21, ['AC transport', 'boutique stay', 'all meals', 'expert heritage guide'], ['culture', 'history', 'photography'], 'easy', 4.3, 112, 16, 9, null, null],
    ['hampi', 'Adventure Buddha', 'Hampi Boulder Camping 3D', 5999, 3, 'Bengaluru', 18, ['bus', 'boulder camp', 'all meals', 'sunrise climb'], ['camping', 'adventure', 'heritage'], 'easy', 4.5, 98, 18, 12, 6, 6],
    // Pondicherry — chill / cultural / couples
    ['pondicherry', 'Zo Trips', 'Pondi Slow Weekend 3D', 5999, 3, 'Chennai', 10, ['AC bus', 'boutique guesthouse', 'breakfast', 'French quarter walk', 'Auroville visit'], ['chill', 'culture', 'food'], 'easy', 4.5, 245, 18, 12, 6, 6],
    ['pondicherry', 'TripBae', 'Pondi + Auroville Explorer 4D', 7499, 4, 'Chennai', 16, ['AC cab', 'stay', 'breakfasts', 'promenade walk', 'beach time'], ['culture', 'chill', 'spiritual'], 'easy', 4.3, 178, 20, 14, 5, 9],
    // Varanasi — spiritual / cultural
    ['varanasi', 'Adventure Buddha', 'Varanasi Ghat Immersion 4D', 8499, 4, 'Delhi', 20, ['AC train both ways', 'ghat guesthouse', 'all meals', 'aarti ceremony', 'boat ride', 'Sarnath trip'], ['spiritual', 'culture', 'history'], 'easy', 4.6, 178, 20, 14, 7, 7],
    ['varanasi', 'Plan the Unplan', 'Varanasi Photography Walk 3D', 6999, 3, 'Delhi', 15, ['train', 'ghat stay', 'breakfast', 'photo walk guide', 'boat ride'], ['photography', 'culture', 'spiritual'], 'easy', 4.4, 134, 16, 9, null, null],
    // Coorg — nature / adventure / chill
    ['coorg', 'TripBae', 'Coorg Coffee & Waterfalls 3D', 7499, 3, 'Bengaluru', 12, ['AC cab', 'plantation homestay', 'all meals', 'plantation tour', 'waterfall trek'], ['nature', 'adventure', 'food'], 'easy', 4.5, 298, 16, 11, null, null],
    ['coorg', 'WanderOn', 'Coorg Camping & Rafting 4D', 9999, 4, 'Bengaluru', 18, ['transport', 'forest camp', 'all meals', 'river rafting', 'jungle trek'], ['camping', 'adventure', 'nature'], 'moderate', 4.4, 156, 14, 10, 6, 4],
    // Bir Billing — adventure / paragliding
    ['bir-billing', 'WanderOn', 'Bir Paragliding Weekend', 7999, 3, 'Delhi', 16, ['Volvo bus', 'hostel', 'breakfast', 'tandem paragliding x2', 'tea estate walk'], ['adventure', 'paragliding', 'nature'], 'easy', 4.7, 421, 20, 16, 10, 6],
    ['bir-billing', 'Zo Trips', 'Bir & Dharamshala 4D', 9499, 4, 'Delhi', 22, ['Volvo bus', 'hostel stays', 'breakfast', 'paragliding', 'Dharamshala café trail', 'McLeod Ganj walk'], ['adventure', 'culture', 'mountains'], 'easy', 4.5, 267, 18, 13, 7, 6],
    // Jaipur — cultural / heritage / premium
    ['jaipur', 'Plan the Unplan', 'Jaipur & Pushkar Heritage 4D', 9499, 4, 'Delhi', 22, ['AC cab', 'heritage hotel', 'breakfast', 'Amber fort tour', 'camel safari', 'Pushkar lake walk'], ['culture', 'heritage', 'food'], 'easy', 4.4, 234, 22, 14, null, null],
    ['jaipur', 'TripBae', 'Royal Rajasthan 5D', 13999, 5, 'Delhi', 28, ['AC transport', 'heritage havelis', 'all meals', 'palace tours', 'folk dance show', 'cooking class'], ['culture', 'heritage', 'luxury'], 'easy', 4.6, 189, 16, 10, null, null],
    // Varkala — beach / spiritual / yoga
    ['varkala', 'Zo Trips', 'Kerala Cliffs & Yoga Retreat 4D', 8999, 4, 'Bengaluru', 20, ['flights', 'cliff guesthouse', 'breakfast', 'yoga class', 'Ayurvedic massage', 'backwater ride'], ['beaches', 'yoga', 'spiritual'], 'easy', 4.5, 198, 14, 9, 4, 5],
    ['varkala', 'Plan the Unplan', 'Varkala Beach Long Weekend 3D', 6499, 3, 'Bengaluru', 14, ['AC bus', 'cliff stay', 'breakfast', 'sunset walk', 'Papanasam beach'], ['beaches', 'chill', 'yoga'], 'easy', 4.4, 167, 18, 12, 5, 7],
  ]
  const insTrip = db.prepare(`INSERT INTO group_trips (id, destination, operator, title, price, duration_days, start_city, start_date, inclusions, activity_tags, difficulty, rating, review_count, group_size_max, group_size_current, gender_ratio, availability)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const [dest, operator, title, price, dur, city, startOffset, inclusions, tags, diff, rating, reviews, maxSize, current, male, female] of trips) {
    const availability = current >= maxSize ? 'full' : current >= maxSize - 3 ? 'filling_fast' : 'available'
    insTrip.run(uid(), dest, operator, title, price, dur, city, daysFromNow(startOffset), j(inclusions), j(tags), diff, rating, reviews, maxSize, current,
      male != null && female != null ? j({ male, female }) : null, availability)
  }

  // ---- Demo travelers: 3 per destination, overlapping dates, hostel stays ----
  const STYLES = ['adventure', 'cultural', 'leisure', 'party', 'spiritual', 'mixed']
  const demoUsers: [string, number, string, string, string, string[], string, string[], string, string, string][] = [
    // name, age, gender, city, style, interests, budget, languages, bio, emoji, color
    ['Aarav Mehta', 27, 'male', 'Delhi', 'adventure', ['trekking', 'camping', 'photography'], 'budget', ['hindi', 'english'], 'Weekend trekker chasing every Himachal trail. Always up for a sunrise hike.', '🥾', '#0d9488'],
    ['Sana Kapoor', 25, 'female', 'Mumbai', 'mixed', ['cafes', 'photography', 'trekking'], 'mid-range', ['hindi', 'english'], 'Shoot on film, plan on vibes. Looking for people to split cab fares and stories with.', '📸', '#e11d48'],
    ['Rohan Iyer', 30, 'male', 'Bengaluru', 'adventure', ['biking', 'camping', 'music'], 'mid-range', ['english', 'kannada'], 'Rode to Ladakh last year. Mountains > meetings.', '🏍️', '#7c3aed'],
    ['Mira Joshi', 24, 'female', 'Pune', 'party', ['music', 'nightlife', 'cafes'], 'budget', ['hindi', 'english', 'marathi'], 'Psytrance and parathas. Kasol regular, first-timer friendly.', '🎧', '#f59e0b'],
    ['Kabir Singh', 29, 'male', 'Chandigarh', 'adventure', ['trekking', 'music', 'camping'], 'budget', ['hindi', 'english', 'punjabi'], 'Guitar + tent + chai = plan. Happy to lead treks for beginners.', '🎸', '#2563eb'],
    ['Ananya Rao', 26, 'female', 'Hyderabad', 'mixed', ['trekking', 'food', 'photography'], 'mid-range', ['english', 'telugu'], 'Solo since 2022. I make great trip spreadsheets and better momo recommendations.', '🥟', '#059669'],
    ['Dev Sharma', 31, 'male', 'Delhi', 'adventure', ['biking', 'photography', 'history'], 'premium', ['hindi', 'english'], 'Spiti is my third time — ask me anything about the circuit.', '🗺️', '#b45309'],
    ['Isha Nair', 28, 'female', 'Kochi', 'cultural', ['photography', 'history', 'meditation'], 'mid-range', ['english', 'malayalam'], 'Monastery-hopping and cold-desert light. Slow traveler.', '🏔️', '#0891b2'],
    ['Arjun Malhotra', 33, 'male', 'Gurgaon', 'adventure', ['biking', 'camping', 'food'], 'premium', ['hindi', 'english'], 'RE Himalayan owner. Planning the full Kaza loop with buffer days.', '⛺', '#4f46e5'],
    ['Tara Bhatt', 26, 'female', 'Jaipur', 'cultural', ['history', 'architecture', 'food'], 'budget', ['hindi', 'english'], 'Heritage walks and rooftop chai. Will narrate palace gossip from 1559.', '🏰', '#db2777'],
    ['Vikram Menon', 29, 'male', 'Mumbai', 'leisure', ['food', 'photography', 'cafes'], 'mid-range', ['english', 'hindi'], 'In it for the thalis and lake sunsets. Zero-rush itineraries only.', '🍛', '#ea580c'],
    ['Naina Verma', 23, 'female', 'Ahmedabad', 'cultural', ['photography', 'local markets', 'history'], 'budget', ['hindi', 'english', 'gujarati'], 'Sketchbook traveler. Looking for museum-and-market people.', '🎨', '#9333ea'],
    ['Aditya Kulkarni', 27, 'male', 'Bengaluru', 'leisure', ['beaches', 'water sports', 'music'], 'budget', ['english', 'kannada', 'marathi'], 'Beach trek + hammock + one good playlist. Gokarna over Goa, always.', '🌊', '#0284c7'],
    ['Rhea D\'Souza', 25, 'female', 'Goa', 'mixed', ['yoga', 'beaches', 'cafes'], 'mid-range', ['english', 'konkani'], 'Sunrise yoga, sunset cliff walks. Happy to show people the quiet beaches.', '🧘', '#65a30d'],
    ['Farhan Ali', 28, 'male', 'Chennai', 'party', ['nightlife', 'beaches', 'music'], 'mid-range', ['english', 'tamil'], 'Shack-hopping crew wanted. I know a guy at every beach.', '🏖️', '#dc2626'],
    ['Priya Menon', 27, 'female', 'Delhi', 'spiritual', ['yoga', 'meditation', 'trekking'], 'budget', ['hindi', 'english'], 'Rishikesh monthly. Can recommend ashrams, teachers and the best kombucha.', '🕉️', '#0d9488'],
    ['Sameer Gupta', 30, 'male', 'Noida', 'adventure', ['water sports', 'trekking', 'food'], 'mid-range', ['hindi', 'english'], 'Rafting junkie. Grade 4 rapids or nothing.', '🛶', '#1d4ed8'],
    ['Lena Fernandes', 29, 'female', 'Mumbai', 'spiritual', ['yoga', 'cafes', 'photography'], 'premium', ['english', 'hindi'], 'Yoga teacher training grad. Traveling slow, journaling slower.', '📓', '#be185d'],
  ]
  const destForUser = ['manali', 'manali', 'manali', 'kasol', 'kasol', 'kasol', 'spiti-valley', 'spiti-valley', 'spiti-valley', 'udaipur', 'udaipur', 'udaipur', 'gokarna', 'gokarna', 'gokarna', 'rishikesh', 'rishikesh', 'rishikesh']

  const insUser = db.prepare(`INSERT INTO users (id, phone, name, age, gender, city, avatar_color, avatar_emoji, travel_style, interests, budget, languages, bio, personality, phone_verified, id_verified, trust_score, trust_reviews, onboarded, is_demo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 1, 1)`)
  const insTripRow = db.prepare(`INSERT INTO trips (id, user_id, destination, start_date, end_date, flexible) VALUES (?, ?, ?, ?, ?, ?)`)
  const insStay = db.prepare(`INSERT INTO hostel_stays (id, user_id, hostel_id, start_date, end_date, visible) VALUES (?, ?, ?, ?, ?, 1)`)
  const insReview = db.prepare(`INSERT INTO hostel_reviews (id, hostel_id, user_id, rating, text) VALUES (?, ?, ?, ?, ?)`)

  const reviewTexts = [
    'Met half my trip group in the common room. Great vibe.',
    'Clean dorms, hot water actually works. Would stay again.',
    'The staff helped us plan the whole trek. Super social crowd.',
    'A bit noisy on weekends but that\'s half the fun.',
    'Perfect location and the café is genuinely good.',
  ]

  if (process.env.TRIPPY_TEST === '1') {
    demoUsers.forEach((u, i) => {
      const [name, age, gender, city, style, interests, budget, languages, bio, emoji, color] = u
      const id = uid()
      const idVerified = i % 3 !== 2 ? 1 : 0 // two-thirds are ID-verified
      const trust = 4.1 + (i % 9) * 0.1
      insUser.run(id, `90000000${String(i + 10)}`, name, age, gender, city, color, emoji,
        style, j(interests), budget, j(languages), bio, personalityFor({ travel_style: style, interests: j(interests) }),
        idVerified, Math.round(trust * 10) / 10, 3 + (i % 7))

      const dest = destForUser[i]
      // Stagger trips inside a ±3-day window around T+14 so everyone matches
      const start = 12 + (i % 3) * 2
      const len = 4 + (i % 3)
      insTripRow.run(uid(), id, dest, daysFromNow(start), daysFromNow(start + len), i % 2)

      const hostelsHere = hostelIds[dest]
      const hostelId = hostelsHere[i % hostelsHere.length]
      insStay.run(uid(), id, hostelId, daysFromNow(start), daysFromNow(start + len))
      insReview.run(uid(), hostelId, id, 4 + (i % 2), reviewTexts[i % reviewTexts.length])
    })
  }

  console.log('[seed] Done: 14 destinations, 35 hostels, 29 group trips.')
}

// ---- Partner CRM demo data: 2 orgs, each with an admin + draft & published trips ----
interface SeedDay { title: string; description: string; location: string; activities: string[]; accommodation?: string; meals?: string[] }
interface SeedTrip {
  name: string; status: 'draft' | 'published'; destination: string; destinationSlug?: string
  shortDesc: string; longDesc?: string; startCity?: string; startOffset?: number; days?: number
  category?: string; tripType?: string; difficulty?: string; minAge?: number; maxGroupSize?: number
  price?: number; originalPrice?: number; pricingNotes?: string
  inclusions?: string[]; exclusions?: string[]; cover?: boolean; paymentUrl?: string
  tags?: string[]; gallery?: number; itinerary?: SeedDay[]
}

function seedPartnersIfEmpty() {
  const count = (db.prepare('SELECT COUNT(*) AS c FROM partner_orgs').get() as any).c
  if (count > 0) return
  console.log('[seed] Seeding partner CRM demo data...')

  const categories: [string, string, string][] = [
    ['trekking', 'Trekking & Hiking', '🥾'], ['backpacking', 'Backpacking', '🎒'],
    ['beach', 'Beach & Coastal', '🏖️'], ['road-trip', 'Road Trip', '🚐'],
    ['spiritual', 'Yoga & Wellness', '🧘'], ['adventure', 'Adventure', '⛰️'],
  ]
  const insCat = db.prepare('INSERT OR IGNORE INTO trip_categories (slug, label, emoji) VALUES (?, ?, ?)')
  for (const [slug, label, emoji] of categories) insCat.run(slug, label, emoji)

  const cover = (slug: string) => `https://picsum.photos/seed/${slug}/1200/800`
  const gallery = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${slug}-${i + 1}/1000/700`)

  const insTrip = db.prepare(`INSERT INTO partner_trips
    (id, org_id, slug, status, name, short_desc, long_desc, destination, destination_slug, start_city, start_date, end_date,
     duration_days, category, trip_type, difficulty, min_age, max_group_size, price, original_price, currency, pricing_notes,
     inclusions, exclusions, cover_image, payment_url, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insDay = db.prepare(`INSERT INTO trip_itinerary_days (id, trip_id, day_number, title, description, location, activities, accommodation, meals, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insMedia = db.prepare('INSERT INTO trip_media (id, trip_id, url, kind, sort_order) VALUES (?, ?, ?, ?, ?)')
  const insTag = db.prepare('INSERT OR IGNORE INTO trip_tags (trip_id, tag) VALUES (?, ?)')

  const makeTrip = (orgId: string, t: SeedTrip) => {
    const id = uid()
    const slug = t.status === 'published' ? slugify(t.name) : null
    const startOffset = t.startOffset ?? 30
    const days = t.days ?? 4
    const start = daysFromNow(startOffset)
    const end = daysFromNow(startOffset + days - 1)
    const now = nowIso()
    insTrip.run(id, orgId, slug, t.status, t.name, t.shortDesc, t.longDesc || '', t.destination, t.destinationSlug || null,
      t.startCity || '', t.status === 'published' || t.startOffset != null ? start : null,
      t.status === 'published' ? end : null, t.status === 'published' ? days : (t.days || null),
      t.category || '', t.tripType || 'group', t.difficulty || '', t.minAge ?? null, t.maxGroupSize ?? null,
      t.price ?? null, t.originalPrice ?? null, t.pricingNotes || '',
      j(t.inclusions || []), j(t.exclusions || []),
      t.cover === false ? '' : cover(slugify(t.name)),
      t.paymentUrl || (t.status === 'published' ? `https://example.com/pay/${slugify(t.name)}` : ''),
      t.status === 'published' ? now : null, now, now)
    ;(t.itinerary || []).forEach((d, i) => insDay.run(uid(), id, i + 1, d.title, d.description, d.location,
      j(d.activities), d.accommodation || '', j(d.meals || []), i))
    if (t.gallery) gallery(slugify(t.name), t.gallery).forEach((u, i) => insMedia.run(uid(), id, u, 'image', i))
    for (const tag of t.tags || []) insTag.run(id, tag)
    return id
  }

  const makeOrg = (name: string, emoji: string, color: string, about: string, website: string,
                   email: string, adminName: string, password: string, trips: SeedTrip[]) => {
    const orgId = uid()
    db.prepare('INSERT INTO partner_orgs (id, name, slug, logo_emoji, logo_color, about, website) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(orgId, name, slugify(name), emoji, color, about, website)
    const { hash, salt } = hashPassword(password)
    db.prepare('INSERT INTO partner_admins (id, org_id, email, password_hash, password_salt, name, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1)')
      .run(uid(), orgId, email, hash, salt, adminName)
    for (const t of trips) makeTrip(orgId, t)
    return orgId
  }

  makeOrg('Himalayan Wolves', '🐺', '#0d9488',
    'A trekking community running small-group Himalayan expeditions since 2018.',
    'https://himalayanwolves.example.com', 'admin@himalayanwolves.test', 'Kabir Rana', 'Trekking@123', [
      {
        name: 'Hampta Pass Trek & Camp', status: 'published', destination: 'Manali, Himachal Pradesh', destinationSlug: 'manali',
        shortDesc: 'A 4-day crossover trek from the green Kullu valley to the stark Lahaul desert, with two nights camping under the stars.',
        longDesc: 'Hampta Pass is one of the most dramatic crossover treks in the Himalayas. In four days you walk from pine forests and river meadows over a 14,000ft pass into the moonscape of Lahaul, camping beside glacial streams and finishing with a visit to the surreal Chandratal lake. Our trek leaders are certified and the group stays small.',
        startCity: 'Manali', startOffset: 26, days: 4, category: 'trekking', tripType: 'group', difficulty: 'moderate',
        minAge: 16, maxGroupSize: 15, price: 11999, originalPrice: 13999, pricingNotes: 'Ex-Manali. Group discounts for 4+.',
        inclusions: ['Certified trek leader', 'All camping gear & tents', 'All meals on trek', 'Forest permits', 'First-aid & oxygen'],
        exclusions: ['Travel to Manali', 'Personal expenses', 'Backpack offloading'],
        paymentUrl: 'https://example.com/pay/hampta-pass', tags: ['trekking', 'camping', 'himalayas'], gallery: 3,
        itinerary: [
          { title: 'Manali → Jobra → Chika', description: 'Drive to the trailhead at Jobra and trek to the Chika campsite beside the Rani river.', location: 'Chika', activities: ['Short acclimatisation walk', 'Riverside camp setup'], accommodation: 'Camping (twin-share tents)', meals: ['Lunch', 'Dinner'] },
          { title: 'Chika → Balu ka Ghera', description: 'Follow the river through meadows and boulder fields to the base of the pass.', location: 'Balu ka Ghera', activities: ['River crossings', 'Meadow walk'], accommodation: 'Camping', meals: ['Breakfast', 'Lunch', 'Dinner'] },
          { title: 'Cross Hampta Pass → Siagoru', description: 'The big day: summit the 14,100ft pass and descend into the Lahaul valley.', location: 'Siagoru', activities: ['Pass crossing', 'Snow section', 'Steep descent'], accommodation: 'Camping', meals: ['Breakfast', 'Lunch', 'Dinner'] },
          { title: 'Siagoru → Chatru → Chandratal → Manali', description: 'Trek out to Chatru, drive to the stunning Chandratal lake, then back to Manali.', location: 'Manali', activities: ['Chandratal lake visit', 'Drive back'], meals: ['Breakfast'] },
        ],
      },
      {
        name: 'Spiti Winter Expedition', status: 'published', destination: 'Spiti Valley, Himachal Pradesh', destinationSlug: 'spiti-valley',
        shortDesc: 'A 7-day winter road expedition through frozen Spiti — monasteries, snow villages and the world\'s highest post office.',
        longDesc: 'Experience Spiti at its most raw. This winter expedition takes a small group through Kaza, Key Monastery, Kibber and Langza when the valley is under snow and the skies are impossibly clear. Homestays with local families, hearty food, and a chance to spot the elusive snow leopard.',
        startCity: 'Shimla', startOffset: 45, days: 7, category: 'road-trip', tripType: 'group', difficulty: 'difficult',
        minAge: 18, maxGroupSize: 12, price: 24999, pricingNotes: 'Ex-Shimla, includes homestays.',
        inclusions: ['Tempo traveller with heater', 'Homestays', 'All meals', 'Inner-line permits', 'Expedition lead'],
        exclusions: ['Travel to Shimla', 'Winter gear rental'],
        paymentUrl: 'https://example.com/pay/spiti-winter', tags: ['road-trip', 'winter', 'himalayas', 'photography'], gallery: 2,
        itinerary: [
          { title: 'Shimla → Chitkul', description: 'Drive to the last inhabited village near the Tibet border.', location: 'Chitkul', activities: ['Scenic drive'], accommodation: 'Guesthouse', meals: ['Dinner'] },
          { title: 'Chitkul → Kalpa', description: 'Apple country and views of Kinner Kailash.', location: 'Kalpa', activities: ['Village walk'], accommodation: 'Homestay', meals: ['Breakfast', 'Dinner'] },
          { title: 'Kalpa → Nako → Tabo', description: 'Cross into Spiti; visit the 1000-year-old Tabo monastery.', location: 'Tabo', activities: ['Monastery visit'], accommodation: 'Homestay', meals: ['Breakfast', 'Dinner'] },
          { title: 'Tabo → Dhankar → Kaza', description: 'Cliffside Dhankar monastery and on to Kaza.', location: 'Kaza', activities: ['Monastery visit'], accommodation: 'Homestay', meals: ['Breakfast', 'Dinner'] },
          { title: 'Kaza: Key, Kibber, Langza', description: 'The postcard day — Key monastery, Kibber village, Langza Buddha.', location: 'Kaza', activities: ['Key Monastery', 'Highest post office', 'Fossil hunting'], accommodation: 'Homestay', meals: ['Breakfast', 'Dinner'] },
          { title: 'Snow leopard tracking day', description: 'Head out with local trackers into the Kibber sanctuary.', location: 'Kibber', activities: ['Wildlife tracking'], accommodation: 'Homestay', meals: ['Breakfast', 'Dinner'] },
          { title: 'Kaza → Shimla', description: 'Long drive back with memories for a lifetime.', location: 'Shimla', activities: ['Drive out'], meals: ['Breakfast'] },
        ],
      },
      {
        name: 'Kasol Long Weekend', status: 'draft', destination: 'Kasol, Himachal Pradesh', destinationSlug: 'kasol',
        shortDesc: 'An easy riverside long weekend in the Parvati valley.', category: 'backpacking', difficulty: 'easy',
        maxGroupSize: 20, tags: ['chill', 'riverside'],
        // Intentionally incomplete (no price / payment / itinerary) to demo draft + publish validation.
      },
    ])

  makeOrg('Coastal Nomads', '🐚', '#f2683c',
    'Slow beach trips and coastal road journeys along the Konkan and Karnataka coast.',
    'https://coastalnomads.example.com', 'admin@coastalnomads.test', 'Rhea Pinto', 'Beaches@123', [
      {
        name: 'Gokarna Beach Hop', status: 'published', destination: 'Gokarna, Karnataka', destinationSlug: 'gokarna',
        shortDesc: 'Three slow days hopping the Gokarna beaches on foot — Om, Kudle, Half Moon and Paradise — with cliffside stays.',
        longDesc: 'Gokarna is Goa twenty years ago. Over three days we walk the coastal trail linking its string of beaches, swim in warm water, watch the sun drop off the cliffs and sleep in simple beach huts. Low-effort, high-reward, and endlessly social.',
        startCity: 'Bengaluru', startOffset: 20, days: 3, category: 'beach', tripType: 'group', difficulty: 'easy',
        minAge: 18, maxGroupSize: 18, price: 7499, originalPrice: 8499, pricingNotes: 'Ex-Bengaluru overnight bus.',
        inclusions: ['Overnight bus both ways', 'Beach hut stay', 'Breakfast', 'Beach trek guide'],
        exclusions: ['Lunch & dinner', 'Water sports'],
        paymentUrl: 'https://example.com/pay/gokarna-hop', tags: ['beach', 'chill', 'coastal'], gallery: 3,
        itinerary: [
          { title: 'Arrive Gokarna → Kudle Beach', description: 'Reach by morning, settle into the Kudle beach huts and ease into beach time.', location: 'Kudle Beach', activities: ['Beach time', 'Sunset point'], accommodation: 'Beach hut', meals: ['Breakfast'] },
          { title: 'The full beach trek', description: 'Walk the coastal trail: Kudle → Om → Half Moon → Paradise and back.', location: 'Om Beach', activities: ['Coastal trek', 'Cliff jumping', 'Swimming'], accommodation: 'Beach hut', meals: ['Breakfast'] },
          { title: 'Temple town & depart', description: 'Morning at the old town and Mahabaleshwar temple, then the bus home.', location: 'Gokarna town', activities: ['Temple visit', 'Cafe hop'], meals: ['Breakfast'] },
        ],
      },
      {
        name: 'Konkan Coast Road Trip', status: 'draft', destination: 'Konkan Coast, Maharashtra', destinationSlug: undefined,
        shortDesc: 'A 5-day self-drive down the Konkan coast — forts, beaches and seafood.', category: 'road-trip', difficulty: 'easy',
        maxGroupSize: 12, price: 15999, tags: ['road-trip', 'seafood', 'coastal'],
        // Draft: has price but no itinerary yet, so it fails publish validation.
      },
    ])

  makeOrg('Inner Compass', '🧘', '#7c3aed',
    'Small-group spiritual and wellness journeys to India\'s most sacred destinations.',
    'https://innercompass.example.com', 'admin@innercompass.test', 'Priya Sarin', 'Spiritual@123', [
      {
        name: 'Rishikesh Yoga & Ganga Retreat', status: 'published',
        destination: 'Rishikesh, Uttarakhand', destinationSlug: 'rishikesh',
        shortDesc: 'Five days of sunrise yoga, morning aarti and white-water rafting on the Ganges — the classic Rishikesh experience done slowly.',
        longDesc: 'This is not a yoga bootcamp. We wake early, practice with a Sivananda-trained teacher on a riverside deck, eat sattvic food and spend afternoons doing whatever we like — rafting, hiking to Kunjapuri, or doing nothing at all. The group is capped at 12 so it stays personal.',
        startCity: 'Delhi', startOffset: 18, days: 5, category: 'spiritual', tripType: 'group', difficulty: 'easy',
        minAge: 18, maxGroupSize: 12, price: 14999, originalPrice: 16999, pricingNotes: 'Ex-Delhi. Includes Volvo bus both ways.',
        inclusions: ['Volvo bus both ways', 'Riverside ashram stay', 'All sattvic meals', 'Daily yoga & meditation', 'River rafting session', 'Ganga aarti ceremony'],
        exclusions: ['Personal shopping', 'Bungee jumping', 'Alcohol'],
        paymentUrl: 'https://example.com/pay/rishikesh-yoga', tags: ['yoga', 'spiritual', 'wellness', 'rivers'], gallery: 3,
        itinerary: [
          { title: 'Delhi → Rishikesh · Arrive & settle', description: 'Overnight Volvo from Delhi. Arrive by morning, check into the ashram and rest.', location: 'Rishikesh', activities: ['Check-in', 'Evening aarti at Triveni Ghat'], accommodation: 'Riverside ashram dorm', meals: ['Dinner'] },
          { title: 'Sunrise yoga · Old town walk', description: 'First 6am session on the riverside deck, then a slow walk across Laxman Jhula to the old quarter.', location: 'Rishikesh', activities: ['Sunrise yoga (Sivananda)', 'Jhula bridge walk', 'Café crawl'], accommodation: 'Riverside ashram dorm', meals: ['Breakfast', 'Lunch', 'Dinner'] },
          { title: 'River rafting day', description: 'The 16 km Grade III–IV stretch — then rest and an evening meditation session.', location: 'Rishikesh', activities: ['River rafting 16km', 'Evening meditation'], accommodation: 'Riverside ashram dorm', meals: ['Breakfast', 'Lunch', 'Dinner'] },
          { title: 'Kunjapuri sunrise trek', description: 'Early hike to the Kunjapuri temple at 1,676m — 360° Himalayan panorama at sunrise.', location: 'Kunjapuri', activities: ['Sunrise trek', 'Temple visit'], accommodation: 'Riverside ashram dorm', meals: ['Breakfast', 'Dinner'] },
          { title: 'Free day · Depart evening', description: 'Open morning — bungee, café, or just sit by the Ganga. Overnight bus back to Delhi.', location: 'Rishikesh', activities: ['Free time', 'Final aarti ceremony'], meals: ['Breakfast'] },
        ],
      },
      {
        name: 'Varanasi & Sarnath Pilgrimage', status: 'published',
        destination: 'Varanasi, Uttar Pradesh', destinationSlug: 'varanasi',
        shortDesc: 'Four days on the ghats of Varanasi — dawn boat rides, the Ganga Aarti, old city lanes and a day trip to Sarnath where the Buddha first taught.',
        longDesc: 'Varanasi is the most intense city in India, and possibly the world. We navigate it slowly: early mornings on the river, afternoons in chai shops in the old city, evenings at the massive Ganga Aarti. Our guesthouse is on a quiet ghat — close to everything but away from the chaos.',
        startCity: 'Delhi', startOffset: 25, days: 4, category: 'spiritual', tripType: 'group', difficulty: 'easy',
        minAge: 18, maxGroupSize: 14, price: 11999, pricingNotes: 'Ex-Delhi by AC train.',
        inclusions: ['AC train both ways (Delhi–Varanasi)', 'Ghat guesthouse stay', 'All meals', 'Boat ride at dawn', 'Ganga Aarti guide', 'Sarnath day trip with guide'],
        exclusions: ['Travel insurance', 'Personal shopping'],
        paymentUrl: 'https://example.com/pay/varanasi-pilgrimage', tags: ['spiritual', 'culture', 'history', 'pilgrimage'], gallery: 2,
        itinerary: [
          { title: 'Delhi → Varanasi by overnight train', description: 'Board the Kashi Express. Arrive at Varanasi junction by morning and transfer to the ghat guesthouse.', location: 'Varanasi', activities: ['Ghat walk', 'Evening aarti orientation'], accommodation: 'Ghat guesthouse', meals: ['Lunch', 'Dinner'] },
          { title: 'Dawn on the Ganga', description: 'Up at 5am for the boat ride — Varanasi in the early mist is unlike anything. Breakfast on the riverbank.', location: 'Dashaswamedh Ghat', activities: ['Dawn boat ride', 'Ghat walk', 'Old city lanes'], accommodation: 'Ghat guesthouse', meals: ['Breakfast', 'Lunch', 'Dinner'] },
          { title: 'Sarnath day trip', description: 'The deer park where the Buddha gave his first sermon — a 45-min drive, deeply peaceful contrast to Varanasi.', location: 'Sarnath', activities: ['Dhamek Stupa visit', 'Sarnath museum', 'Mulagandhakuti Vihara'], accommodation: 'Ghat guesthouse', meals: ['Breakfast', 'Dinner'] },
          { title: 'Manikarnika · Overnight train back', description: 'Morning walk to Manikarnika, the main cremation ghat. Afternoon free. Overnight train back to Delhi.', location: 'Varanasi', activities: ['Manikarnika ghat walk', 'Free afternoon'], meals: ['Breakfast'] },
        ],
      },
    ])

  makeOrg('Heritage Trails India', '🏯', '#b45309',
    'Curated cultural journeys through India\'s most storied destinations — forts, ruins, food and stories.',
    'https://heritagetrails.example.com', 'admin@heritagetrails.test', 'Arjun Bose', 'Heritage@123', [
      {
        name: 'Jaipur Royal Immersion 4D', status: 'published',
        destination: 'Jaipur, Rajasthan', destinationSlug: 'jaipur',
        shortDesc: 'Four days in the Pink City — Amber Fort, City Palace, the walled old city, and an optional Pushkar extension most tours skip.',
        longDesc: 'Jaipur is usually rushed through in a day. We take four days to actually inhabit it — evening walks in the old bazaars when the light turns pink, a private early-morning Amber Fort visit before the crowds, cooking class with a Rajput household, and a half-day drive to Pushkar that most itineraries ignore but everyone falls in love with.',
        startCity: 'Delhi', startOffset: 22, days: 4, category: 'cultural', tripType: 'group', difficulty: 'easy',
        minAge: 16, maxGroupSize: 16, price: 13999, originalPrice: 15999, pricingNotes: 'Ex-Delhi. Heritage hotel stay included.',
        inclusions: ['AC cab from Delhi', 'Heritage hotel (twin share)', 'Breakfast + 2 dinners', 'Amber Fort early access', 'Cooking class', 'Pushkar day trip', 'City walk guide'],
        exclusions: ['Lunches', 'Personal shopping', 'Entrance fees beyond listed'],
        paymentUrl: 'https://example.com/pay/jaipur-royal', tags: ['culture', 'heritage', 'rajasthan', 'food'], gallery: 3,
        itinerary: [
          { title: 'Delhi → Jaipur · Old city evening walk', description: 'Drive from Delhi (5h), check in, then straight to the old walled city at golden hour.', location: 'Jaipur', activities: ['Johari Bazaar walk', 'Hawa Mahal exterior', 'Street food dinner'], accommodation: 'Heritage hotel', meals: ['Dinner'] },
          { title: 'Amber Fort early access · City Palace', description: '7am at Amber Fort before the tourist buses — the fort with almost no one in it. Afternoon at City Palace and Jantar Mantar.', location: 'Amber Fort', activities: ['Amber Fort guided tour', 'City Palace', 'Jantar Mantar'], accommodation: 'Heritage hotel', meals: ['Breakfast'] },
          { title: 'Pushkar day trip · Cooking class', description: 'Morning drive to Pushkar lake and the ghats — one of Rajasthan\'s most serene spots. Afternoon Rajput cooking class.', location: 'Pushkar', activities: ['Pushkar lake walk', 'Brahma Temple', 'Rajput cooking class'], accommodation: 'Heritage hotel', meals: ['Breakfast', 'Dinner'] },
          { title: 'Nahargarh Fort sunrise · Back to Delhi', description: 'Early drive up to Nahargarh for sunrise over Jaipur. Brunch, souvenir shopping, drive back.', location: 'Nahargarh Fort', activities: ['Sunrise fort walk', 'Blue Pottery workshop', 'Drive back to Delhi'], meals: ['Breakfast'] },
        ],
      },
      {
        name: 'Hampi Ruins & Boulder Trail 3D', status: 'published',
        destination: 'Hampi, Karnataka', destinationSlug: 'hampi',
        shortDesc: 'Three days exploring the 500-year-old Vijayanagara empire — ruins, river crossings, boulder climbs and absolutely no rush.',
        longDesc: 'Hampi is one of India\'s most underrated destinations — a UNESCO World Heritage city that most Indians haven\'t visited. We spend three days cycling between temples, climbing boulders at sunset, crossing the river by coracle and eating at roadside dhabas that serve the best thali you\'ve ever had. Small group, flexible pace.',
        startCity: 'Bengaluru', startOffset: 16, days: 3, category: 'cultural', tripType: 'group', difficulty: 'easy',
        minAge: 16, maxGroupSize: 18, price: 7999, originalPrice: 8999, pricingNotes: 'Ex-Bengaluru overnight bus.',
        inclusions: ['Overnight sleeper bus both ways', 'Boutique guesthouse (coracle side)', 'Breakfast all days', 'Cycle hire', 'Expert heritage guide', 'Coracle river crossing'],
        exclusions: ['Lunches & dinners', 'Monument entry fees', 'Personal expenses'],
        paymentUrl: 'https://example.com/pay/hampi-ruins', tags: ['culture', 'heritage', 'backpacking', 'photography'], gallery: 3,
        itinerary: [
          { title: 'Bengaluru → Hampi · Arrive & orient', description: 'Overnight bus arrives by morning. Check into the guesthouse across the river, rest, then an evening orientation walk.', location: 'Virupapur Gadde', activities: ['Coracle river crossing', 'Sunset boulder climb', 'Tungabhadra riverside'], accommodation: 'Boutique guesthouse (coracle side)', meals: ['Breakfast'] },
          { title: 'Full ruins day by cycle', description: 'The full circuit: Virupaksha Temple → Hampi Bazaar → Vittala Temple complex → Matanga Hill for sunset.', location: 'Hampi Bazaar', activities: ['Virupaksha Temple', 'Vittala Temple & stone chariot', 'Hampi Bazaar', 'Matanga Hill sunset'], accommodation: 'Boutique guesthouse', meals: ['Breakfast'] },
          { title: 'Zenana Enclosure · Elephant Stables · Depart', description: 'Morning at the royal enclosures — the Zenana, Elephant Stables and Lotus Mahal. Overnight bus back to Bengaluru.', location: 'Royal Enclosure', activities: ['Zenana Enclosure', 'Elephant Stables', 'Lotus Mahal', 'Free afternoon'], meals: ['Breakfast'] },
        ],
      },
    ])

  console.log('[seed] Done: 4 partner orgs, 9 partner trips (7 published, 2 draft).')
}

function seedStoriesIfEmpty() {
  if ((db.prepare('SELECT COUNT(*) AS c FROM trip_stories').get() as any).c > 0) return

  // Pick 4 demo travellers as authors (by index after ordering by created_at)
  const travellers = db.prepare("SELECT id FROM users WHERE email != 'traveller@trippy.test' ORDER BY created_at LIMIT 4").all() as any[]
  if (travellers.length < 2) return

  const stories: { userId: string; title: string; destination: string; destSlug: string; startDate: string; endDate: string; status: 'completed' | 'active'; steps: { day: number; location: string; title: string; description: string; photos: string[] }[] }[] = [
    {
      userId: travellers[0].id,
      title: 'Spiti in September: monasteries, fossils and -5°C nights',
      destination: 'Spiti Valley', destSlug: 'spiti-valley',
      startDate: '2026-09-04', endDate: '2026-09-11', status: 'completed',
      steps: [
        { day: 1, location: 'Kaza', title: 'Arrived after 12 hours on the road', description: 'The drive from Shimla is brutal and beautiful in equal parts. Altitude hit at Kunzum — took it slow, drank lots of water. Kaza at 3800m feels like the edge of the world. Crashed early.', photos: [] },
        { day: 2, location: 'Key Monastery', title: 'Key Monastery at dawn', description: 'Up at 6. The monastery is golden at sunrise — no tourists yet, just monks doing morning prayers. Walked the rooftop, counted 9 peaks. Afternoon nap mandatory.', photos: [] },
        { day: 3, location: 'Langza', title: 'Fossil village — found a 47 million year old ammonite', description: 'Langza sits at 4400m under the Chau Chau Kang Nilda peak. A local kid showed us where to look in the clay — I found an ammonite fossil the size of my fist. Mind completely broken.', photos: [] },
        { day: 4, location: 'Chandratal', title: 'Chandratal lake — crescent moon in a cold desert', description: 'Camped overnight at Chandratal (4300m). The lake is a perfect crescent of turquoise. Stars were absurd — Milky Way visible with naked eye. Temperature dropped to -5°C by 2am. Zero regrets.', photos: [] },
      ],
    },
    {
      userId: travellers[1].id,
      title: 'Gokarna slow trip: Om beach to Half Moon by foot',
      destination: 'Gokarna', destSlug: 'gokarna',
      startDate: '2026-11-14', endDate: '2026-11-19', status: 'completed',
      steps: [
        { day: 1, location: 'Om Beach', title: 'Checked in, turned off phone', description: 'Took the overnight Vande Bharat from Bangalore. Om beach shack has hammocks six feet from the water. Did nothing for four hours. This is the goal.', photos: [] },
        { day: 2, location: 'Half Moon Beach', title: 'The 45-minute cliff walk', description: 'The trail from Om to Half Moon is unmarked and steep in parts but worth every step. Half Moon at 8am: two other people, perfectly clear water, no roads anywhere nearby.', photos: [] },
        { day: 3, location: 'Paradise Beach', title: 'Boat to Paradise and back', description: 'The boat guys were quoting ₹200 each way. Walked instead via Half Moon — took 90 mins but felt like an adventure. Paradise is aptly named; it is genuinely secluded.', photos: [] },
        { day: 4, location: 'Mirjan Fort', title: 'Detour: Mirjan Fort', description: 'Rented a scooter and drove 20km to Mirjan Fort. 16th century, red laterite, completely overgrown and beautifully empty. Best ₹20 entry fee I have ever spent.', photos: [] },
      ],
    },
    {
      userId: travellers[2 % travellers.length].id,
      title: 'Live from Manali: 6 days in the mountains (still going)',
      destination: 'Manali', destSlug: 'manali',
      startDate: '2026-12-22', endDate: '', status: 'active',
      steps: [
        { day: 1, location: 'Old Manali', title: 'Arrival and first café', description: 'Hit Café 1947 an hour after getting off the bus. Momos, chai, and a window seat overlooking the Beas. Exactly as advertised. The town is quieter than I expected for December.', photos: [] },
        { day: 2, location: 'Solang Valley', title: 'Solang in the snow', description: 'Snow is knee-deep at Solang right now. Skipped the ski rental queue and just walked up the slope. Best views of the Rohtang range from the top ridge.', photos: [] },
        { day: 3, location: 'Naggar Castle', title: 'Naggar village and the Roerich estate', description: 'Took a shared cab to Naggar — 45 mins south. The Roerich Art Gallery inside the castle is a hidden gem. Himalayan landscape paintings that look like nothing else.', photos: [] },
      ],
    },
  ]

  const insStory = db.prepare(`INSERT INTO trip_stories (id, user_id, title, destination, destination_slug, start_date, end_date, visibility, status, step_count) VALUES (?, ?, ?, ?, ?, ?, ?, 'public', ?, ?)`)
  const insStep = db.prepare(`INSERT INTO story_steps (id, story_id, day_number, location, title, description, photos, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)

  for (const s of stories) {
    const sid = uid()
    insStory.run(sid, s.userId, s.title, s.destination, s.destSlug, s.startDate, s.endDate || null, s.status, s.steps.length)
    s.steps.forEach((step, i) => insStep.run(uid(), sid, step.day, step.location, step.title, step.description, j(step.photos), i))
  }

  console.log('[seed] Done: 3 demo travel stories.')
}

export function seedRealCommunities() {
  console.log('[seed] Seeding 5 real travel communities and authentic trips...')

  const cover = (slug: string) => `https://picsum.photos/seed/${slug}/1200/800`
  const gallery = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `https://picsum.photos/seed/${slug}-${i + 1}/1000/700`)

  // Ensure missing destinations exist so trips reference valid destinations
  const extraDests = [
    { slug: 'meghalaya', name: 'Meghalaya', state: 'Meghalaya', emoji: '🌧️', tagline: 'Living root bridges, crystal rivers & waterfalls', hostel_night: 600, food_day: 450, transport_day: 350, intercity: 2500, activities: j([{ name: 'Living Root Bridge hike', cost: 200 }, { name: 'Dawki river boating', cost: 500 }]), extras: j(['Carry raincoat', 'Book Shillong cab early']), best_months: 'Oct–Apr', tags: j(['waterfalls', 'trekking', 'nature']) },
    { slug: 'bali', name: 'Bali', state: 'Indonesia', emoji: '🏝️', tagline: 'Volcanic sunrises, rice terraces & surf beaches', hostel_night: 900, food_day: 700, transport_day: 400, intercity: 5000, activities: j([{ name: 'Mount Batur sunrise trek', cost: 1500 }, { name: 'Nusa Penida day tour', cost: 2500 }]), extras: j(['Visa on arrival required', 'Rent a scooter in Ubud']), best_months: 'Apr–Oct', tags: j(['international', 'beaches', 'culture']) },
    { slug: 'vietnam', name: 'Vietnam', state: 'Southeast Asia', emoji: '🇻🇳', tagline: 'Halong Bay cruises, ancient lantern towns & street food', hostel_night: 750, food_day: 500, transport_day: 300, intercity: 4000, activities: j([{ name: 'Halong Bay cruise', cost: 4500 }, { name: 'Hoi An lantern boat', cost: 600 }]), extras: j(['E-visa needed before travel', 'Try egg coffee in Hanoi']), best_months: 'Sep–Apr', tags: j(['international', 'food', 'culture']) },
    { slug: 'thailand', name: 'Thailand', state: 'Southeast Asia', emoji: '🇹🇭', tagline: 'Phuket sunsets, Phi Phi islands & night markets', hostel_night: 800, food_day: 550, transport_day: 350, intercity: 4500, activities: j([{ name: 'Phi Phi island speedboat', cost: 2200 }, { name: 'Bangkok night market tour', cost: 800 }]), extras: j(['Visa exemption for Indians', 'Respect temple dress codes']), best_months: 'Nov–Apr', tags: j(['international', 'beaches', 'party']) },
    { slug: 'kedarkantha', name: 'Kedarkantha', state: 'Uttarakhand', emoji: '🏔️', tagline: 'Classic winter snow summit trek at 12,500ft', hostel_night: 500, food_day: 400, transport_day: 300, intercity: 2000, activities: j([{ name: 'Summit climb', cost: 0 }, { name: 'Juda ka Talab camp', cost: 0 }]), extras: j(['High winter boots needed', 'Trek starts from Sankri']), best_months: 'Dec–Apr', tags: j(['trekking', 'snow', 'mountains']) },
    { slug: 'kudremukh', name: 'Kudremukh', state: 'Karnataka', emoji: '⛰️', tagline: 'Horse-face peak in western ghats shrouded in mist', hostel_night: 600, food_day: 400, transport_day: 250, intercity: 1800, activities: j([{ name: 'Kudremukh peak trek', cost: 500 }, { name: 'Kalasa temple visit', cost: 0 }]), extras: j(['Forest permit capped per day', 'Monsoon leech guards recommended']), best_months: 'Oct–Feb', tags: j(['trekking', 'nature', 'mountains']) },
  ]

  const insDest = db.prepare(`INSERT OR IGNORE INTO destinations (slug, name, state, emoji, tagline, hostel_night, food_day, transport_day, intercity, activities, extras, best_months, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  for (const d of extraDests) {
    insDest.run(d.slug, d.name, d.state, d.emoji, d.tagline, d.hostel_night, d.food_day, d.transport_day, d.intercity, d.activities, d.extras, d.best_months, d.tags)
  }

  const insOrg = db.prepare(`INSERT OR IGNORE INTO partner_orgs (id, name, slug, logo_emoji, logo_color, about, website, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`)
  const insAdmin = db.prepare(`INSERT OR IGNORE INTO partner_admins (id, org_id, email, password_hash, password_salt, name, email_verified, role, status) VALUES (?, ?, ?, ?, ?, ?, 1, 'owner', 'active')`)
  const insTrip = db.prepare(`INSERT OR IGNORE INTO partner_trips
    (id, org_id, slug, status, name, short_desc, long_desc, destination, destination_slug, start_city, start_date, end_date,
     duration_days, category, trip_type, difficulty, min_age, max_group_size, price, original_price, currency, pricing_notes,
     inclusions, exclusions, cover_image, payment_url, published_at, created_at, updated_at)
    VALUES (?, ?, ?, 'published', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`)
  const insDay = db.prepare(`INSERT OR IGNORE INTO trip_itinerary_days (id, trip_id, day_number, title, description, location, activities, accommodation, meals, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  const insMedia = db.prepare('INSERT OR IGNORE INTO trip_media (id, trip_id, url, kind, sort_order) VALUES (?, ?, ?, ?, ?)')
  const insTag = db.prepare('INSERT OR IGNORE INTO trip_tags (trip_id, tag) VALUES (?, ?)')

  const { hash, salt } = hashPassword('Partner@123')

  const communities = [
    {
      slug: 'tripper-trails',
      name: 'Tripper Trails',
      email: 'trippertrails@partner.trippy',
      adminName: 'Tripper Trails Team',
      emoji: '🎒',
      color: '#3b82f6',
      about: 'Tripper Trails is a trusted community-driven travel company and tour operator in Bangalore, curating budget-friendly group tours, weekend getaways and international holidays.',
      website: 'https://www.trippertrails.in/',
      trips: [
        {
          name: 'Meghalaya Backpacking Roadtrip 6D',
          destination: 'Meghalaya',
          destinationSlug: 'meghalaya',
          startCity: 'Guwahati',
          days: 6,
          category: 'backpacking',
          tripType: 'group',
          difficulty: 'moderate',
          price: 18499,
          originalPrice: 20999,
          shortDesc: 'Explore Meghalaya — Cherrapunji waterfalls, Double Decker Living Root Bridge, and crystal clear Dawki river.',
          longDesc: 'Join Tripper Trails for an unforgettable 6-day Meghalaya expedition. Walk on centuries-old living root bridges, cliff jump into clear natural pools in Dawki, explore dark limestone caves, and chill in Asia\'s cleanest village (Mawlynnong).',
          inclusions: ['Guwahati to Guwahati AC transport', 'Boutique homestays & eco lodges', 'Breakfast & Dinner', 'Local trek guides & entry permits', 'Boating at Dawki'],
          exclusions: ['Flights to Guwahati', 'Personal expenses & lunch'],
          paymentUrl: 'https://www.trippertrails.in/trip/meghalaya-backpacking-roadtrip-5n-6d',
          tags: ['domestic', 'group', 'trekking', 'waterfalls'],
          itinerary: [
            { title: 'Guwahati → Shillong', description: 'Pickup from Guwahati airport/station and drive to Shillong. Stop at Umiam Lake.', location: 'Shillong', activities: ['Umiam Lake sunset', 'Police Bazaar food walk'], accommodation: 'Boutique Homestay', meals: ['Dinner'] },
            { title: 'Shillong → Cherrapunji (Sohra)', description: 'Visit Elephant Falls, Mawkdok Dympep Valley, and Wei Sawdong 3-tiered waterfall.', location: 'Cherrapunji', activities: ['Wei Sawdong waterfall', 'Nohkalikai Falls'], accommodation: 'Resort in Sohra', meals: ['Breakfast', 'Dinner'] },
            { title: 'Double Decker Living Root Bridge Trek', description: 'Descend 3,000 steps to Nongriat village. See the ancient double decker root bridge & swim in Rainbow Falls.', location: 'Nongriat', activities: ['Root bridge trek', 'Natural pool swimming'], accommodation: 'Nongriat Homestay', meals: ['Breakfast', 'Dinner'] },
            { title: 'Nongriat → Mawlynnong → Dawki', description: 'Climb back up, visit Mawlynnong (cleanest village) and reach Dawki for crystal clear Umngot river boating.', location: 'Dawki', activities: ['Dawki boating', 'Indo-Bangladesh border visit'], accommodation: 'Riverside Tents', meals: ['Breakfast', 'Dinner'] },
            { title: 'Dawki → Shnongpdeng → Jowai', description: 'Cliff jumping and kayaking in Shnongpdeng, then drive to Jowai to see Krang Suri waterfall.', location: 'Jowai', activities: ['Krang Suri waterfall swim', 'Cliff jumping'], accommodation: 'Jowai Eco Resort', meals: ['Breakfast', 'Dinner'] },
            { title: 'Jowai → Guwahati drop', description: 'Breakfast and scenic drive back to Guwahati for your evening flights/trains.', location: 'Guwahati', activities: ['Souvenir shopping', 'Airport drop'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Japan Group Trip: Tokyo to Osaka 9D',
          destination: 'Bali, Indonesia',
          destinationSlug: 'bali',
          startCity: 'Tokyo (NRT)',
          days: 9,
          category: 'international',
          tripType: 'group',
          difficulty: 'easy',
          price: 138999,
          originalPrice: 149999,
          shortDesc: 'Signature 9-day Japan group departure — Tokyo bullet train, Mount Fuji viewing, Kyoto bamboo groves & Osaka street food.',
          longDesc: 'Experience the magic of Japan with Tripper Trails! Traverse Tokyo Shibuya crossing, gaze at Mount Fuji from Hakone, ride the Shinkansen bullet train to Kyoto, walk Arashiyama bamboo forest, and feast in Osaka Dotonbori.',
          inclusions: ['JR Shinkansen Bullet Train Pass', '4-star boutique hotels', 'Daily Japanese breakfast', 'Tokyo & Kyoto guided city tours', 'Mount Fuji ropeway pass'],
          exclusions: ['International flights to Tokyo', 'Japan visa fee'],
          paymentUrl: 'https://www.trippertrails.in/trip/echoes-of-japan',
          tags: ['international', 'japan', 'group', 'culture'],
          itinerary: [
            { title: 'Arrive in Tokyo → Shibuya Crossing', description: 'Welcome to Tokyo! Check in at hotel, evening walking tour of Shibuya crossing and Harajuku.', location: 'Tokyo', activities: ['Shibuya crossing', 'Harajuku street food'], accommodation: '4-Star Tokyo Hotel', meals: ['Dinner'] },
            { title: 'Tokyo Imperial Palace & Senso-ji Temple', description: 'Visit Asakusa Senso-ji temple, Nakamise shopping street, Imperial Palace gardens and Akihabara.', location: 'Tokyo', activities: ['Asakusa temple', 'Akihabara electronics'], accommodation: '4-Star Tokyo Hotel', meals: ['Breakfast'] },
            { title: 'Tokyo → Mount Fuji & Hakone Cable Car', description: 'Day trip to Hakone for iconic Mount Fuji views, Lake Ashi pirate boat cruise and Owakudani valley.', location: 'Hakone', activities: ['Mount Fuji view', 'Lake Ashi cruise'], accommodation: '4-Star Tokyo Hotel', meals: ['Breakfast'] },
            { title: 'Shinkansen Bullet Train → Kyoto', description: 'Board the famous Shinkansen bullet train to Kyoto (2.5h). Evening Gion geisha district walk.', location: 'Kyoto', activities: ['Bullet train ride', 'Gion district walk'], accommodation: 'Kyoto Ryokan Hotel', meals: ['Breakfast'] },
            { title: 'Kyoto Fushimi Inari & Arashiyama Bamboo', description: 'Early morning walk through 10,000 orange Torii gates at Fushimi Inari Shrine and Arashiyama bamboo grove.', location: 'Kyoto', activities: ['Fushimi Inari shrine', 'Arashiyama bamboo grove'], accommodation: 'Kyoto Ryokan Hotel', meals: ['Breakfast'] },
            { title: 'Kyoto Kinkaku-ji → Nara Deer Park → Osaka', description: 'Visit Golden Pavilion (Kinkaku-ji), feed bowing deer in Nara Park, drive to Osaka.', location: 'Osaka', activities: ['Nara deer park', 'Golden Pavilion'], accommodation: 'Osaka Hotel', meals: ['Breakfast'] },
            { title: 'Osaka Castle & Dotonbori Street Food Feast', description: 'Explore Osaka Castle gardens and spend the evening eating takoyaki & ramen in neon-lit Dotonbori.', location: 'Osaka', activities: ['Osaka Castle', 'Dotonbori food tour'], accommodation: 'Osaka Hotel', meals: ['Breakfast'] },
            { title: 'Universal Studios Japan or Free Shopping Day', description: 'Optional day at USJ (Super Nintendo World) or shopping in Shinsaibashi.', location: 'Osaka', activities: ['USJ or Shinsaibashi shopping'], accommodation: 'Osaka Hotel', meals: ['Breakfast'] },
            { title: 'Depart Osaka (KIX)', description: 'Breakfast and Kansai Airport (KIX) transfer for return flight.', location: 'Osaka Airport', activities: ['Airport transfer'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Mulki Surfing & Kayaking Adventure Tour 3D',
          destination: 'Gokarna',
          destinationSlug: 'gokarna',
          startCity: 'Bengaluru',
          days: 3,
          category: 'beach',
          tripType: 'group',
          difficulty: 'easy',
          price: 6999,
          originalPrice: 7999,
          shortDesc: 'Learn beginner surfing & river kayaking at Mantra Surf Club in Mulki near Mangalore.',
          longDesc: 'Hit the waves with Tripper Trails at India\'s surf capital Mulki! Learn to catch waves with certified ISA surf instructors, kayak along Shambhavi river backwaters, and chill at beach bonfires.',
          inclusions: ['Overnight bus transport from Bangalore', 'Riverside surf stay', '2 surfing lessons with gear', 'Shambhavi river kayaking', 'Breakfast & Dinner'],
          exclusions: ['Lunch & personal gear'],
          paymentUrl: 'https://www.trippertrails.in/trip/mulki-surfing-kayaking-adventure-tour',
          tags: ['beach', 'water-sports', 'domestic', 'surfing'],
          itinerary: [
            { title: 'Bangalore → Mulki overnight', description: 'Overnight bus drive from Bangalore to Mulki.', location: 'Mulki', activities: ['Bus travel'], accommodation: 'Surf Homestay', meals: ['Breakfast'] },
            { title: 'Beginner Surf School & River Kayaking', description: 'Morning 2-hour surfing lesson on Sasihithlu beach. Afternoon kayaking along Shambhavi river mangoves.', location: 'Mulki Surf Club', activities: ['Surfing lesson 1', 'River kayaking'], accommodation: 'Surf Homestay', meals: ['Breakfast', 'Dinner'] },
            { title: 'Sunrise Surf Session → Return to Bangalore', description: 'Morning surfing session to catch green waves. Lunch and evening bus back to Bangalore.', location: 'Mulki Beach', activities: ['Surfing lesson 2', 'Return bus'], meals: ['Breakfast'] },
          ]
        }
      ]
    },
    {
      slug: 'plan-the-unplanned',
      name: 'Plan The Unplanned',
      email: 'plantheunplanned@partner.trippy',
      adminName: 'Plan The Unplanned Team',
      emoji: '🌿',
      color: '#10b981',
      about: 'Plan The Unplanned connects passionate travellers through eco-conscious weekend treks, backpacking loops, and offbeat expeditions across India and Southeast Asia.',
      website: 'https://www.plantheunplanned.com/',
      trips: [
        {
          name: 'Kodachadri Trek via Hidlumane Falls 2D',
          destination: 'Kudremukh',
          destinationSlug: 'kudremukh',
          startCity: 'Bengaluru',
          days: 2,
          category: 'trekking',
          tripType: 'group',
          difficulty: 'moderate',
          price: 4599,
          originalPrice: 4999,
          shortDesc: 'Trek through rainforest trails past Hidlumane waterfalls to the legendary Sarvajna Peetha peak at Kodachadri.',
          longDesc: 'Conquer Karnataka\'s iconic western ghats peak with Plan The Unplanned! Hike through dense jungle trails, shower under cold Hidlumane waterfalls, and watch the sun set into the Arabian Sea from Sarvajna Peetha peak.',
          inclusions: ['Non-AC/AC Sleeper Bus from Bangalore', 'Base homestay with local Malnad meals', 'Forest entry permits & trek lead', 'Jeep ride descent option'],
          exclusions: ['Personal expenses & meals during transit'],
          paymentUrl: 'https://www.plantheunplanned.com/tours/kodachadri-trek/',
          tags: ['trek', 'domestic', 'waterfalls', 'nature'],
          itinerary: [
            { title: 'Overnight Bangalore → Nittur Base', description: 'Board Friday night bus from Bangalore. Arrive at Nittur village homestay early morning.', location: 'Nittur', activities: ['Overnight bus journey'], accommodation: 'Malnad Homestay', meals: ['Breakfast'] },
            { title: 'Hidlumane Falls & Kodachadri Peak Summit (14 km)', description: 'Trek past 7-tier Hidlumane waterfall, climb steep grassy ridges to Sarvajna Peetha peak (1,343m) for sunset.', location: 'Kodachadri Peak', activities: ['Hidlumane waterfall swim', 'Peak sunset view'], accommodation: 'Malnad Homestay', meals: ['Breakfast', 'Packed Lunch', 'Dinner'] },
            { title: 'Nagara Fort Visit → Return to Bangalore', description: 'Visit 16th-century Keladi Nayaka Nagara Fort. Evening return bus to Bangalore.', location: 'Nagara Fort', activities: ['Nagara fort exploration', 'Return bus'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Gokarna Beach Trek & Sunset Cliffs 3D',
          destination: 'Gokarna',
          destinationSlug: 'gokarna',
          startCity: 'Bengaluru',
          days: 3,
          category: 'beach',
          tripType: 'group',
          difficulty: 'easy',
          price: 6499,
          originalPrice: 7499,
          shortDesc: 'Popular 5-beach trek across Gokarna cliffs — Kudle, Om, Half Moon, Paradise, and Belekan beach.',
          longDesc: 'The ultimate coastal trail! Walk across rocky headlands connecting Gokarna\'s iconic secluded beaches, camp or stay in beach shacks, watch cliff sunsets, and enjoy night bonfires by the ocean.',
          inclusions: ['Overnight bus transport', 'Beachside stay / shacks', 'Breakfasts', 'Beach trek leader', 'Bonfire night'],
          exclusions: ['Water sports & cafes'],
          paymentUrl: 'https://www.plantheunplanned.com/tours/gokarna-beach-trek/',
          tags: ['beach', 'trek', 'domestic', 'chill'],
          itinerary: [
            { title: 'Bangalore → Gokarna overnight', description: 'Overnight bus drive to Gokarna town.', location: 'Gokarna', activities: ['Bus travel'], accommodation: 'Beach Shack', meals: ['Breakfast'] },
            { title: '5-Beach Trail Trek', description: 'Trek from Belekan to Paradise, Half Moon, Om, and Kudle beach.', location: 'Om Beach', activities: ['Cliff hiking', 'Sunset at Kudle cliff'], accommodation: 'Beach Shack', meals: ['Breakfast', 'Dinner'] },
            { title: 'Mirjan Fort & Honnavar Backwaters → Return', description: 'Visit historical Mirjan fort and mangrove boat ride before boarding evening return bus.', location: 'Honnavar', activities: ['Fort tour', 'Mangrove boat ride'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Vietnam Expedition: Hanoi, Halong Bay & Ninh Binh 8D',
          destination: 'Vietnam',
          destinationSlug: 'vietnam',
          startCity: 'Hanoi (HAN)',
          days: 8,
          category: 'adventure',
          tripType: 'group',
          difficulty: 'easy',
          price: 42999,
          originalPrice: 48999,
          shortDesc: 'Bucketlist 8-day Vietnam group tour — Halong Bay overnight cruise, Ninh Binh sampan boat, and Hoi An lantern night.',
          longDesc: 'Explore North and Central Vietnam with Plan The Unplanned! Cruise emerald waters surrounded by limestone karsts in Halong Bay, cycle through rice paddies in Ninh Binh (Ha Long Bay on land), and release lanterns in ancient Hoi An.',
          inclusions: ['Hanoi to Da Nang domestic flight', 'Overnight Halong Bay Cruise ship', 'Boutique 4-star hotels', 'All breakfasts & cruise meals', 'Sampan boat ride in Trang An'],
          exclusions: ['International flights to Hanoi', 'E-visa fee ($25)'],
          paymentUrl: 'https://www.plantheunplanned.com/international-trips?filters=vietnam',
          tags: ['international', 'group', 'culture', 'cruise'],
          itinerary: [
            { title: 'Arrive Hanoi → Old Quarter Food Walk', description: 'Arrive in Hanoi. Evening egg coffee tasting and walking tour of 36 Old Quarter streets.', location: 'Hanoi', activities: ['Egg coffee tasting', 'Old quarter walk'], accommodation: '4-Star Hanoi Hotel', meals: ['Dinner'] },
            { title: 'Hanoi → Halong Bay Cruise Boarding', description: 'Drive to Halong Bay port and board luxury overnight cruise ship. Kayak through Sung Sot cave.', location: 'Halong Bay', activities: ['Kayaking', 'Cave exploration', 'Sunset party on deck'], accommodation: 'Luxury Cruise Ship', meals: ['Breakfast', 'Lunch', 'Dinner'] },
            { title: 'Halong Bay Tai Chi → Ninh Binh', description: 'Morning Tai Chi on deck, brunch, disembark and drive to Ninh Binh (Trang An landscape).', location: 'Ninh Binh', activities: ['Trang An sampan boat', 'Hang Mua peak climb'], accommodation: 'Ninh Binh Eco Lodge', meals: ['Breakfast', 'Brunch'] },
            { title: 'Ninh Binh Cycling → Flight to Da Nang → Hoi An', description: 'Morning bicycle ride through limestone peaks. Evening flight to Da Nang & transfer to Hoi An.', location: 'Hoi An', activities: ['Bicycle ride', 'Hoi An night market'], accommodation: 'Boutique Hoi An Resort', meals: ['Breakfast'] },
            { title: 'Hoi An Ancient Town & Basket Boat Ride', description: 'Explore yellow heritage houses, Japanese Covered Bridge, and coconut forest basket boat ride.', location: 'Hoi An', activities: ['Basket boat dance', 'Lantern making workshop'], accommodation: 'Boutique Resort', meals: ['Breakfast'] },
            { title: 'Bana Hills & Golden Hands Bridge', description: 'Take world\'s longest cable car to Bana Hills and walk the famous giant Golden Hands Bridge.', location: 'Da Nang', activities: ['Golden Bridge photo', 'French Village'], accommodation: 'Da Nang Beachfront Hotel', meals: ['Breakfast'] },
            { title: 'Da Nang Beach & Dragon Bridge Sunset', description: 'Relax at My Khe beach, seafood feast, and see the Dragon Bridge breathe fire on Saturday night.', location: 'Da Nang', activities: ['Dragon Bridge fire show', 'Beach time'], accommodation: 'Beachfront Hotel', meals: ['Breakfast'] },
            { title: 'Depart Vietnam', description: 'Breakfast and airport transfer to Da Nang International Airport (DAD).', location: 'Da Nang Airport', activities: ['Airport transfer'], meals: ['Breakfast'] },
          ]
        }
      ]
    },
    {
      slug: 'adventure-buddha',
      name: 'Adventure Buddha',
      email: 'adventurebuddha@partner.trippy',
      adminName: 'Adventure Buddha Team',
      emoji: '🚵',
      color: '#f59e0b',
      about: 'Adventure Buddha is India\'s favorite travel community for group trips, weekend getaways, trekking, and offbeat experiences from Bangalore.',
      website: 'https://adventurebuddha.com/',
      trips: [
        {
          name: 'Gokarna Beach Trek & Camping 3D',
          destination: 'Gokarna',
          destinationSlug: 'gokarna',
          startCity: 'Bengaluru',
          days: 3,
          category: 'beach',
          tripType: 'group',
          difficulty: 'easy',
          price: 3899,
          originalPrice: 4499,
          shortDesc: 'Adventure Buddha signature 5-beach cliff trek with beachside camping & bonfires.',
          longDesc: 'Trek across Gokarna\'s serene beaches with Adventure Buddha! Sleep under starry skies in beach tents, walk from Paradise beach to Om beach, and visit Mirjan Fort.',
          inclusions: ['AC/Non-AC Sleeper Bus', 'Beachside Tents', 'Breakfast & Dinner', 'Trek lead & permissions'],
          exclusions: ['Personal snacks & cafes'],
          paymentUrl: 'https://adventurebuddha.com/gokarna-beach-trek/',
          tags: ['beach', 'trek', 'domestic', 'camping'],
          itinerary: [
            { title: 'Bangalore → Gokarna Overnight', description: 'Overnight journey from Bangalore to Gokarna base camp.', location: 'Gokarna', activities: ['Overnight drive'], accommodation: 'Beach Tents', meals: ['Breakfast'] },
            { title: 'Beach Trek: Paradise to Om Beach', description: 'Trek through rocky cliff trails connecting Paradise, Half Moon, and Om beach. Beach bonfire at night.', location: 'Om Beach', activities: ['Beach trail trek', 'Night bonfire jam'], accommodation: 'Beach Tents', meals: ['Breakfast', 'Dinner'] },
            { title: 'Mirjan Fort → Return to Bangalore', description: 'Morning visit to 16th century Mirjan Fort. Return bus to Bangalore.', location: 'Mirjan Fort', activities: ['Fort exploration', 'Return bus'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Kudremukh Trek & Rainforest Exploration 3D',
          destination: 'Kudremukh',
          destinationSlug: 'kudremukh',
          startCity: 'Bengaluru',
          days: 3,
          category: 'trekking',
          tripType: 'group',
          difficulty: 'moderate',
          price: 4299,
          originalPrice: 4999,
          shortDesc: 'Conquer horse-face Kudremukh peak through green Shola forests & mountain streams.',
          longDesc: 'Hike through Western Ghats UNESCO heritage rainforest with Adventure Buddha. Climb past mist-shrouded valleys to the horse-face peak and stay in a traditional coffee homestay.',
          inclusions: ['Bus transport from Bangalore', 'Coffee estate homestay', 'Forest permits & entry fee', 'All trek meals'],
          exclusions: ['Personal gear'],
          paymentUrl: 'https://adventurebuddha.com/kudremukh-trek/',
          tags: ['trek', 'domestic', 'mountains', 'nature'],
          itinerary: [
            { title: 'Bangalore → Samse Base', description: 'Overnight bus drive to Kudremukh base homestay.', location: 'Samse', activities: ['Overnight travel'], accommodation: 'Coffee Homestay', meals: ['Breakfast'] },
            { title: 'Kudremukh Peak Summit (22 km)', description: 'Trek past streams and green ridges to Kudremukh peak (1,894m).', location: 'Kudremukh Peak', activities: ['Peak summit hike'], accommodation: 'Coffee Homestay', meals: ['Breakfast', 'Packed Lunch', 'Dinner'] },
            { title: 'Choma Gundi Waterfall → Return', description: 'Morning dip in Choma Gundi waterfall, afternoon return bus to Bangalore.', location: 'Chikmagalur', activities: ['Waterfall bath', 'Return drive'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Leh Ladakh Motorbike Expedition 8D',
          destination: 'Leh–Ladakh',
          destinationSlug: 'ladakh',
          startCity: 'Leh',
          days: 8,
          category: 'biking',
          tripType: 'group',
          difficulty: 'difficult',
          price: 24999,
          originalPrice: 28999,
          shortDesc: 'Ultimate Himalayan bike trip — Royal Enfield Himalayan bike, Khardung La (17,982ft), Pangong Tso & Nubra Valley.',
          longDesc: 'Ride through the highest motorable passes on earth with Adventure Buddha! Backed by mechanic backup vehicle, Royal Enfield Himalayan bikes, fuel, oxygen cylinders, and experienced road captains.',
          inclusions: ['Royal Enfield Himalayan Bike + Fuel', 'Backup mechanic vehicle', 'Hotels & luxury tents', 'Breakfast & Dinner daily', 'Inner line permits'],
          exclusions: ['Flights to Leh', 'Security deposit for bike'],
          paymentUrl: 'https://adventurebuddha.com/leh-ladakh-bike-expedition/',
          tags: ['bike-trip', 'domestic', 'mountains', 'adventure'],
          itinerary: [
            { title: 'Arrive in Leh → Acclimatization Day', description: 'Arrive at Leh airport (11,500ft). Full day rest for acclimatization. Evening bike allocation & test ride.', location: 'Leh', activities: ['Test ride', 'Shanti Stupa sunset'], accommodation: '3-Star Hotel Leh', meals: ['Dinner'] },
            { title: 'Leh → Sham Valley Local Ride', description: 'Ride to Magnetic Hill, Gurudwara Pathar Sahib, and Sangam (Confluence of Zanskar & Indus rivers).', location: 'Sham Valley', activities: ['Magnetic hill ride', 'Sangam point'], accommodation: '3-Star Hotel Leh', meals: ['Breakfast', 'Dinner'] },
            { title: 'Leh → Khardung La Pass → Nubra Valley', description: 'Conquer Khardung La pass (17,982ft). Descend into Nubra Valley and ride double-humped camels in Hunder sand dunes.', location: 'Nubra Valley', activities: ['Khardung La summit', 'Double-hump camel ride'], accommodation: 'Luxury Swiss Tents', meals: ['Breakfast', 'Dinner'] },
            { title: 'Nubra Valley → Diskit → Turtuk (Tibet Border)', description: 'Ride to Turtuk village, India\'s northernmost village near LOC. Taste fresh Baltic apricots.', location: 'Turtuk', activities: ['Diskit Monastery 100ft Buddha', 'Turtuk border village'], accommodation: 'Luxury Swiss Tents', meals: ['Breakfast', 'Dinner'] },
            { title: 'Nubra Valley → Shyok River Route → Pangong Lake', description: 'Ride along the wild Shyok river trail to the world-famous blue Pangong Tso lake (14,270ft).', location: 'Pangong Tso', activities: ['Pangong lake sunset', 'Stargazing'], accommodation: 'Lakefront Camps', meals: ['Breakfast', 'Dinner'] },
            { title: 'Pangong Lake → Chang La Pass → Leh', description: 'Wake up to Pangong sunrise, ride over Chang La pass (17,590ft), and return to Leh.', location: 'Leh', activities: ['Pangong sunrise', 'Chang La pass'], accommodation: '3-Star Hotel Leh', meals: ['Breakfast', 'Dinner'] },
            { title: 'Leh Local Exploration & Celebration Night', description: 'Visit Leh Palace and local market. Farewell dinner with certificates & gear handover.', location: 'Leh Market', activities: ['Leh Palace', 'Farewell party'], accommodation: '3-Star Hotel Leh', meals: ['Breakfast', 'Dinner'] },
            { title: 'Depart Leh', description: 'Airport drop after breakfast.', location: 'Leh Airport', activities: ['Airport drop'], meals: ['Breakfast'] },
          ]
        }
      ]
    },
    {
      slug: 'zostel-trips',
      name: 'Zostel Trips',
      email: 'zosteltrips@partner.trippy',
      adminName: 'Zostel Trips Team',
      emoji: '🛏️',
      color: '#ef4444',
      about: 'Official Zostel Trips (Zo Trips) community offering hostel-anchored group backpacking journeys, river rafting, and social loops across India.',
      website: 'https://www.zostel.com/zo-trips',
      trips: [
        {
          name: 'Rishikesh Rafting & Yoga Weekend 3D',
          destination: 'Rishikesh',
          destinationSlug: 'rishikesh',
          startCity: 'Delhi',
          days: 3,
          category: 'adventure',
          tripType: 'group',
          difficulty: 'easy',
          price: 5999,
          originalPrice: 6999,
          shortDesc: 'High-vibe weekend anchored at Zostel Rishikesh — 16km Ganga rafting, cliff jumping, Triveni Ghat aarti & bonfire.',
          longDesc: 'The ultimate weekend getaway! Stay in vibrant dorms at Zostel Rishikesh Tapovan, conquer 16km Grade III Ganga rapids, jump off 25ft cliffs, watch sunrise from Kunjapuri Temple, and jam by the bonfire.',
          inclusions: ['Delhi to Rishikesh AC Bus', 'Dorm stay at Zostel Rishikesh', '16km White Water Rafting with cliff jump', 'Sunrise Kunjapuri Temple cab', 'Breakfast daily'],
          exclusions: ['Bungee jumping (optional addon)'],
          paymentUrl: 'https://www.zostel.com/zo-trips',
          tags: ['group', 'adventure', 'water-sports', 'domestic'],
          itinerary: [
            { title: 'Delhi → Rishikesh Check-in at Zostel', description: 'Overnight bus from Delhi. Check in at Zostel Rishikesh Tapovan. Evening Beatles Ashram visit & Ganga Aarti.', location: 'Tapovan', activities: ['Beatles Ashram', 'Triveni Ghat Aarti'], accommodation: 'Zostel Rishikesh Dorm', meals: ['Dinner'] },
            { title: '16km Ganga Rafting & Cliff Jumping', description: 'Gear up for 16km whitewater rafting from Shivpuri to Laxman Jhula. Cliff jump from 25ft rock. Evening bonfire.', location: 'Shivpuri', activities: ['16km Rafting', 'Cliff jump', 'Zostel bonfire jam'], accommodation: 'Zostel Rishikesh Dorm', meals: ['Breakfast'] },
            { title: 'Sunrise Kunjapuri Temple → Return to Delhi', description: '5 AM drive to Kunjapuri Temple for 360° Himalayan sunrise. Afternoon bus back to Delhi.', location: 'Kunjapuri', activities: ['Sunrise temple view', 'Return bus'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Manali & Solang Valley Snow Getaway 4D',
          destination: 'Manali',
          destinationSlug: 'manali',
          startCity: 'Delhi',
          days: 4,
          category: 'backpacking',
          tripType: 'group',
          difficulty: 'easy',
          price: 8999,
          originalPrice: 10499,
          shortDesc: 'Stay at Zostel Old Manali — Old town cafes, Jogini waterfall hike, Solang valley snow & Atal Tunnel.',
          longDesc: 'Experience Old Manali\'s bohemian magic! Stay at Zostel Old Manali overlooking Manalsu river, hike to Jogini waterfall, drive through Atal Tunnel to Lahaul valley, and cafe crawl.',
          inclusions: ['Volvo Bus both ways (Delhi-Manali)', 'Dorm stay at Zostel Old Manali', 'Solang Valley & Atal Tunnel cab', 'Jogini waterfall trek guide'],
          exclusions: ['Paragliding / Skiing rental'],
          paymentUrl: 'https://www.zostel.com/zo-trips',
          tags: ['hill-station', 'group', 'domestic', 'mountains'],
          itinerary: [
            { title: 'Delhi → Manali Volvo → Old Manali Cafe Crawl', description: 'Arrive in Manali. Check in at Zostel Old Manali. Cafe crawl through Old Manali lanes.', location: 'Old Manali', activities: ['Cafe 1947', 'Manalsu river walk'], accommodation: 'Zostel Old Manali', meals: ['Dinner'] },
            { title: 'Jogini Waterfall Trek & Vashisht Hot Springs', description: 'Trek from Vashisht village through pine woods to Jogini waterfall. Dip in natural hot springs.', location: 'Vashisht', activities: ['Jogini waterfall hike', 'Hot spring bath'], accommodation: 'Zostel Old Manali', meals: ['Breakfast'] },
            { title: 'Solang Valley & Atal Tunnel Drive to Sissu', description: 'Drive through 9.02km Atal Tunnel into snowy Sissu village in Lahaul valley. Snow play & zip-line.', location: 'Sissu', activities: ['Atal Tunnel drive', 'Sissu waterfall'], accommodation: 'Zostel Old Manali', meals: ['Breakfast'] },
            { title: 'Hadimba Temple → Return Volvo', description: 'Visit Hadimba Temple & Mall Road souvenir shopping. Evening Volvo bus back to Delhi.', location: 'Mall Road', activities: ['Souvenir shopping', 'Return bus'], meals: ['Breakfast'] },
          ]
        },
        {
          name: 'Pondicherry French Quarter & Beach Escape 3D',
          destination: 'Pondicherry',
          destinationSlug: 'pondicherry',
          startCity: 'Chennai',
          days: 3,
          category: 'chill',
          tripType: 'group',
          difficulty: 'easy',
          price: 6299,
          originalPrice: 7299,
          shortDesc: 'French Quarter yellow villas, Promenade beach sunrise, Auroville Matrimandir & Paradise beach ferry.',
          longDesc: 'Discover the Franco-Tamil charm of Pondicherry! Stay in White Town, cycle through French heritage streets, visit Auroville globe, and boat to Paradise Beach.',
          inclusions: ['AC Bus from Chennai', 'White Town hostel stay', 'Bicycle rental for 2 days', 'Auroville entry pass & Paradise beach ferry'],
          exclusions: ['Personal meals'],
          paymentUrl: 'https://www.zostel.com/zo-trips',
          tags: ['beach', 'group', 'domestic', 'culture'],
          itinerary: [
            { title: 'Chennai → Pondicherry White Town', description: 'Drive along East Coast Road (ECR). Check into White Town hostel. Evening walk on Rock Beach Promenade.', location: 'White Town', activities: ['Promenade walk', 'French cafe dinner'], accommodation: 'Pondi Heritage Hostel', meals: ['Dinner'] },
          ]
        }
      ]
    },
    {
      slug: 'tripbae',
      name: 'Tripbae',
      email: 'tripbae@partner.trippy',
      adminName: 'Tripbae Team',
      emoji: '🚌',
      color: '#ed8323',
      about: 'Tripbae is a top-rated travel community in Bangalore offering affordable weekend getaways, group backpacking trips, and outdoor adventures.',
      website: 'https://tripbae.com/',
      trips: [
        {
          name: '3 Day Hampi Heritage Tour',
          destination: 'Hampi',
          destinationSlug: 'hampi',
          startCity: 'Bengaluru',
          days: 3,
          category: 'group',
          tripType: 'group',
          difficulty: 'easy',
          price: 5421,
          originalPrice: 8091,
          shortDesc: 'Explore UNESCO heritage ruins of Hampi — Virupaksha Temple, Lotus Mahal, Coracle ride on Tungabhadra & sunset at Hippie Island.',
          longDesc: 'Join Tripbae for an immersive 3-day journey through Vijayanagara Empire ruins in Hampi. Ride traditional coracle boats across Tungabhadra river, boulder climb Sanapur Lake, and watch golden sunsets over ancient temple ruins.',
          inclusions: ['Sleeper Bus transport from Bangalore', 'Heritage Guesthouse in Hampi', 'Coracle boat ride fee', 'Breakfast & Dinner daily', 'Licensed guide'],
          exclusions: ['Personal shopping & monument entry fees'],
          paymentUrl: 'https://tripbae.com/st_tour/3-day-hampi-itinerary-package-from-bangalore/',
          tags: ['domestic', 'group', 'culture', 'heritage'],
          itinerary: [
            { title: 'Bangalore → Hampi Check-in', description: 'Overnight bus drive from Bangalore to Hospet/Hampi. Check into traditional guesthouse.', location: 'Hampi', activities: ['Overnight bus drive'], accommodation: 'Hampi Guesthouse', meals: ['Breakfast'] },
            { title: 'Vijayanagara Ruins & Virupaksha Temple', description: 'Guided tour of Virupaksha Temple, Stone Chariot at Vittala Temple, Lotus Mahal & Elephant Stables.', location: 'Hampi Heritage Zone', activities: ['Vittala temple tour', 'Stone chariot photo'], accommodation: 'Hampi Guesthouse', meals: ['Breakfast', 'Dinner'] },
            { title: 'Coracle Boat Ride & Sanapur Lake Sunset → Return', description: 'Morning coracle boat ride on Tungabhadra river, cliff jump at Sanapur Lake. Evening bus back to Bangalore.', location: 'Sanapur Lake', activities: ['Coracle ride', 'Cliff jumping', 'Return bus'], meals: ['Breakfast'] },
          ]
        },
        {
          name: '3 Day Gokarna Murudeshwar Honnavar Tour',
          destination: 'Gokarna',
          destinationSlug: 'gokarna',
          startCity: 'Bengaluru',
          days: 3,
          category: 'beach',
          tripType: 'group',
          difficulty: 'easy',
          price: 4705,
          originalPrice: 7589,
          shortDesc: 'Tripbae popular 3-in-1 coastal trail — Gokarna Om beach trek, 123ft Murudeshwar Shiva temple & Honnavar backwater boat ride.',
          longDesc: 'Discover coastal Karnataka\'s trio of wonders with Tripbae! Walk along Kudle and Om beach, marvel at the giant Murudeshwar Shiva statue rising over the ocean, and cruise Sharavathi river mangroves in Honnavar.',
          inclusions: ['AC/Non-AC Sleeper Bus from Bangalore', 'Beachside Resort in Gokarna', 'Honnavar boat ride pass', 'Breakfast daily'],
          exclusions: ['Water sports & personal meals'],
          paymentUrl: 'https://tripbae.com/st_tour/3-day-gokarna-honnavar-murudeshwar-trip-from-bangalore/',
          tags: ['beach', 'domestic', 'group', 'culture'],
          itinerary: [
            { title: 'Bangalore → Gokarna Beach Check-in', description: 'Overnight bus ride to Gokarna. Check into beach resort near Kudle beach.', location: 'Gokarna', activities: ['Bus journey'], accommodation: 'Beach Resort', meals: ['Breakfast'] },
            { title: 'Om Beach Trail & Murudeshwar Temple', description: 'Morning beach walk to Om beach & Half Moon beach. Drive to Murudeshwar 20-story Gopuram and 123ft Shiva statue.', location: 'Murudeshwar', activities: ['Om beach walk', 'Murudeshwar Shiva temple'], accommodation: 'Beach Resort', meals: ['Breakfast', 'Dinner'] },
            { title: 'Honnavar Mangrove Boat Ride → Return', description: 'Boat cruise through dense mangrove forest in Sharavathi backwaters. Evening return bus to Bangalore.', location: 'Honnavar', activities: ['Backwater boat ride', 'Return bus'], meals: ['Breakfast'] },
          ]
        },
        {
          name: '3 Day Ooty & Coonoor Hill Getaway',
          destination: 'Coorg',
          destinationSlug: 'coorg',
          startCity: 'Bengaluru',
          days: 3,
          category: 'hill-station',
          tripType: 'group',
          difficulty: 'easy',
          price: 6184,
          originalPrice: 9230,
          shortDesc: 'Queen of Hill Stations getaway — Ooty Lake boating, Doddabetta Peak, Nilgiri Toy Train & Coonoor Tea Gardens.',
          longDesc: 'Escape to Nilgiri Hills with Tripbae! Ride the UNESCO Nilgiri Mountain Toy Train, stroll through botanical gardens, sample fresh Nilgiri tea in Coonoor, and enjoy cool misty mountain air.',
          inclusions: ['AC Coach transport from Bangalore', 'Hill station resort in Ooty', 'Nilgiri Toy Train ticket', 'Breakfast & Dinner daily'],
          exclusions: ['Personal expenses & camera fees'],
          paymentUrl: 'https://tripbae.com/st_tour/3-day-ooty-trip-from-bangalore/',
          tags: ['hill-station', 'domestic', 'group', 'nature'],
          itinerary: [
            { title: 'Bangalore → Bandipur Tiger Reserve → Ooty', description: 'Drive from Bangalore passing Bandipur forest (spot wild elephants!). Arrive in Ooty resort.', location: 'Ooty', activities: ['Bandipur forest drive', 'Ooty lake boating'], accommodation: 'Ooty Hill Resort', meals: ['Dinner'] },
            { title: 'Doddabetta Peak & Coonoor Tea Gardens', description: 'Visit Doddabetta Peak (2,637m), Rose Garden, and drive to Coonoor for Sim\'s Park & tea factory tour.', location: 'Coonoor', activities: ['Doddabetta view', 'Tea tasting'], accommodation: 'Ooty Hill Resort', meals: ['Breakfast', 'Dinner'] },
            { title: 'Nilgiri Toy Train Ride → Return to Bangalore', description: 'Ride historic steam toy train from Ooty to Coonoor. Afternoon drive back to Bangalore.', location: 'Nilgiri Express', activities: ['Toy train ride', 'Return drive'], meals: ['Breakfast'] },
          ]
        }
      ]
    }
  ]

  for (const comm of communities) {
    let org = db.prepare('SELECT id FROM partner_orgs WHERE slug = ?').get(comm.slug) as any
    let orgId = org ? org.id : uid()
    if (!org) {
      insOrg.run(orgId, comm.name, comm.slug, comm.emoji, comm.color, comm.about, comm.website)
    }
    const adminExists = db.prepare('SELECT 1 FROM partner_admins WHERE email = ?').get(comm.email)
    if (!adminExists) {
      insAdmin.run(uid(), orgId, comm.email, hash, salt, comm.adminName)
    }

    for (const t of comm.trips) {
      const tripSlug = slugify(t.name)
      const existingTrip = db.prepare('SELECT id FROM partner_trips WHERE slug = ? OR name = ?').get(tripSlug, t.name)
      if (existingTrip) continue

      const tripId = uid()
      const days = t.days
      const start = daysFromNow(20)
      const end = daysFromNow(20 + days - 1)

      insTrip.run(
        tripId, orgId, tripSlug, t.name, t.shortDesc, t.longDesc,
        t.destination, t.destinationSlug, t.startCity, start, end,
        days, t.category, t.tripType, t.difficulty, 18, 20,
        t.price, t.originalPrice, 'Ex-' + t.startCity + '. Book early for group discount.',
        j(t.inclusions), j(t.exclusions), cover(tripSlug), t.paymentUrl
      )

      for (let i = 0; i < t.itinerary.length; i++) {
        const day = t.itinerary[i]
        insDay.run(uid(), tripId, i + 1, day.title, day.description, day.location, j(day.activities), day.accommodation || '', j([]), i)
      }

      gallery(tripSlug, 3).forEach((u, i) => insMedia.run(uid(), tripId, u, 'image', i))
      for (const tag of t.tags) insTag.run(tripId, tag)
    }
  }

  console.log('[seed] Successfully seeded 5 real travel communities with authentic trips across Domestic, International, Treks, Hill Station, Beach, Group, Bike & Road Trips.')
}
