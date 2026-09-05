import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApplicationFailureType, trackEvent } from "./analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("forwards events to Umami", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("campaign_viewed", { campaign_id: "campaign-1" });

    expect(track).toHaveBeenCalledWith("campaign_viewed", {
      campaign_id: "campaign-1",
    });
  });

  it("does not throw when analytics is unavailable", () => {
    expect(() => trackEvent("campaign_viewed")).not.toThrow();
  });

  it("does not throw when the analytics client fails", () => {
    window.umami = {
      track: () => {
        throw new Error("analytics unavailable");
      },
    };

    expect(() => trackEvent("pitch_submitted")).not.toThrow();
  });
});

describe("getApplicationFailureType", () => {
  it("classifies fetch failures as network failures", () => {
    expect(getApplicationFailureType(new TypeError("Failed to fetch"))).toBe("network");
  });

  it("classifies API response errors without exposing their messages", () => {
    expect(getApplicationFailureType(new Error("private server detail"))).toBe("api_rejected");
  });
});