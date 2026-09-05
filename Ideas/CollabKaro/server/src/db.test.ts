import { beforeAll, describe, expect, it } from "vitest";
import { db, migrate } from "./db.js";
import { seed } from "./seed.js";
import { ApplicationError, submitApplication } from "./applications.js";

describe("CollabKaro persistence foundation", () => {
  beforeAll(() => {
    migrate();
    seed();
  });

  it("seeds creator, brand, and a published campaign", () => {
    const roles = db.prepare("SELECT role FROM users ORDER BY role").all() as { role: string }[];
    const campaign = db.prepare("SELECT status FROM campaigns LIMIT 1").get() as { status: string };
    expect(roles.map((row) => row.role)).toEqual(["brand", "creator"]);
    expect(campaign.status).toBe("published");
  });

  it("prevents duplicate creator applications", () => {
    const campaign = db.prepare("SELECT id FROM campaigns LIMIT 1").get() as { id: string };
    db.prepare("DELETE FROM applications WHERE campaign_id = ? AND creator_user_id = 'creator-demo'").run(campaign.id);
    submitApplication(campaign.id, "creator-demo", "A thoughtful campaign pitch for this brand.");
    expect(() => submitApplication(campaign.id, "creator-demo", "A duplicate pitch should fail."))
      .toThrowError("You have already applied");
  });

  it("only shortlists submitted applications", () => {
    const first = db.prepare(
      "UPDATE applications SET status = 'shortlisted' WHERE creator_user_id = 'creator-demo' AND status = 'submitted'"
    ).run();
    const second = db.prepare(
      "UPDATE applications SET status = 'shortlisted' WHERE creator_user_id = 'creator-demo' AND status = 'submitted'"
    ).run();
    expect(first.changes).toBe(1);
    expect(second.changes).toBe(0);
  });

  it.each(["draft", "closed"])("rejects applications to %s campaigns", (status) => {
    db.prepare("UPDATE campaigns SET status = ?").run(status);
    expect(() => submitApplication(
      (db.prepare("SELECT id FROM campaigns LIMIT 1").get() as { id: string }).id,
      "creator-demo",
      "A pitch that should not be accepted."
    )).toThrow(ApplicationError);
  });

  it("reports a missing campaign accurately", () => {
    expect(() => submitApplication("missing", "creator-demo", "A valid but impossible pitch."))
      .toThrowError("Campaign not found");
  });
});