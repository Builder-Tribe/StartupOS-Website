/**
 * Client-side auth store — manages Consumer, Seller, and Admin user registries
 * in localStorage. In production these calls are replaced by API requests.
 *
 * Three isolated registries:
 *   ds_consumer_users  — shoppers registered on the consumer app
 *   ds_seller_users    — sellers (may or may not have completed onboarding)
 *   ds_admin_users     — admin console users, managed by super-admin
 *
 * The founder account is seeded into every registry automatically so it always
 * works regardless of which portal is accessed first.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConsumerUser {
  id:         string;
  name:       string;
  email:      string;
  password:   string; // plaintext for dev — swap for bcrypt hash in prod
  is_pro:     boolean;
  city?:      string;
  created_at: string;
}

export interface SellerUser {
  id:            string;
  name:          string;
  email:         string;
  password:      string;
  business_name: string;
  city:          string;
  is_onboarded:  boolean; // true once GSTIN + UPI collected
  created_at:    string;
}

export interface AdminUser {
  id:             string;
  name:           string;
  email:          string;
  password:       string;
  role:           "super_admin" | "admin" | "support";
  is_super_admin: boolean;
  must_reset_pwd: boolean; // true for users added by super-admin
  created_at:     string;
}

export type AuthResult<T> =
  | { success: true;  user: T }
  | { success: false; error: string };

// ── Storage keys ──────────────────────────────────────────────────────────────

const KEYS = {
  consumer: "ds_consumer_users",
  seller:   "ds_seller_users",
  admin:    "ds_admin_users",
} as const;

// ── Founder seed (always present in every registry) ───────────────────────────

const FOUNDER_EMAIL    = "agarwal.harshit97@gmail.com";
const FOUNDER_PASSWORD = "harshit@14597";
const FOUNDER_NAME     = "Harshit Agarwal";

// ── Generic helpers ───────────────────────────────────────────────────────────

function readStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

// ── Consumer store ────────────────────────────────────────────────────────────

function seedConsumer(): void {
  const users = readStore<ConsumerUser>(KEYS.consumer);
  if (users.some((u) => u.email === FOUNDER_EMAIL)) return;
  users.unshift({
    id:         "u_harshit_agarwal",
    name:       FOUNDER_NAME,
    email:      FOUNDER_EMAIL,
    password:   FOUNDER_PASSWORD,
    is_pro:     true,
    city:       "Bengaluru",
    created_at: new Date().toISOString(),
  });
  writeStore(KEYS.consumer, users);
}

export function registerConsumer(
  name: string,
  email: string,
  password: string,
): AuthResult<ConsumerUser> {
  seedConsumer();
  const users = readStore<ConsumerUser>(KEYS.consumer);
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "An account with this email already exists" };
  }
  const user: ConsumerUser = {
    id:         generateId("u"),
    name:       name.trim(),
    email:      email.trim().toLowerCase(),
    password,
    is_pro:     false,
    created_at: new Date().toISOString(),
  };
  writeStore(KEYS.consumer, [...users, user]);
  return { success: true, user };
}

export function loginConsumer(
  email: string,
  password: string,
): AuthResult<ConsumerUser> {
  seedConsumer();
  const users = readStore<ConsumerUser>(KEYS.consumer);
  const user  = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user)                  return { success: false, error: "No account found with this email" };
  if (user.password !== password) return { success: false, error: "Incorrect password" };
  return { success: true, user };
}

// ── Seller store ──────────────────────────────────────────────────────────────

function seedSeller(): void {
  const sellers = readStore<SellerUser>(KEYS.seller);
  if (sellers.some((s) => s.email === FOUNDER_EMAIL)) return;
  sellers.unshift({
    id:            "sel_harshit_agarwal",
    name:          FOUNDER_NAME,
    email:         FOUNDER_EMAIL,
    password:      FOUNDER_PASSWORD,
    business_name: "DupeScout Demo Store",
    city:          "Bengaluru",
    is_onboarded:  true,
    created_at:    new Date().toISOString(),
  });
  writeStore(KEYS.seller, sellers);
}

export function registerSeller(
  name: string,
  email: string,
  password: string,
): AuthResult<SellerUser> {
  seedSeller();
  const sellers = readStore<SellerUser>(KEYS.seller);
  if (sellers.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "A seller account with this email already exists" };
  }
  const seller: SellerUser = {
    id:            generateId("sel"),
    name:          name.trim(),
    email:         email.trim().toLowerCase(),
    password,
    business_name: "",
    city:          "",
    is_onboarded:  false,
    created_at:    new Date().toISOString(),
  };
  writeStore(KEYS.seller, [...sellers, seller]);
  return { success: true, user: seller };
}

export function loginSeller(
  email: string,
  password: string,
): AuthResult<SellerUser> {
  seedSeller();
  const sellers = readStore<SellerUser>(KEYS.seller);
  const seller  = sellers.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
  if (!seller)                    return { success: false, error: "No seller account found with this email" };
  if (seller.password !== password) return { success: false, error: "Incorrect password" };
  return { success: true, user: seller };
}

export function markSellerOnboarded(sellerId: string): void {
  const sellers = readStore<SellerUser>(KEYS.seller);
  const idx = sellers.findIndex((s) => s.id === sellerId);
  if (idx !== -1) {
    sellers[idx].is_onboarded = true;
    writeStore(KEYS.seller, sellers);
  }
}

export function getSellerById(id: string): SellerUser | null {
  const sellers = readStore<SellerUser>(KEYS.seller);
  return sellers.find((s) => s.id === id) ?? null;
}

// ── Admin store ───────────────────────────────────────────────────────────────

function seedAdmin(): void {
  const admins = readStore<AdminUser>(KEYS.admin);
  if (admins.some((a) => a.email === FOUNDER_EMAIL)) return;
  admins.unshift({
    id:             "admin_harshit_agarwal",
    name:           FOUNDER_NAME,
    email:          FOUNDER_EMAIL,
    password:       FOUNDER_PASSWORD,
    role:           "super_admin",
    is_super_admin: true,
    must_reset_pwd: false,
    created_at:     new Date().toISOString(),
  });
  writeStore(KEYS.admin, admins);
}

export function loginAdmin(
  email: string,
  password: string,
): AuthResult<AdminUser> {
  seedAdmin();
  const admins = readStore<AdminUser>(KEYS.admin);
  const admin  = admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  if (!admin)                    return { success: false, error: "No admin account found with this email" };
  if (admin.password !== password) return { success: false, error: "Incorrect password" };
  return { success: true, user: admin };
}

export function addAdminUser(
  byAdminId: string,
  name: string,
  email: string,
  tempPassword: string,
  role: AdminUser["role"] = "admin",
): AuthResult<AdminUser> {
  seedAdmin();
  const admins  = readStore<AdminUser>(KEYS.admin);
  const creator = admins.find((a) => a.id === byAdminId);
  if (!creator?.is_super_admin) {
    return { success: false, error: "Only the super admin can add new users" };
  }
  if (admins.some((a) => a.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "An admin account with this email already exists" };
  }
  const newAdmin: AdminUser = {
    id:             generateId("admin"),
    name:           name.trim(),
    email:          email.trim().toLowerCase(),
    password:       tempPassword,
    role,
    is_super_admin: false,
    must_reset_pwd: true,
    created_at:     new Date().toISOString(),
  };
  writeStore(KEYS.admin, [...admins, newAdmin]);
  return { success: true, user: newAdmin };
}

export function revokeAdminUser(byAdminId: string, targetId: string): boolean {
  seedAdmin();
  const admins  = readStore<AdminUser>(KEYS.admin);
  const creator = admins.find((a) => a.id === byAdminId);
  if (!creator?.is_super_admin) return false;
  writeStore(KEYS.admin, admins.filter((a) => a.id !== targetId));
  return true;
}

export function updateAdminPassword(adminId: string, newPassword: string): boolean {
  const admins = readStore<AdminUser>(KEYS.admin);
  const idx    = admins.findIndex((a) => a.id === adminId);
  if (idx === -1) return false;
  admins[idx].password       = newPassword;
  admins[idx].must_reset_pwd = false;
  writeStore(KEYS.admin, admins);
  return true;
}

export function getAllAdmins(): AdminUser[] {
  seedAdmin();
  return readStore<AdminUser>(KEYS.admin);
}
