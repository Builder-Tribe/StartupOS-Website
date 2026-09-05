import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Campaign } from "./campaigns.js";
import type { CreatorProfile } from "./profile.js";
import { normalizeHandle } from "./profile.js";

export type Application = {
  id: string;
  campaignId: string;
  creatorName: string;
  handle: string;
  pitch: string;
  proposedRate: number;
  status: "submitted";
  createdAt: string;
};

let applicationWriteQueue = Promise.resolve();
let campaignWriteQueue = Promise.resolve();
let profileWriteQueue = Promise.resolve();

function storagePaths() {
  const dataDir = path.resolve(process.env.COLLABKARO_DATA_DIR ?? path.join(process.cwd(), "data"));
  return {
    dataDir,
    applicationsFile: path.join(dataDir, "applications.json"),
    campaignsFile: path.join(dataDir, "brand-campaigns.json"),
    profileFile: path.join(dataDir, "demo-creator-profile.json")
  };
}

export async function getCreatorProfile(): Promise<CreatorProfile | null> {
  const { profileFile } = storagePaths();
  try {
    return JSON.parse(await readFile(profileFile, "utf8")) as CreatorProfile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function saveCreatorProfile(profile: CreatorProfile): Promise<CreatorProfile> {
  const operation = profileWriteQueue.then(async () => {
    const { dataDir, profileFile } = storagePaths();
    await mkdir(dataDir, { recursive: true });
    const temporaryFile = `${profileFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(profile, null, 2));
    await import("node:fs/promises").then(({ rename }) => rename(temporaryFile, profileFile));
    return profile;
  });
  profileWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function listApplications(): Promise<Application[]> {
  const { applicationsFile } = storagePaths();
  try {
    return JSON.parse(await readFile(applicationsFile, "utf8")) as Application[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function saveApplication(application: Application) {
  const operation = applicationWriteQueue.then(async () => {
    const { dataDir, applicationsFile } = storagePaths();
    await mkdir(dataDir, { recursive: true });
    const applications = await listApplications();
    application.handle = normalizeHandle(application.handle);
    const duplicate = applications.find(
      (item) => item.campaignId === application.campaignId && normalizeHandle(item.handle) === application.handle
    );
    if (duplicate) {
      throw Object.assign(new Error("You have already applied to this campaign."), { code: "DUPLICATE_APPLICATION" });
    }
    applications.push(application);
    const temporaryFile = `${applicationsFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(applications, null, 2));
    await import("node:fs/promises").then(({ rename }) => rename(temporaryFile, applicationsFile));
    return application;
  });
  applicationWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export async function listBrandCampaigns(): Promise<Campaign[]> {
  const { campaignsFile } = storagePaths();
  try {
    return JSON.parse(await readFile(campaignsFile, "utf8")) as Campaign[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function saveBrandCampaign(campaign: Campaign): Promise<Campaign> {
  const operation = campaignWriteQueue.then(async () => {
    const { dataDir, campaignsFile } = storagePaths();
    await mkdir(dataDir, { recursive: true });
    const storedCampaigns = await listBrandCampaigns();
    storedCampaigns.push(campaign);
    const temporaryFile = `${campaignsFile}.${process.pid}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(storedCampaigns, null, 2));
    await import("node:fs/promises").then(({ rename }) => rename(temporaryFile, campaignsFile));
    return campaign;
  });
  campaignWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}