export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

export type Campaign = {
  id: string;
  brand: string;
  brandInitials: string;
  title: string;
  category: string;
  platform: string;
  location: string;
  budget: number;
  applicants: number;
  deadline: string;
  match: number;
  featured?: boolean;
  description: string;
  objective?: string;
  deliverables: string[];
  requirements: string[];
  matchReasons?: string[];
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Request failed");
  return body as T;
}

export async function getCampaigns(filters: { search: string; category: string; platform: string }) {
  const query = new URLSearchParams(filters);
  return request<{ campaigns: Campaign[]; total: number }>(`/api/v1/campaigns?${query}`);
}

export function getCampaign(id: string) {
  return request<Campaign>(`/api/v1/campaigns/${id}`);
}

export type BrandCampaignInput = {
  title: string;
  objective?: string;
  category: string;
  platform: string;
  location: string;
  budget: number;
  deadline: string;
  description: string;
  deliverables: string[];
  requirements: string[];
};

export function getBrandCampaigns() {
  return request<{ campaigns: Campaign[]; total: number }>("/api/v1/brand/campaigns");
}

export function createBrandCampaign(input: BrandCampaignInput) {
  return request<Campaign>("/api/v1/brand/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}

export function createApplication(input: ApplicationInput) {
  return request<{ id: string; status: string }>("/api/v1/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
}

export type ApplicationInput = {
  campaignId: string;
  creatorName?: string;
  handle?: string;
  pitch: string;
  proposedRate?: number;
};

export type SocialChannel = { platform: string; handle: string; url: string; followers: number; avgViews: number; engagementRate: number; verificationStatus: "self-reported" | "pending" };
export type CreatorProfile = {
  id: string; displayName: string; handle: string; bio: string; city: string; state: string; travelAvailability: boolean;
  languages: string[]; niches: string[]; contentFormats: string[]; socialChannels: SocialChannel[];
  audienceDemographics: string; topCities: string[]; interests: string[];
  services: Array<{ service: string; rate: number }>; portfolioLinks: string[];
  campaignPreferences: { preferredPlatforms: string[]; minimumRate: number; acceptsBarter: boolean; availability: "available" | "limited" | "unavailable" };
  verificationStatus: "unverified" | "pending" | "verified"; completed: boolean; completionPercentage: number; createdAt: string; updatedAt: string;
};
export type CreatorProfileInput = Partial<Omit<CreatorProfile, "id" | "createdAt" | "updatedAt" | "completed" | "completionPercentage" | "verificationStatus">>;
export type CreatorApplication = { id: string; campaignId: string; creatorName: string; handle: string; pitch: string; proposedRate: number; status: string; createdAt: string; campaign: { id: string; title: string; brand: string } | null };
export function getCreatorProfile() { return request<{ profile: CreatorProfile | null }>("/api/v1/creators/me"); }
export function saveCreatorProfile(profile: CreatorProfileInput, submit = false) {
  return request<{ profile: CreatorProfile }>("/api/v1/creators/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, ...(submit ? { submit: true } : {}) }) });
}
export function getCreatorApplications() { return request<{ applications: CreatorApplication[]; total: number }>("/api/v1/creators/me/applications"); }
export function getMediaKit(handle: string) { return request<{ profile: Omit<CreatorProfile, "campaignPreferences" | "verificationStatus" | "completed"> }>(`/api/v1/creators/${encodeURIComponent(handle)}/media-kit`); }
