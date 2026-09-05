import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { db, migrate } from "./db.js";

export function seed() {
  migrate();
  const password = bcrypt.hashSync("Demo@123", 10);
  const creatorId = "creator-demo";
  const brandId = "brand-demo";
  const orgId = "org-demo";
  db.prepare("INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
    .run(creatorId, "creator@collabkaro.test", password, "creator", "Aanya Sharma");
  db.prepare("INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)")
    .run(brandId, "brand@collabkaro.test", password, "brand", "Rohan from Nivara");
  db.prepare("INSERT OR IGNORE INTO creator_profiles VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(creatorId, "aanyacreates", "Beauty creator sharing honest, joyful routines.", "Beauty", "Mumbai", 128000, 28000);
  db.prepare("INSERT OR IGNORE INTO organizations VALUES (?, ?, ?)").run(orgId, "Nivara Naturals", brandId);
  const exists = db.prepare("SELECT id FROM campaigns WHERE organization_id = ?").get(orgId);
  if (!exists) {
    db.prepare("INSERT INTO campaigns VALUES (?, ?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP)")
      .run(randomUUID(), orgId, "Glow, naturally", "Create an authentic morning-routine reel featuring our vitamin C serum.", "Beauty", 75000);
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seed();
  console.log("Demo data seeded.");
}