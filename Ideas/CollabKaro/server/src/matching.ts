import type { Campaign } from "./campaigns.js";
import type { CreatorProfile } from "./profile.js";

export type CampaignMatch = { match: number; matchReasons: string[] };

export function scoreCampaign(profile: CreatorProfile, campaign: Campaign): CampaignMatch {
  const reasons: string[] = [];
  let points = 0;
  if (profile.niches.some((niche) => niche.toLowerCase() === campaign.category.toLowerCase())) {
    points += 35; reasons.push("Niche aligns with campaign category");
  }
  if (profile.campaignPreferences.preferredPlatforms.includes(campaign.platform)
    || profile.socialChannels.some((channel) => channel.platform === campaign.platform)) {
    points += 25; reasons.push(`Active on ${campaign.platform}`);
  }
  if (campaign.location === "Pan India" || profile.travelAvailability
    || [profile.city, profile.state].some((place) => place.toLowerCase() === campaign.location.toLowerCase())) {
    points += 15; reasons.push(campaign.location === "Pan India" ? "Available for Pan India campaigns" : "Location or travel availability fits");
  }
  if (profile.campaignPreferences.minimumRate <= campaign.budget) {
    points += 15; reasons.push("Budget meets minimum rate");
  }
  if (profile.campaignPreferences.availability === "available") {
    points += 10; reasons.push("Currently available");
  } else if (profile.campaignPreferences.availability === "limited") {
    points += 5; reasons.push("Limited availability");
  }
  return { match: points, matchReasons: reasons };
}