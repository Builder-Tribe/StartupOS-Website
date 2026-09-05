import { randomUUID } from "node:crypto";
import { db } from "./db.js";

export class ApplicationError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

export function submitApplication(campaignId: string, creatorId: string, pitch: string) {
  const campaign = db.prepare("SELECT status FROM campaigns WHERE id = ?").get(campaignId) as
    | { status: string }
    | undefined;
  if (!campaign) throw new ApplicationError(404, "Campaign not found.");
  if (campaign.status !== "published") {
    throw new ApplicationError(409, "This campaign is not accepting applications.");
  }
  const existing = db
    .prepare("SELECT id FROM applications WHERE campaign_id = ? AND creator_user_id = ?")
    .get(campaignId, creatorId);
  if (existing) throw new ApplicationError(409, "You have already applied to this campaign.");

  const id = randomUUID();
  db.prepare("INSERT INTO applications VALUES (?, ?, ?, ?, 'submitted', CURRENT_TIMESTAMP)")
    .run(id, campaignId, creatorId, pitch);
  return { id, status: "submitted" as const };
}