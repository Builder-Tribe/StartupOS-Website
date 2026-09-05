import assert from "node:assert/strict";
import test, { after } from "node:test";
import { rm } from "node:fs/promises";
import path from "node:path";
import { app } from "./app.js";
import { listApplications, saveApplication, saveBrandCampaign } from "./store.js";

const testDataDir = path.join(process.cwd(), ".tmp-test-data", `app-${process.pid}`);
process.env.COLLABKARO_DATA_DIR = testDataDir;

after(async () => {
  await rm(testDataDir, { recursive: true, force: true });
});

const campaignBrief = {
  title: "A polished product launch",
  objective: "Build awareness",
  category: "Beauty",
  platform: "Instagram",
  location: "Pan India",
  budget: 24000,
  deadline: "2026-10-01",
  description: "Show how the product fits into a real routine.",
  deliverables: ["1 Instagram Reel"],
  requirements: ["Beauty creators"]
};

const completedProfile = {
  displayName: "Asha Kapoor",
  handle: "AshaCreates",
  bio: "Beauty and city-life creator sharing useful routines.",
  city: "Delhi NCR",
  state: "Delhi",
  travelAvailability: true,
  languages: ["Hindi", "English"],
  niches: ["Beauty", "Lifestyle"],
  contentFormats: ["Reels"],
  socialChannels: [{
    platform: "Instagram",
    handle: "@ashacreates",
    url: "https://instagram.com/ashacreates",
    followers: 24000,
    avgViews: 12000,
    engagementRate: 4.5,
    verificationStatus: "verified"
  }],
  audienceDemographics: "Women aged 18–34 in Indian metros.",
  topCities: ["Delhi"],
  interests: ["Skincare"],
  services: [{ service: "Instagram Reel", rate: 15000 }],
  portfolioLinks: ["https://example.com/portfolio"],
  campaignPreferences: {
    preferredPlatforms: ["Instagram"],
    minimumRate: 12000,
    acceptsBarter: false,
    availability: "available"
  }
};

async function withServer(callback: (baseUrl: string) => Promise<void>) {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert(address && typeof address === "object");
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
  }
}

test("health endpoint reports ok", async () => {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${address.port}/healthz`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
  server.close();
});

test("campaign list can be filtered", async () => {
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${address.port}/api/v1/campaigns?category=Beauty`);
  const body = await response.json() as { total: number };
  assert.equal(body.total, 1);
  server.close();
});

test("concurrent application writes do not lose accepted submissions", async () => {
  const suffix = Date.now().toString();
  await Promise.all([
    saveApplication({
      id: `concurrent-a-${suffix}`,
      campaignId: "earthkind-summer",
      creatorName: "Concurrent A",
      handle: `@concurrent-a-${suffix}`,
      pitch: "First concurrent test pitch.",
      proposedRate: 12000,
      status: "submitted",
      createdAt: new Date().toISOString()
    }),
    saveApplication({
      id: `concurrent-b-${suffix}`,
      campaignId: "earthkind-summer",
      creatorName: "Concurrent B",
      handle: `@concurrent-b-${suffix}`,
      pitch: "Second concurrent test pitch.",
      proposedRate: 13000,
      status: "submitted",
      createdAt: new Date().toISOString()
    })
  ]);
  const applications = await listApplications();
  assert(applications.some(({ id }) => id === `concurrent-a-${suffix}`));
  assert(applications.some(({ id }) => id === `concurrent-b-${suffix}`));
});

test("brand campaign creation validates required brief fields", async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/v1/brand/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...campaignBrief, budget: 0, deliverables: [] })
    });
    assert.equal(response.status, 400);
    assert.match((await response.json() as { message: string }).message, /budget/i);
  });
});

test("published brand briefs list for their brand and public discovery", async () => {
  await withServer(async (baseUrl) => {
    const create = await fetch(`${baseUrl}/api/v1/brand/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaignBrief)
    });
    assert.equal(create.status, 201);
    const created = await create.json() as { id: string; brand: string };
    assert.equal(created.brand, "CollabKaro Studio");

    const brandList = await fetch(`${baseUrl}/api/v1/brand/campaigns`);
    const brandBody = await brandList.json() as { campaigns: Array<{ id: string }> };
    assert(brandBody.campaigns.some((campaign) => campaign.id === created.id));

    const publicList = await fetch(`${baseUrl}/api/v1/campaigns`);
    const publicBody = await publicList.json() as { campaigns: Array<{ id: string }> };
    assert(publicBody.campaigns.some((campaign) => campaign.id === created.id));
  });
});

test("creators can apply to a newly published brand brief", async () => {
  await withServer(async (baseUrl) => {
    const create = await fetch(`${baseUrl}/api/v1/brand/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...campaignBrief, title: "A second launch brief" })
    });
    const created = await create.json() as { id: string };
    const application = await fetch(`${baseUrl}/api/v1/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: created.id,
        creatorName: "Asha Kapoor",
        handle: "@asha",
        pitch: "I create useful, honest beauty content.",
        proposedRate: 12000
      })
    });
    assert.equal(application.status, 201);

    const brandList = await fetch(`${baseUrl}/api/v1/brand/campaigns`);
    const brandBody = await brandList.json() as { campaigns: Array<{ id: string; applicants: number }> };
    assert.equal(brandBody.campaigns.find((campaign) => campaign.id === created.id)?.applicants, 1);

    const publicList = await fetch(`${baseUrl}/api/v1/campaigns`);
    const publicBody = await publicList.json() as { campaigns: Array<{ id: string; applicants: number }> };
    assert.equal(publicBody.campaigns.find((campaign) => campaign.id === created.id)?.applicants, 1);
  });
});

test("expired brand campaigns cannot be published, discovered, or applied to", async () => {
  await withServer(async (baseUrl) => {
    const expiredPublish = await fetch(`${baseUrl}/api/v1/brand/campaigns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...campaignBrief, deadline: "2000-01-01" })
    });
    assert.equal(expiredPublish.status, 400);
    assert.match((await expiredPublish.json() as { message: string }).message, /future/i);

    await saveBrandCampaign({
      id: "brand-expired-test",
      brand: "CollabKaro Studio",
      brandInitials: "CS",
      title: "Expired test campaign",
      category: "Beauty",
      platform: "Instagram",
      location: "Pan India",
      budget: 10000,
      applicants: 0,
      deadline: "2000-01-01",
      match: 0,
      description: "This should not be public.",
      deliverables: ["One post"],
      requirements: ["Beauty creators"]
    });
    const publicDetail = await fetch(`${baseUrl}/api/v1/campaigns/brand-expired-test`);
    assert.equal(publicDetail.status, 404);
    const application = await fetch(`${baseUrl}/api/v1/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: "brand-expired-test", creatorName: "Asha", handle: "@asha-expired", pitch: "A thoughtful pitch", proposedRate: 10000 })
    });
    assert.equal(application.status, 400);
    assert.match((await application.json() as { message: string }).message, /expired/i);
  });
});

test("creator profiles save drafts, validate final submissions, and normalize channel status", async () => {
  await withServer(async (baseUrl) => {
    const draft = await fetch(`${baseUrl}/api/v1/creators/me`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: { displayName: "Asha", handle: "@ASHA" } })
    });
    assert.equal(draft.status, 200);
    assert.equal((await draft.json() as { profile: { completed: boolean; handle: string } }).profile.completed, false);

    const incomplete = await fetch(`${baseUrl}/api/v1/creators/me`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submit: true, profile: { bio: "Short bio" } })
    });
    assert.equal(incomplete.status, 400);

    const submitted = await fetch(`${baseUrl}/api/v1/creators/me`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submit: true, profile: completedProfile })
    });
    assert.equal(submitted.status, 200);
    const profile = (await submitted.json() as { profile: { completed: boolean; socialChannels: Array<{ verificationStatus: string }> } }).profile;
    assert.equal(profile.completed, true);
    assert.equal(profile.socialChannels[0].verificationStatus, "self-reported");
  });
});

test("public media kits omit preferences and applications are scoped to profile handle", async () => {
  await withServer(async (baseUrl) => {
    const kit = await fetch(`${baseUrl}/api/v1/creators/@ashacreates/media-kit`);
    assert.equal(kit.status, 200);
    const kitProfile = (await kit.json() as { profile: Record<string, unknown> }).profile;
    assert.equal("campaignPreferences" in kitProfile, false);

    const created = await fetch(`${baseUrl}/api/v1/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: "earthkind-summer", pitch: "I make honest skincare routines." })
    });
    assert.equal(created.status, 201);
    const history = await fetch(`${baseUrl}/api/v1/creators/me/applications`);
    const body = await history.json() as { total: number; applications: Array<{ campaign: { title: string } }> };
    assert(body.total >= 1);
    assert.equal(body.applications[0].campaign.title, "Summer Skin, Naturally");
  });
});

test("completed creator profiles receive deterministic campaign match reasons", async () => {
  await withServer(async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/v1/campaigns/earthkind-summer`);
    const second = await fetch(`${baseUrl}/api/v1/campaigns/earthkind-summer`);
    const a = await first.json() as { match: number; matchReasons: string[] };
    const b = await second.json() as { match: number; matchReasons: string[] };
    assert.deepEqual(a, b);
    assert(a.matchReasons.includes("Niche aligns with campaign category"));
  });
});

test("profile persistence ignores server-owned and arbitrary injected fields and public kits stay allowlisted", async () => {
  await withServer(async (baseUrl) => {
    const update = await fetch(`${baseUrl}/api/v1/creators/me`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: { displayName: "Asha Updated", id: "attacker", userId: "attacker", verificationStatus: "verified", completed: false, completionPercentage: 1, createdAt: "2000-01-01", updatedAt: "2000-01-01", privateNote: "do not store" } })
    });
    assert.equal(update.status, 200);
    const stored = (await update.json() as { profile: Record<string, unknown> }).profile;
    assert.equal(stored.id, "demo-creator");
    assert.equal(stored.verificationStatus, "unverified");
    assert.equal(stored.completed, true);
    assert.equal("privateNote" in stored, false);
    const kit = await fetch(`${baseUrl}/api/v1/creators/@ashacreates/media-kit`);
    const publicRecord = (await kit.json() as { profile: Record<string, unknown> }).profile;
    for (const key of ["campaignPreferences", "verificationStatus", "completed", "privateNote", "userId"]) assert.equal(key in publicRecord, false);
  });
});

test("completed profile identity cannot be spoofed in applications and normalized handles prevent duplicates", async () => {
  await withServer(async (baseUrl) => {
    const applied = await fetch(`${baseUrl}/api/v1/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: "brew-district-cold-coffee", creatorName: "Spoofed Name", handle: "@SPOOF", pitch: "A city coffee story.", proposedRate: 14000 })
    });
    assert.equal(applied.status, 201);
    const application = await applied.json() as { creatorName: string; handle: string };
    assert.equal(application.creatorName, "Asha Updated");
    assert.equal(application.handle, "@ashacreates");
    const duplicate = await fetch(`${baseUrl}/api/v1/applications`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId: "brew-district-cold-coffee", creatorName: "Anything", handle: "ASHACREATES", pitch: "Again", proposedRate: 14000 })
    });
    assert.equal(duplicate.status, 409);
    const history = await fetch(`${baseUrl}/api/v1/creators/me/applications`);
    assert((await history.json() as { applications: Array<{ handle: string }> }).applications.some((item) => item.handle === "@ashacreates"));
  });
});