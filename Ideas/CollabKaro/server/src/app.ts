import express from "express";
import { randomUUID } from "node:crypto";
import { campaigns } from "./campaigns.js";
import type { Campaign } from "./campaigns.js";
import { getCreatorProfile, listApplications, listBrandCampaigns, saveApplication, saveBrandCampaign, saveCreatorProfile } from "./store.js";
import { completionPercentage, editableProfileFields, normalizeHandle, publicProfile, validateProfile, type CreatorProfile, type ProfileInput } from "./profile.js";
import { scoreCampaign } from "./matching.js";

export const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/healthz", (_request, response) => response.json({ status: "ok" }));

const DEMO_BRAND = { name: "CollabKaro Studio", initials: "CS" };

function isExpiredBrandCampaign(campaign: Campaign) {
  const today = new Date().toISOString().slice(0, 10);
  return campaign.deadline <= today;
}

async function brandCampaignsWithApplicantCounts() {
  const [brandCampaigns, applications] = await Promise.all([listBrandCampaigns(), listApplications()]);
  const counts = new Map<string, number>();
  for (const application of applications) {
    counts.set(application.campaignId, (counts.get(application.campaignId) ?? 0) + 1);
  }
  return brandCampaigns.map((campaign) => ({ ...campaign, applicants: counts.get(campaign.id) ?? 0 }));
}

async function allCampaigns(includeExpiredBrandCampaigns = false) {
  const brandCampaigns = await brandCampaignsWithApplicantCounts();
  return [...campaigns, ...brandCampaigns.filter((campaign) => includeExpiredBrandCampaigns || !isExpiredBrandCampaign(campaign))];
}

async function campaignsForDemoCreator(includeExpiredBrandCampaigns = false) {
  const [all, profile] = await Promise.all([allCampaigns(includeExpiredBrandCampaigns), getCreatorProfile()]);
  if (!profile?.completed) return all;
  return all.map((campaign) => ({ ...campaign, ...scoreCampaign(profile, campaign) }));
}

function campaignValidationError(input: unknown): string | null {
  if (!input || typeof input !== "object") return "Send a campaign brief.";
  const body = input as Record<string, unknown>;
  const requiredTextFields = ["title", "category", "platform", "location", "description"];
  if (requiredTextFields.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
    return "Complete the title, category, platform, location, and description.";
  }
  if (!Number.isFinite(body.budget) || Number(body.budget) <= 0) return "Budget must be a positive number.";
  const deadline = typeof body.deadline === "string" ? body.deadline.trim() : "";
  const deadlineDate = /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? new Date(`${deadline}T00:00:00.000Z`) : null;
  if (!deadlineDate || Number.isNaN(deadlineDate.getTime())
    || deadlineDate.toISOString().slice(0, 10) !== deadline) {
    return "Enter a valid deadline.";
  }
  if (deadline <= new Date().toISOString().slice(0, 10)) return "Deadline must be in the future.";
  for (const field of ["deliverables", "requirements"]) {
    if (!Array.isArray(body[field]) || body[field].length === 0
      || body[field].some((value) => typeof value !== "string" || !value.trim())) {
      return `${field === "deliverables" ? "Deliverables" : "Creator requirements"} must include at least one item.`;
    }
  }
  if (body.objective !== undefined && (typeof body.objective !== "string" || !body.objective.trim())) {
    return "Objective must be text when provided.";
  }
  return null;
}

app.get("/api/v1/campaigns", async (request, response, next) => {
  try {
  const search = String(request.query.search ?? "").trim().toLowerCase();
  const category = String(request.query.category ?? "").trim();
  const platform = String(request.query.platform ?? "").trim();
   const filtered = (await campaignsForDemoCreator()).filter((campaign) => {
    const matchesSearch = !search || [campaign.title, campaign.brand, campaign.category, campaign.location]
      .some((value) => value.toLowerCase().includes(search));
    return matchesSearch
      && (!category || category === "All" || campaign.category === category)
      && (!platform || platform === "All" || campaign.platform === platform);
  });
  response.json({ campaigns: filtered, total: filtered.length });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/campaigns/:id", async (request, response, next) => {
  try {
    const campaign = (await campaignsForDemoCreator()).find(({ id }) => id === request.params.id);
    if (!campaign) return response.status(404).json({ message: "Campaign not found" });
    response.json(campaign);
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/creators/me", async (_request, response, next) => {
  try {
    response.json({ profile: await getCreatorProfile() });
  } catch (error) {
    next(error);
  }
});

app.put("/api/v1/creators/me", async (request, response, next) => {
  try {
    const finalSubmit = request.body?.submit === true || request.body?.mode === "submit";
    const input = request.body?.profile ?? request.body;
    const existing = await getCreatorProfile();
    const now = new Date().toISOString();
    const merged: ProfileInput = { ...editableProfileFields(existing), ...editableProfileFields(input) };
    const validation = validateProfile(merged, finalSubmit);
    if (!validation.value) return response.status(400).json({ message: validation.message });
    const percentage = completionPercentage(validation.value);
    const profile: CreatorProfile = {
      id: "demo-creator",
      displayName: "",
      handle: "",
      bio: "",
      city: "",
      state: "",
      travelAvailability: false,
      languages: [],
      niches: [],
      contentFormats: [],
      socialChannels: [],
      audienceDemographics: "",
      topCities: [],
      interests: [],
      services: [],
      portfolioLinks: [],
      campaignPreferences: { preferredPlatforms: [], minimumRate: 0, acceptsBarter: false, availability: "available" },
      verificationStatus: "unverified",
      createdAt: existing?.createdAt ?? now,
      ...validation.value,
      completed: existing?.completed || finalSubmit,
      completionPercentage: existing?.completed || finalSubmit ? 100 : percentage,
      updatedAt: now
    };
    response.json({ profile: await saveCreatorProfile(profile) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/creators/me/applications", async (_request, response, next) => {
  try {
    const profile = await getCreatorProfile();
    if (!profile?.handle) return response.json({ applications: [], total: 0 });
    const campaignById = new Map((await allCampaigns(true)).map((campaign) => [campaign.id, campaign]));
    const applications = (await listApplications())
      .filter((application) => normalizeHandle(application.handle) === normalizeHandle(profile.handle))
      .map((application) => {
        const campaign = campaignById.get(application.campaignId);
        return { ...application, campaign: campaign ? { id: campaign.id, title: campaign.title, brand: campaign.brand } : null };
      });
    response.json({ applications, total: applications.length });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/creators/:handle/media-kit", async (request, response, next) => {
  try {
    const profile = await getCreatorProfile();
    const handle = `@${request.params.handle.replace(/^@+/, "").toLowerCase()}`;
    if (!profile?.completed || profile.handle.toLowerCase() !== handle) return response.status(404).json({ message: "Creator media kit not found" });
    response.json({ profile: publicProfile(profile) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/v1/brand/campaigns", async (_request, response, next) => {
  try {
    const brandCampaigns = await brandCampaignsWithApplicantCounts();
    response.json({ campaigns: brandCampaigns, total: brandCampaigns.length });
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/brand/campaigns", async (request, response, next) => {
  try {
    const validationMessage = campaignValidationError(request.body);
    if (validationMessage) return response.status(400).json({ message: validationMessage });
    const body = request.body as Record<string, unknown>;
    const campaign: Campaign = {
      id: `brand-${randomUUID()}`,
      brand: DEMO_BRAND.name,
      brandInitials: DEMO_BRAND.initials,
      title: (body.title as string).trim(),
      category: (body.category as string).trim(),
      platform: (body.platform as string).trim(),
      location: (body.location as string).trim(),
      budget: Number(body.budget),
      applicants: 0,
      deadline: (body.deadline as string).trim(),
      match: 0,
      description: (body.description as string).trim(),
      ...(body.objective ? { objective: (body.objective as string).trim() } : {}),
      deliverables: (body.deliverables as string[]).map((item) => item.trim()),
      requirements: (body.requirements as string[]).map((item) => item.trim())
    };
    response.status(201).json(await saveBrandCampaign(campaign));
  } catch (error) {
    next(error);
  }
});

app.post("/api/v1/applications", async (request, response, next) => {
  try {
    let { campaignId, creatorName, handle, pitch, proposedRate } = request.body ?? {};
    const profile = await getCreatorProfile();
    if (profile?.completed) {
      creatorName = profile.displayName;
      handle = profile.handle;
      proposedRate = Number.isFinite(proposedRate) ? proposedRate : profile.services[0]?.rate ?? profile.campaignPreferences.minimumRate;
    }
    if (![campaignId, creatorName, handle, pitch].every((value) => typeof value === "string" && value.trim())
      || !Number.isFinite(proposedRate) || proposedRate < 1000) {
      return response.status(400).json({ message: "Complete every field and enter a valid rate." });
    }
    const campaign = (await allCampaigns(true)).find(({ id }) => id === campaignId);
    if (!campaign) {
      return response.status(404).json({ message: "Campaign not found" });
    }
    if (campaign.id.startsWith("brand-") && isExpiredBrandCampaign(campaign)) {
      return response.status(400).json({ message: "This campaign has expired and is no longer accepting applications." });
    }
    const application = await saveApplication({
      id: randomUUID(),
      campaignId,
      creatorName: creatorName.trim(),
      handle: handle.trim(),
      pitch: pitch.trim(),
      proposedRate,
      status: "submitted",
      createdAt: new Date().toISOString()
    });
    response.status(201).json(application);
  } catch (error) {
    if ((error as { code?: string }).code === "DUPLICATE_APPLICATION") {
      return response.status(409).json({ message: (error as Error).message });
    }
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: "Something went wrong. Please try again." });
});