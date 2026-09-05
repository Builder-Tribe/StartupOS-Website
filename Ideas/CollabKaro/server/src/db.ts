import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const path = process.env.DATABASE_PATH || "data/collabkaro.db";
mkdirSync(dirname(path), { recursive: true });

export const db = new Database(path);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('creator','brand','admin')),
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS creator_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      handle TEXT NOT NULL UNIQUE,
      bio TEXT NOT NULL,
      niche TEXT NOT NULL,
      city TEXT NOT NULL,
      followers INTEGER NOT NULL DEFAULT 0,
      rate INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_user_id TEXT NOT NULL REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL REFERENCES organizations(id),
      title TEXT NOT NULL,
      brief TEXT NOT NULL,
      category TEXT NOT NULL,
      budget INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft','published','closed')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES campaigns(id),
      creator_user_id TEXT NOT NULL REFERENCES users(id),
      pitch TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('submitted','shortlisted','rejected')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(campaign_id, creator_user_id)
    );
  `);
}