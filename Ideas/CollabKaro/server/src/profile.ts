export const PLATFORM_VALUES = ["Instagram", "YouTube", "TikTok", "Facebook", "LinkedIn", "Other"] as const;
export const AVAILABILITY_VALUES = ["available", "limited", "unavailable"] as const;

export type SocialChannel = {
  platform: (typeof PLATFORM_VALUES)[number];
  handle: string;
  url: string;
  followers: number;
  avgViews: number;
  engagementRate: number;
  verificationStatus: "self-reported" | "pending";
};

export type RateCard = { service: string; rate: number };

export type CreatorProfile = {
  id: "demo-creator";
  displayName: string;
  handle: string;
  bio: string;
  city: string;
  state: string;
  travelAvailability: boolean;
  languages: string[];
  niches: string[];
  contentFormats: string[];
  socialChannels: SocialChannel[];
  audienceDemographics: string;
  topCities: string[];
  interests: string[];
  services: RateCard[];
  portfolioLinks: string[];
  campaignPreferences: {
    preferredPlatforms: string[];
    minimumRate: number;
    acceptsBarter: boolean;
    availability: (typeof AVAILABILITY_VALUES)[number];
  };
  verificationStatus: "unverified" | "pending" | "verified";
  completed: boolean;
  completionPercentage: number;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = Partial<Omit<CreatorProfile, "id" | "createdAt" | "updatedAt" | "completed" | "completionPercentage" | "verificationStatus">>;
const editableKeys = ["displayName", "handle", "bio", "city", "state", "travelAvailability", "languages", "niches", "contentFormats", "socialChannels", "audienceDemographics", "topCities", "interests", "services", "portfolioLinks", "campaignPreferences"] as const;

export function editableProfileFields(input: unknown): ProfileInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const source = input as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const key of editableKeys) if (key in source) output[key] = source[key];
  return output as ProfileInput;
}

const MAX_TEXT = 500;
const isText = (value: unknown, max = MAX_TEXT) => typeof value === "string" && value.trim().length <= max;
const urlIsSafe = (value: string) => /^https?:\/\/[^\s]+$/i.test(value);

export function normalizeHandle(value: string) {
  return `@${value.trim().replace(/^@+/, "").toLowerCase()}`;
}

export function completionPercentage(profile: ProfileInput) {
  const checks = [
    profile.displayName, profile.handle, profile.bio, profile.city, profile.state,
    profile.languages?.length, profile.niches?.length, profile.contentFormats?.length,
    profile.socialChannels?.length, profile.services?.length, profile.portfolioLinks?.length,
    profile.campaignPreferences?.preferredPlatforms?.length
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function validateProfile(input: unknown, finalSubmit = false): { value?: ProfileInput; message?: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { message: "Send profile fields as an object." };
  const value = editableProfileFields(input);
  const textFields = ["displayName", "bio", "city", "state", "audienceDemographics"] as const;
  for (const field of textFields) {
    if (value[field] !== undefined && (!isText(value[field]) || (value[field] as string).trim().length === 0)) {
      return { message: `${field} must be non-empty text under ${MAX_TEXT} characters.` };
    }
  }
  if (value.handle !== undefined) {
    if (typeof value.handle !== "string" || !/^[a-z0-9._]{3,30}$/i.test(value.handle.trim().replace(/^@+/, ""))) {
      return { message: "Handle must be 3–30 letters, numbers, dots, or underscores." };
    }
    value.handle = normalizeHandle(value.handle);
  }
  for (const field of ["languages", "niches", "contentFormats", "topCities", "interests", "portfolioLinks"] as const) {
    const entries = value[field];
    if (entries !== undefined && (!Array.isArray(entries) || entries.length > 20 || entries.some((item) => !isText(item, 100) || !item.trim()))) {
      return { message: `${field} must be a list of up to 20 short entries.` };
    }
    if (field === "portfolioLinks" && entries?.some((item) => !urlIsSafe(item))) return { message: "Portfolio links must use http or https." };
  }
  if (value.travelAvailability !== undefined && typeof value.travelAvailability !== "boolean") return { message: "Travel availability must be true or false." };
  if (value.socialChannels !== undefined) {
    if (!Array.isArray(value.socialChannels) || value.socialChannels.length > 10) return { message: "Add up to 10 social channels." };
    for (const channel of value.socialChannels) {
      if (!channel || !PLATFORM_VALUES.includes(channel.platform) || !isText(channel.handle, 100) || !urlIsSafe(channel.url)
        || ![channel.followers, channel.avgViews].every((metric) => Number.isFinite(metric) && metric >= 0)
        || !Number.isFinite(channel.engagementRate) || channel.engagementRate < 0 || channel.engagementRate > 100) {
        return { message: "Each channel needs a valid platform, handle, http(s) URL, and nonnegative metrics (engagement 0–100)." };
      }
      channel.verificationStatus = channel.verificationStatus === "pending" ? "pending" : "self-reported";
    }
  }
  if (value.services !== undefined && (!Array.isArray(value.services) || value.services.length > 20
    || value.services.some((service) => !service || !isText(service.service, 100) || !Number.isFinite(service.rate) || service.rate <= 0))) {
    return { message: "Services need a name and a positive rate." };
  }
  if (value.campaignPreferences !== undefined) {
    const preferences = value.campaignPreferences;
    if (!preferences || !Array.isArray(preferences.preferredPlatforms) || preferences.preferredPlatforms.some((item) => !PLATFORM_VALUES.includes(item as typeof PLATFORM_VALUES[number]))
      || !Number.isFinite(preferences.minimumRate) || preferences.minimumRate < 0 || typeof preferences.acceptsBarter !== "boolean"
      || !AVAILABILITY_VALUES.includes(preferences.availability)) return { message: "Campaign preferences contain an invalid value." };
  }
  if (finalSubmit) {
    const required: Array<keyof ProfileInput> = ["displayName", "handle", "bio", "city", "state", "languages", "niches", "contentFormats", "socialChannels", "services", "campaignPreferences"];
    if (required.some((field) => !value[field] || (Array.isArray(value[field]) && !value[field].length))) {
      return { message: "Complete identity, creative focus, channels, services, and campaign preferences before submitting." };
    }
  }
  return { value };
}

export function publicProfile(profile: CreatorProfile) {
  return {
    id: profile.id,
    displayName: profile.displayName,
    handle: profile.handle,
    bio: profile.bio,
    city: profile.city,
    state: profile.state,
    travelAvailability: profile.travelAvailability,
    languages: profile.languages,
    niches: profile.niches,
    contentFormats: profile.contentFormats,
    socialChannels: profile.socialChannels,
    audienceDemographics: profile.audienceDemographics,
    topCities: profile.topCities,
    interests: profile.interests,
    services: profile.services,
    portfolioLinks: profile.portfolioLinks,
    completionPercentage: profile.completionPercentage,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}