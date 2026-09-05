import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AIExplanation } from "@/lib/types";

const VERDICT_STYLES: Record<AIExplanation["verdict"], { bg: string; border: string; icon: string }> = {
  excellent_value: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600" },
  good_match:      { bg: "bg-blue-50",    border: "border-blue-200",    icon: "text-blue-600"    },
  decent_alternative: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600"   },
  notable_differences: { bg: "bg-zinc-50", border: "border-zinc-200",  icon: "text-zinc-600"    },
};

interface AIExplanationCardProps {
  explanation: AIExplanation;
  className?: string;
  compact?: boolean;
}

export function AIExplanationCard({ explanation, className, compact = false }: AIExplanationCardProps) {
  const style = VERDICT_STYLES[explanation.verdict];

  return (
    <div className={cn("rounded-xl border p-3", style.bg, style.border, className)}>
      <div className="flex items-start gap-2">
        <Sparkles size={15} className={cn("mt-0.5 shrink-0", style.icon)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-900">{explanation.headline}</p>

          {!compact && (
            <>
              {explanation.what_matches.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {explanation.what_matches.map((point) => (
                    <li key={point} className="flex items-start gap-1.5 text-xs text-zinc-600">
                      <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              {explanation.what_differs.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {explanation.what_differs.map((point) => (
                    <li key={point} className="flex items-start gap-1.5 text-xs text-zinc-600">
                      <AlertCircle size={12} className="mt-0.5 shrink-0 text-amber-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <p className={cn("text-xs font-medium mt-2", style.icon)}>
            AI: &ldquo;{explanation.ai_recommendation}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
