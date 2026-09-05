"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import type { SimilarityBreakdown } from "@/lib/types";

interface SimilarityScoreProps {
  score: number;
  breakdown?: SimilarityBreakdown;
  showBreakdown?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
  return "text-amber-600 bg-amber-50 border-amber-200";
}

function scoreDotColor(score: number): string {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-blue-500";
  return "bg-amber-500";
}

function scoreLabel(score: number): string {
  if (score >= 95) return "Near identical";
  if (score >= 90) return "Excellent match";
  if (score >= 80) return "Great match";
  if (score >= 70) return "Good match";
  return "Similar";
}

export function SimilarityScore({ score, breakdown, showBreakdown = false, size = "md", className }: SimilarityScoreProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("inline-block", className)}>
      <button
        type="button"
        onClick={() => breakdown && setExpanded((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all",
          size === "sm" && "px-2 py-0.5 text-xs",
          size === "md" && "px-2.5 py-1 text-sm",
          size === "lg" && "px-3 py-1.5 text-base",
          scoreColor(score),
          breakdown && "cursor-pointer hover:opacity-80"
        )}
        aria-label={`${score}% similar — tap to see breakdown`}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", scoreDotColor(score))} />
        {score}% similar
      </button>

      {/* Breakdown popover */}
      {expanded && breakdown && (
        <div className="mt-2 p-3 bg-white border border-zinc-200 rounded-xl shadow-lg text-sm animate-slide-up w-56">
          <p className="font-semibold text-zinc-800 mb-2">{scoreLabel(score)}</p>
          <div className="space-y-1.5">
            {(["shape", "color", "material", "style"] as const).map((key) => (
              <BreakdownRow key={key} label={key} value={breakdown[key]} />
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">Tap score to close</p>
        </div>
      )}
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="capitalize w-16 text-zinc-500 text-xs">{label}</span>
      <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", scoreDotColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn("text-xs font-semibold w-8 text-right", value >= 90 ? "text-emerald-600" : value >= 75 ? "text-blue-600" : "text-amber-600")}>
        {value}%
      </span>
    </div>
  );
}
