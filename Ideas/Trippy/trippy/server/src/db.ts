import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Worker } from 'node:worker_threads'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ===================================================================
// If DATABASE_URL is set we run on PostgreSQL; otherwise the embedded
// node:sqlite file DB (unchanged). To keep the app's ~592 SYNCHRONOUS
// db.prepare().get/all/run() call-sites untouched, the Postgres path is
// exposed behind the SAME synchronous interface: a dedicated worker thread
// runs the async pg query while the main thread blocks on Atomics.wait for
// the result. Fully serial (slower under load) but a drop-in that needs zero
// changes anywhere outside this file.
// ===================================================================
const usingPg = !!process.env.DATABASE_URL

interface SyncStmt { get(...p: any[]): any; all(...p: any[]): any[]; run(...p: any[]): { changes: number } }
interface SyncDb { prepare(sql: string): SyncStmt; exec(sql: string): void }

// Translate our SQLite-flavored SQL to PostgreSQL (only used on the pg path).
function toPg(sql: string): string {
  let s = sql
  s = s.replace(/^[ \t]*PRAGMA[^;]*;?/gim, '')            // PRAGMAs have no PG equivalent
  let onConflict = false
  if (/INSERT\s+OR\s+IGNORE/i.test(s)) { s = s.replace(/INSERT\s+OR\s+IGNORE/i, 'INSERT'); onConflict = true }
  s = s.replace(/datetime\(\s*'now'\s*,\s*\?\s*\)/gi, "to_char((now() at time zone 'utc') + (?)::interval, 'YYYY-MM-DD HH24:MI:SS')")
  s = s.replace(/datetime\(\s*'now'\s*\)/gi, "to_char((now() at time zone 'utc'), 'YYYY-MM-DD HH24:MI:SS')")
  s = s.replace(/\bdate\(\s*([^(),]+?)\s*,\s*('[^']*')\s*\)/gi, "to_char(($1)::date + ($2)::interval, 'YYYY-MM-DD')")
  s = s.replace(/\bdate\(\s*([^(),]+?)\s*\)/gi, 'substr($1, 1, 10)')
  let i = 0
  s = s.replace(/\?/g, () => `$${++i}`)                   // positional ? -> $1, $2, ...
  if (onConflict) s = s.replace(/;?\s*$/, '') + ' ON CONFLICT DO NOTHING'
  return s
}

// Worker body (plain CommonJS string): owns the pg Pool, answers one query at a
// time, writes the JSON result into the shared buffer, and wakes the main thread.
const PG_WORKER = `
const { parentPort, workerData } = require('worker_threads')
const { Pool, types } = require('pg')
types.setTypeParser(20, v => parseInt(v, 10)) // bigint COUNT() -> number (SQLite-like)
const url = workerData.url
const ssl = /localhost|127\\.0\\.0\\.1/.test(url) ? undefined : { rejectUnauthorized: false }
const pool = new Pool({ connectionString: url, ssl })
const control = new Int32Array(workerData.control)
const data = new Uint8Array(workerData.data)
const enc = new TextEncoder()
function respond(obj) {
  let bytes = enc.encode(JSON.stringify(obj))
  if (bytes.length > data.length) bytes = enc.encode(JSON.stringify({ __error: 'pg result too large (' + bytes.length + ' bytes)' }))
  data.set(bytes)
  Atomics.store(control, 1, bytes.length)
  Atomics.store(control, 0, 1)
  Atomics.notify(control, 0)
}
parentPort.on('message', async (req) => {
  try {
    const r = await pool.query(req.text, req.params)
    if (req.method === 'get') respond({ value: r.rows[0] === undefined ? null : r.rows[0] })
    else if (req.method === 'all') respond({ value: r.rows })
    else if (req.method === 'run') respond({ value: { changes: r.rowCount == null ? 0 : r.rowCount } })
    else respond({ value: null })
  } catch (e) { respond({ __error: (e && e.message) || String(e) }) }
})
`

function makePgSync(): SyncDb {
  const control = new Int32Array(new SharedArrayBuffer(8))            // [status, length]
  const data = new Uint8Array(new SharedArrayBuffer(32 * 1024 * 1024)) // 32MB result buffer
  const dec = new TextDecoder()
  const worker = new Worker(PG_WORKER, {
    eval: true,
    workerData: { url: process.env.DATABASE_URL, control: control.buffer, data: data.buffer },
  })
  worker.unref()
  worker.on('error', e => { console.error('[db] pg worker crashed:', e); process.exit(1) })
  const call = (text: string, method: string, params: any[]): any => {
    Atomics.store(control, 0, 0)
    worker.postMessage({ text, method, params })
    if (Atomics.wait(control, 0, 0, 30000) === 'timed-out') throw new Error('[db] postgres query timed out')
    const len = Atomics.load(control, 1)
    const obj = JSON.parse(dec.decode(data.slice(0, len)))
    if (obj.__error) throw new Error('[db] postgres: ' + obj.__error)
    return obj.value
  }
  return {
    prepare(sql: string): SyncStmt {
      const text = toPg(sql)
      return {
        get: (...p) => call(text, 'get', p),
        all: (...p) => call(text, 'all', p),
        run: (...p) => call(text, 'run', p),
      }
    },
    exec: (sql: string) => { call(toPg(sql), 'exec', []) },
  }
}

// DB path is overridable (tests point it at a throwaway file / :memory:).
const envPath = process.env.TRIPPY_DB_PATH
let dbTarget: string
if (envPath === ':memory:') {
  dbTarget = ':memory:'
} else if (envPath) {
  mkdirSync(path.dirname(envPath), { recursive: true })
  dbTarget = envPath
} else {
  const dataDir = path.join(__dirname, '..', 'data')
  mkdirSync(dataDir, { recursive: true })
  dbTarget = path.join(dataDir, 'trippy.db')
}

export const db: SyncDb = (usingPg ? makePgSync() : new DatabaseSync(dbTarget)) as unknown as SyncDb
console.log(`[db] using ${usingPg ? 'PostgreSQL (DATABASE_URL)' : 'SQLite'}`)

db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  password_hash TEXT,
  password_salt TEXT,
  email_verified INTEGER DEFAULT 0,
  phone TEXT UNIQUE,
  name TEXT,
  age INTEGER,
  gender TEXT,
  city TEXT,
  avatar_color TEXT DEFAULT '#0d9488',
  avatar_emoji TEXT DEFAULT '🧭',
  travel_style TEXT,
  interests TEXT DEFAULT '[]',
  budget TEXT,
  languages TEXT DEFAULT '[]',
  bio TEXT DEFAULT '',
  personality TEXT,
  phone_verified INTEGER DEFAULT 0,
  id_verified INTEGER DEFAULT 0,
  emergency_name TEXT,
  emergency_phone TEXT,
  trust_score REAL,
  trust_reviews INTEGER DEFAULT 0,
  onboarded INTEGER DEFAULT 0,
  is_demo INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otps (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

-- Email verification tokens for both consumer and partner accounts.
CREATE TABLE IF NOT EXISTS email_verifications (
  token TEXT PRIMARY KEY,
  account_type TEXT NOT NULL,        -- 'user' | 'partner_admin'
  account_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  destination TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  flexible INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS connections (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL REFERENCES users(id),
  to_user TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT DEFAULT '',
  chat_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(from_user, to_user)
);

CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'dm',
  name TEXT,
  group_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_members (
  chat_id TEXT NOT NULL REFERENCES chats(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  chat_id TEXT NOT NULL REFERENCES chats(id),
  sender_id TEXT REFERENCES users(id),
  type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  pinned INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hostels (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  name TEXT NOT NULL,
  area TEXT,
  price_per_night INTEGER,
  rating REAL,
  review_count INTEGER DEFAULT 0,
  amenities TEXT DEFAULT '[]',
  vibe_tags TEXT DEFAULT '[]',
  description TEXT DEFAULT '',
  partner INTEGER DEFAULT 0,
  booking_url TEXT,
  created_by_user_id TEXT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS hostel_reviews (
  id TEXT PRIMARY KEY,
  hostel_id TEXT NOT NULL REFERENCES hostels(id),
  user_id TEXT REFERENCES users(id),
  rating INTEGER NOT NULL,
  text TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hostel_stays (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  hostel_id TEXT NOT NULL REFERENCES hostels(id),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  visible INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  reported_id TEXT NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS blocks (
  blocker_id TEXT NOT NULL REFERENCES users(id),
  blocked_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  creator_id TEXT NOT NULL REFERENCES users(id),
  chat_id TEXT REFERENCES chats(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL REFERENCES groups(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT DEFAULT 'member',
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES partner_trips(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'claimed',       -- claimed | confirmed | rejected | cancelled
  created_at TEXT DEFAULT (datetime('now')),
  decided_at TEXT,
  decided_by TEXT,                              -- partner_admins.id
  UNIQUE (trip_id, user_id)
);
CREATE TABLE IF NOT EXISTS waitlist (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES partner_trips(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  notified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (trip_id, user_id)
);
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  link TEXT DEFAULT '',
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bookings_trip ON bookings(trip_id);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read);
CREATE TABLE IF NOT EXISTS id_verifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  doc_type TEXT NOT NULL,
  doc_last4 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS vouches (
  id TEXT PRIMARY KEY,
  from_user TEXT NOT NULL REFERENCES users(id),
  to_user TEXT NOT NULL REFERENCES users(id),
  group_id TEXT REFERENCES groups(id),
  rating INTEGER NOT NULL,
  text TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE (from_user, to_user)
);
CREATE TABLE IF NOT EXISTS polls (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  question TEXT NOT NULL,
  options TEXT NOT NULL DEFAULT '[]',
  created_by TEXT REFERENCES users(id),
  closed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id TEXT NOT NULL REFERENCES polls(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  option_idx INTEGER NOT NULL,
  PRIMARY KEY (poll_id, user_id)
);
CREATE TABLE IF NOT EXISTS itinerary_items (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  day INTEGER NOT NULL,
  time TEXT DEFAULT '',
  title TEXT NOT NULL,
  notes TEXT DEFAULT '',
  cost INTEGER DEFAULT 0,
  created_by TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS destinations (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  state TEXT,
  emoji TEXT,
  tagline TEXT,
  hostel_night INTEGER,
  food_day INTEGER,
  transport_day INTEGER,
  intercity INTEGER,
  activities TEXT DEFAULT '[]',
  extras TEXT DEFAULT '[]',
  best_months TEXT,
  tags TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS group_trips (
  id TEXT PRIMARY KEY,
  destination TEXT NOT NULL,
  operator TEXT NOT NULL,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  duration_days INTEGER NOT NULL,
  start_city TEXT,
  start_date TEXT,
  inclusions TEXT DEFAULT '[]',
  activity_tags TEXT DEFAULT '[]',
  difficulty TEXT DEFAULT 'moderate',
  rating REAL,
  review_count INTEGER DEFAULT 0,
  group_size_max INTEGER,
  group_size_current INTEGER,
  gender_ratio TEXT,
  availability TEXT DEFAULT 'available'
);

-- ===================================================================
-- Partner CRM / Host Portal (supply side). Multi-tenant from the start:
-- every partner row is scoped to an org_id and never crosses tenants.
-- ===================================================================

CREATE TABLE IF NOT EXISTS partner_orgs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_emoji TEXT DEFAULT '🏔️',
  logo_color TEXT DEFAULT '#0d9488',
  about TEXT DEFAULT '',
  website TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS partner_admins (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES partner_orgs(id),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  email_verified INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS partner_trips (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES partner_orgs(id),
  slug TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',        -- draft | published | completed | archived
  name TEXT DEFAULT '',
  short_desc TEXT DEFAULT '',
  long_desc TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  destination_slug TEXT,                        -- optional link to a known destination
  start_city TEXT DEFAULT '',
  start_date TEXT,
  end_date TEXT,
  duration_days INTEGER,
  category TEXT DEFAULT '',
  trip_type TEXT DEFAULT '',
  difficulty TEXT DEFAULT '',
  min_age INTEGER,
  max_group_size INTEGER,
  price INTEGER,
  original_price INTEGER,
  currency TEXT DEFAULT 'INR',
  pricing_notes TEXT DEFAULT '',
  inclusions TEXT DEFAULT '[]',
  exclusions TEXT DEFAULT '[]',
  cover_image TEXT DEFAULT '',
  payment_url TEXT DEFAULT '',
  -- Future Partner-API sync hooks (unused in Phase 1, kept so sync slots in later)
  source TEXT NOT NULL DEFAULT 'crm',           -- crm | api_sync
  external_ref TEXT,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trip_itinerary_days (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES partner_trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  activities TEXT DEFAULT '[]',
  accommodation TEXT DEFAULT '',
  meals TEXT DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trip_media (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES partner_trips(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'image',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trip_tags (
  trip_id TEXT NOT NULL REFERENCES partner_trips(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (trip_id, tag)
);

CREATE TABLE IF NOT EXISTS trip_categories (
  slug TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT DEFAULT '🎒'
);

CREATE TABLE IF NOT EXISTS trip_outbound_clicks (
  id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL REFERENCES partner_trips(id),
  org_id TEXT NOT NULL REFERENCES partner_orgs(id),
  user_id TEXT REFERENCES users(id),
  anon_session_id TEXT,
  source_page TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partner_trips_org ON partner_trips(org_id);
CREATE INDEX IF NOT EXISTS idx_partner_trips_status ON partner_trips(status);
CREATE INDEX IF NOT EXISTS idx_itinerary_trip ON trip_itinerary_days(trip_id);
CREATE INDEX IF NOT EXISTS idx_media_trip ON trip_media(trip_id);
CREATE INDEX IF NOT EXISTS idx_clicks_trip ON trip_outbound_clicks(trip_id);

-- ===================================================================
-- Admin Console (internal control center). Separate auth boundary +
-- configurable RBAC; operates on the canonical entities above.
-- ===================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active',        -- active | deactivated
  session_epoch INTEGER NOT NULL DEFAULT 0,
  last_login_at TEXT,
  failed_login_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_roles (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS admin_permissions (
  key TEXT PRIMARY KEY,
  grp TEXT NOT NULL,
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
  role_key TEXT NOT NULL REFERENCES admin_roles(key),
  permission TEXT NOT NULL,
  PRIMARY KEY (role_key, permission)
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
  admin_id TEXT NOT NULL REFERENCES admin_users(id),
  role_key TEXT NOT NULL REFERENCES admin_roles(key),
  PRIMARY KEY (admin_id, role_key)
);

-- Immutable audit trail (no update/delete endpoints ever expose this).
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_id TEXT,
  admin_name TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  resource_name TEXT,
  prev_state TEXT,
  new_state TEXT,
  reason TEXT,
  metadata TEXT,
  ip TEXT,
  request_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Internal notes attachable to any canonical entity; never shown to
-- consumer/partner apps.
CREATE TABLE IF NOT EXISTS internal_notes (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,     -- partner | trip | hostel | traveller
  entity_id TEXT NOT NULL,
  author_id TEXT,
  author_name TEXT,
  content TEXT NOT NULL,
  edited INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Login events for travellers/admins (operational + troubleshooting).
CREATE TABLE IF NOT EXISTS login_events (
  id TEXT PRIMARY KEY,
  user_type TEXT NOT NULL,       -- traveller | admin
  user_id TEXT,
  email TEXT,
  success INTEGER NOT NULL,
  failure_reason TEXT,
  provider TEXT DEFAULT 'password',
  device TEXT,
  browser TEXT,
  os TEXT,
  ip TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sessions (JWT carries the id as sid; revocation checked on each request).
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_type TEXT NOT NULL,       -- traveller | admin
  user_id TEXT NOT NULL,
  device TEXT,
  browser TEXT,
  os TEXT,
  ip TEXT,
  revoked INTEGER NOT NULL DEFAULT 0,
  revoked_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  last_seen_at TEXT DEFAULT (datetime('now'))
);

-- Lifecycle status history for auditable entities.
CREATE TABLE IF NOT EXISTS status_history (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id TEXT,
  actor_name TEXT,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_notes_entity ON internal_notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_login_user ON login_events(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_type, user_id);
CREATE INDEX IF NOT EXISTS idx_status_hist ON status_history(entity_type, entity_id);

-- ===================================================================
-- Trip Stories — Polarsteps-inspired travel diary + social feed (PRD 3.14/3.15/3.16)
-- ===================================================================

CREATE TABLE IF NOT EXISTS trip_stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  cover_photo TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  destination_slug TEXT,
  start_date TEXT,
  end_date TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',   -- public | private
  status TEXT NOT NULL DEFAULT 'active',        -- active | completed
  source_type TEXT,                             -- group | partner_trip | null
  source_id TEXT,
  like_count INTEGER NOT NULL DEFAULT 0,
  step_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS story_steps (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES trip_stories(id) ON DELETE CASCADE,
  day_number INTEGER DEFAULT 1,
  date TEXT,
  location TEXT DEFAULT '',
  country TEXT DEFAULT 'India',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  photos TEXT DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS story_reactions (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES trip_stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(story_id, user_id)
);

CREATE TABLE IF NOT EXISTS story_comments (
  id TEXT PRIMARY KEY,
  story_id TEXT NOT NULL REFERENCES trip_stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stories_user ON trip_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_dest ON trip_stories(destination_slug);
CREATE INDEX IF NOT EXISTS idx_stories_vis ON trip_stories(visibility, created_at);
CREATE INDEX IF NOT EXISTS idx_story_steps ON story_steps(story_id, sort_order);

CREATE TABLE IF NOT EXISTS trip_expenses (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'misc',
  paid_by TEXT NOT NULL REFERENCES users(id),
  split_among TEXT NOT NULL DEFAULT '[]',
  splits TEXT NOT NULL DEFAULT '{}',
  split_type TEXT NOT NULL DEFAULT 'equal',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expense_settlements (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES groups(id),
  from_user TEXT NOT NULL REFERENCES users(id),
  to_user TEXT NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_expenses_group ON trip_expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group ON expense_settlements(group_id);

CREATE TABLE IF NOT EXISTS trip_reviews (
  id TEXT PRIMARY KEY,
  reviewer_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  photos TEXT NOT NULL DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(reviewer_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON trip_reviews(target_type, target_id);

-- One-way follows (Twitter/Instagram style)
CREATE TABLE IF NOT EXISTS follows (
  follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (follower_id, following_id)
);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
`)

// ---- Migrations for databases created before email+password auth ----
// `CREATE TABLE IF NOT EXISTS` can't alter an existing table, so upgrade in place.
function migrate() {
  // Column helpers, dialect-aware. Postgres has ADD COLUMN IF NOT EXISTS; SQLite
  // does not, so there we probe PRAGMA table_info first.
  const cols = (t: string) => usingPg ? [] : (db.prepare(`PRAGMA table_info(${t})`).all() as any[]).map(c => c.name)
  const addCol = (table: string, col: string, ddl: string) => {
    if (usingPg) db.exec(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${ddl}`)
    else if (!cols(table).includes(col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`)
  }

  // Legacy SQLite upgrade: rebuild pre-email users tables. Never needed on Postgres.
  const userCols = usingPg ? [] : (db.prepare('PRAGMA table_info(users)').all() as any[]).map(c => c.name)
  if (!usingPg && userCols.length && !userCols.includes('email')) {
    // Rebuild users to add email/password columns and relax phone NOT NULL,
    // preserving ids so all foreign keys stay valid. legacy_alter_table keeps
    // other tables' FK references pointing at "users" through the rename.
    db.exec(`
      PRAGMA foreign_keys=OFF;
      PRAGMA legacy_alter_table=ON;
      ALTER TABLE users RENAME TO users_old;
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        password_salt TEXT,
        email_verified INTEGER DEFAULT 0,
        phone TEXT UNIQUE,
        name TEXT, age INTEGER, gender TEXT, city TEXT,
        avatar_color TEXT DEFAULT '#0d9488', avatar_emoji TEXT DEFAULT '🧭',
        travel_style TEXT, interests TEXT DEFAULT '[]', budget TEXT, languages TEXT DEFAULT '[]',
        bio TEXT DEFAULT '', personality TEXT,
        phone_verified INTEGER DEFAULT 0, id_verified INTEGER DEFAULT 0,
        emergency_name TEXT, emergency_phone TEXT,
        trust_score REAL, trust_reviews INTEGER DEFAULT 0,
        onboarded INTEGER DEFAULT 0, is_demo INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );
      INSERT INTO users (id, phone, name, age, gender, city, avatar_color, avatar_emoji, travel_style, interests, budget, languages, bio, personality, phone_verified, id_verified, emergency_name, emergency_phone, trust_score, trust_reviews, onboarded, is_demo, created_at)
        SELECT id, phone, name, age, gender, city, avatar_color, avatar_emoji, travel_style, interests, budget, languages, bio, personality, phone_verified, id_verified, emergency_name, emergency_phone, trust_score, trust_reviews, onboarded, is_demo, created_at FROM users_old;
      DROP TABLE users_old;
      PRAGMA legacy_alter_table=OFF;
      PRAGMA foreign_keys=ON;
    `)
    console.log('[migrate] users upgraded to email + password schema')
  }

  addCol('partner_admins', 'email_verified', 'email_verified INTEGER DEFAULT 0')

  // Traveller lifecycle + login tracking + session revocation.
  addCol('users', 'status', "status TEXT NOT NULL DEFAULT 'active'")
  addCol('users', 'session_epoch', 'session_epoch INTEGER NOT NULL DEFAULT 0')
  addCol('users', 'last_login_at', 'last_login_at TEXT')
  addCol('users', 'login_count', 'login_count INTEGER NOT NULL DEFAULT 0')

  // Partner org lifecycle.
  addCol('partner_orgs', 'status', "status TEXT NOT NULL DEFAULT 'active'")
  addCol('partner_orgs', 'updated_at', 'updated_at TEXT')
  addCol('partner_admins', 'status', "status TEXT NOT NULL DEFAULT 'active'")
  addCol('partner_admins', 'session_epoch', 'session_epoch INTEGER NOT NULL DEFAULT 0')

  // Trip: featured flag (status already supports draft/published/completed/archived; + suspended/unpublished as strings).
  addCol('partner_trips', 'featured', 'featured INTEGER NOT NULL DEFAULT 0')

  // Trip Hubs: a group can be the travellers' hub of a hosted ('partner') or
  // operator ('operator') trip; invite_code lets members share a join link.
  addCol('groups', 'source_type', 'source_type TEXT')
  addCol('groups', 'source_id', 'source_id TEXT')
  addCol('groups', 'invite_code', 'invite_code TEXT')

  // Traveller trust pack: self-reported history + public social handles.
  addCol('users', 'past_trips', "past_trips TEXT DEFAULT '[]'")
  addCol('users', 'socials', "socials TEXT DEFAULT '{}'")

  // Canonicalize hostels into a Property model (published-only shown to consumers).
  for (const [c, ddl] of [
    ['property_type', "property_type TEXT NOT NULL DEFAULT 'hostel'"],
    ['status', "status TEXT NOT NULL DEFAULT 'published'"],
    ['featured', 'featured INTEGER NOT NULL DEFAULT 0'],
    ['source', "source TEXT NOT NULL DEFAULT 'seed'"],
    ['slug', 'slug TEXT'],
    ['short_desc', "short_desc TEXT DEFAULT ''"],
    ['cover_image', "cover_image TEXT DEFAULT ''"],
    ['gallery', "gallery TEXT DEFAULT '[]'"],
    ['city', 'city TEXT'],
    ['state', 'state TEXT'],
    ['country', "country TEXT DEFAULT 'India'"],
    ['address', 'address TEXT'],
    ['locality', 'locality TEXT'],
    ['postal_code', 'postal_code TEXT'],
    ['latitude', 'latitude REAL'],
    ['longitude', 'longitude REAL'],
    ['email', 'email TEXT'],
    ['phone', 'phone TEXT'],
    ['website', 'website TEXT'],
    ['highlights', "highlights TEXT DEFAULT '[]'"],
    ['suitable_for', "suitable_for TEXT DEFAULT '[]'"],
    ['checkin_time', 'checkin_time TEXT'],
    ['checkout_time', 'checkout_time TEXT'],
    ['rules', "rules TEXT DEFAULT ''"],
    ['cancellation', "cancellation TEXT DEFAULT ''"],
    ['categories', "categories TEXT DEFAULT '[]'"],
    ['tags', "tags TEXT DEFAULT '[]'"],
    ['seo_title', 'seo_title TEXT'],
    ['seo_description', 'seo_description TEXT'],
    ['external_ref', 'external_ref TEXT'],
    ['last_verified_at', 'last_verified_at TEXT'],
    ['published_at', 'published_at TEXT'],
    ['created_at', 'created_at TEXT'],
    ['updated_at', 'updated_at TEXT'],
  ] as [string, string][]) addCol('hostels', c, ddl)

  // Trip photo gallery (PRD 3.11): URL-based shared photo album per hub group.
  db.exec(`CREATE TABLE IF NOT EXISTS trip_photos (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id),
    added_by TEXT REFERENCES users(id),
    url TEXT NOT NULL,
    caption TEXT,
    taken_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_trip_photos_group ON trip_photos(group_id)`)
  // AI highlights reel (PRD 3.12): stored on the group, regeneratable.
  addCol('groups', 'highlights_reel', 'highlights_reel TEXT')
  addCol('groups', 'highlights_at', 'highlights_at TEXT')

  // Trip document vault (PRD 3.4): URL-based doc storage per hub group.
  // File upload deferred to T.12 (S3/R2); URLs cover e-tickets, booking PDFs, permits etc.
  db.exec(`CREATE TABLE IF NOT EXISTS trip_documents (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL REFERENCES groups(id),
    added_by TEXT REFERENCES users(id),
    doc_type TEXT NOT NULL DEFAULT 'other',
    name TEXT NOT NULL,
    ref_number TEXT,
    date TEXT,
    url TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_trip_docs_group ON trip_documents(group_id)`)

  // Booking records for operator group trips (separate from partner trip bookings).
  // Created when a user confirms a trip purchase; hub join is a separate step.
  db.exec(`CREATE TABLE IF NOT EXISTS operator_bookings (
    id TEXT PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES group_trips(id),
    user_id TEXT NOT NULL,
    booked_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(trip_id, user_id)
  )`)

  // ===================================================================
  // Phase 4 — Bike & Road Trip Verticals
  // ===================================================================
  db.exec(`CREATE TABLE IF NOT EXISTS bike_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL DEFAULT 'motorcycle',
    engine_cc INTEGER,
    experience_level TEXT NOT NULL DEFAULT 'intermediate', -- beginner | intermediate | expert
    riding_since INTEGER,
    bio TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`)

  db.exec(`CREATE TABLE IF NOT EXISTS car_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL DEFAULT 'hatchback',
    seating_capacity INTEGER NOT NULL DEFAULT 4,
    ac INTEGER DEFAULT 1,
    route_bio TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`)

  db.exec(`CREATE TABLE IF NOT EXISTS adventure_routes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'bike',       -- bike | road
    title TEXT NOT NULL,
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    waypoints TEXT NOT NULL DEFAULT '[]',    -- [{city, lat, lon}]
    start_date TEXT,
    end_date TEXT,
    distance_km INTEGER,
    status TEXT NOT NULL DEFAULT 'planning', -- planning | active | completed | cancelled
    seat_capacity INTEGER DEFAULT 1,         -- road: seats available for carpooling
    seat_cost INTEGER DEFAULT 0,             -- road: per-seat cost estimate (INR)
    notes TEXT DEFAULT '',
    companion_matching INTEGER DEFAULT 1,
    group_id TEXT REFERENCES groups(id),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_adv_routes_user ON adventure_routes(user_id)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_adv_routes_status ON adventure_routes(status)`)

  db.exec(`CREATE TABLE IF NOT EXISTS ride_location_pings (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL REFERENCES adventure_routes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    accuracy REAL,
    battery_pct INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_pings_route ON ride_location_pings(route_id, user_id, created_at)`)

  db.exec(`CREATE TABLE IF NOT EXISTS ride_checkins (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL REFERENCES adventure_routes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    waypoint_label TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    missed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_checkins_route ON ride_checkins(route_id)`)

  db.exec(`CREATE TABLE IF NOT EXISTS carpool_requests (
    id TEXT PRIMARY KEY,
    route_id TEXT NOT NULL REFERENCES adventure_routes(id) ON DELETE CASCADE,
    requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | accepted | rejected
    message TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(route_id, requester_id)
  )`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_carpool_route ON carpool_requests(route_id)`)

  // Password reset tokens (forgot-password flow).
  db.exec(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`)

  // Backfill sensible defaults for pre-existing seeded hostels.
  if (usingPg || cols('hostels').includes('status')) {
    if (!cols('hostels').includes('created_by_user_id')) {
      try { db.exec(`ALTER TABLE hostels ADD COLUMN created_by_user_id TEXT REFERENCES users(id)`) } catch {}
    }
    db.exec(`UPDATE hostels SET
      status = COALESCE(NULLIF(status, ''), 'published'),
      source = COALESCE(NULLIF(source, ''), 'seed'),
      city = COALESCE(city, area),
      cover_image = COALESCE(NULLIF(cover_image, ''), ''),
      created_at = COALESCE(created_at, datetime('now')),
      published_at = COALESCE(published_at, datetime('now'))
      WHERE status IS NULL OR source IS NULL OR city IS NULL OR created_at IS NULL`)
  }
}
migrate()

export const uid = () => crypto.randomUUID()
export const j = (v: unknown) => JSON.stringify(v)
export const pj = <T = unknown>(s: unknown, fallback: T): T => {
  if (typeof s !== 'string') return fallback
  try { return JSON.parse(s) as T } catch { return fallback }
}
export const nowIso = () => new Date().toISOString().replace('T', ' ').slice(0, 19)
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'trip'
export const today = () => new Date().toISOString().slice(0, 10)
export const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
