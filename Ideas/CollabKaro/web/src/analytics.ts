export type AnalyticsData = Record<string, string | number | boolean>;
export type ApplicationFailureType = "network" | "api_rejected";

declare global {
  interface Window {
    umami?: {
      track(name: string, data?: AnalyticsData): void;
    };
  }
}

export function trackEvent(name: string, data?: AnalyticsData): void {
  if (typeof window === "undefined") return;

  try {
    window.umami?.track(name, data);
  } catch {
    // Analytics must never interrupt the creator application flow.
  }
}

export function getApplicationFailureType(reason: unknown): ApplicationFailureType {
  return reason instanceof TypeError ? "network" : "api_rejected";
}