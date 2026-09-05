import { afterEach, describe, expect, it, vi } from "vitest";
import { createBrandCampaign, getBrandCampaigns, getCampaigns, getCreatorApplications, getCreatorProfile, getMediaKit, saveCreatorProfile } from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("creator profile API client", () => {
  it("loads, saves, and exposes the public media kit contracts", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ profile: null }) });
    vi.stubGlobal("fetch", fetchMock);
    await getCreatorProfile();
    await saveCreatorProfile({ displayName: "Asha" });
    await getMediaKit("@asha");
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/v1/creators/me", undefined);
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/v1/creators/me", expect.objectContaining({ method: "PUT" }));
    expect(fetchMock).toHaveBeenNthCalledWith(3, "/api/v1/creators/%40asha/media-kit", undefined);
  });
  it("lists profile-scoped applications and propagates profile errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "Profile unavailable" }) }));
    await expect(getCreatorApplications()).rejects.toThrow("Profile unavailable");
  });
});

describe("campaign API client", () => {
  it("sends discovery filters to the campaign endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ campaigns: [], total: 0 })
    });
    vi.stubGlobal("fetch", fetchMock);

    await getCampaigns({ search: "coffee", category: "Food", platform: "Instagram" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/campaigns?search=coffee&category=Food&platform=Instagram",
      undefined
    );
  });

  it("lists the current demo brand's campaigns", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ campaigns: [], total: 0 })
    });
    vi.stubGlobal("fetch", fetchMock);

    await getBrandCampaigns();

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/brand/campaigns", undefined);
  });

  it("creates a campaign with the complete brief", async () => {
    const brief = {
      title: "Launch story",
      objective: "Drive awareness",
      category: "Beauty",
      platform: "Instagram",
      location: "Pan India",
      budget: 25000,
      deadline: "2026-10-01",
      description: "Show a simple everyday routine.",
      deliverables: ["One reel"],
      requirements: ["Beauty creators"]
    };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ id: "brand-1", ...brief }) });
    vi.stubGlobal("fetch", fetchMock);

    await createBrandCampaign(brief);

    expect(fetchMock).toHaveBeenCalledWith("/api/v1/brand/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief)
    });
  });

  it("propagates useful brand API errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Budget must be a positive number." })
    }));

    await expect(getBrandCampaigns()).rejects.toThrow("Budget must be a positive number.");
  });
});