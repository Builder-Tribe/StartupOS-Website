import { db } from '../db.js'
import { hashPassword, verifyPassword } from '../lib/password.js'

export function syncFounderAccounts(newPassword = 'harshit@14597') {
  const { hash, salt } = hashPassword(newPassword)
  const founderEmail = 'agarwal.harshit97@gmail.com'

  for (const email of [founderEmail]) {
    // 1. users table
    const u = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
    if (u) {
      db.prepare('UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?').run(hash, salt, u.id)
    } else {
      db.prepare(`INSERT INTO users (id, email, password_hash, password_salt, name, gender, city, email_verified, phone_verified, id_verified, onboarded, status)
        VALUES (?, ?, ?, ?, 'Harshit Agarwal', 'male', 'Bengaluru', 1, 1, 1, 1, 'active')`)
        .run('user-' + Date.now(), email, hash, salt)
    }

    // 2. admin_users table
    const a = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email) as any
    const adminId = a ? a.id : 'admin-' + Date.now()
    if (a) {
      db.prepare("UPDATE admin_users SET password_hash = ?, password_salt = ?, failed_login_count = 0, status = 'active' WHERE id = ?").run(hash, salt, a.id)
    } else {
      db.prepare("INSERT INTO admin_users (id, email, password_hash, password_salt, name, status) VALUES (?, ?, ?, ?, 'Harshit Agarwal', 'active')")
        .run(adminId, email, hash, salt)
    }
    db.prepare("INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, 'FOUNDER')").run(adminId)
    db.prepare("INSERT OR IGNORE INTO admin_user_roles (admin_id, role_key) VALUES (?, 'SUPER_ADMIN')").run(adminId)

    // 3. partner_admins table
    const p = db.prepare('SELECT id FROM partner_admins WHERE email = ?').get(email) as any
    if (p) {
      db.prepare("UPDATE partner_admins SET password_hash = ?, password_salt = ?, status = 'active' WHERE id = ?").run(hash, salt, p.id)
    } else {
      const org = db.prepare("SELECT id FROM partner_orgs LIMIT 1").get() as any
      const orgId = org ? org.id : 'effa9dd7-0f01-446c-9b2f-c5a32092b0b3'
      db.prepare("INSERT INTO partner_admins (id, org_id, email, password_hash, password_salt, name, role, status) VALUES (?, ?, ?, ?, ?, 'Harshit Agarwal', 'owner', 'active')")
        .run('partner-' + Date.now(), orgId, email, hash, salt)
    }

    // Verify
    const checkAdmin = db.prepare('SELECT password_hash, password_salt FROM admin_users WHERE email = ?').get(email) as any
    console.log(`[Sync] ${email} verified:`, verifyPassword(newPassword, checkAdmin.password_hash, checkAdmin.password_salt))
  }
}

syncFounderAccounts()
