import { Star, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export interface Review {
  id: string;
  author: string;
  rating: number;
  title?: string;
  body: string;
  is_verified_purchase: boolean;
  created_at: string;
  images?: string[];
}

export interface ReviewsData {
  average: number;
  total: number;
  distribution: { stars: number; count: number }[];
  ai_summary: {
    praise_themes: string[];
    concern_themes: string[];
    size_guidance?: string;
  };
  samples: Review[];
}

interface ReviewSummaryProps {
  data: ReviewsData;
}

export function ReviewSummary({ data }: ReviewSummaryProps) {
  return (
    <div className="space-y-4">
      {/* Rating overview */}
      <div className="flex items-start gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-zinc-900">{data.average.toFixed(1)}</p>
          <StarRow rating={data.average} size={16} />
          <p className="text-xs text-zinc-400 mt-0.5">{data.total.toLocaleString("en-IN")} reviews</p>
        </div>
        <div className="flex-1 space-y-1 pt-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const entry = data.distribution.find((d) => d.stars === stars);
            const pct = entry ? Math.round((entry.count / data.total) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-3">{stars}</span>
                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-zinc-400 w-6 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={14} className="text-brand-500" />
          <p className="text-xs font-semibold text-zinc-700">AI Review Summary</p>
        </div>
        {data.ai_summary.praise_themes.length > 0 && (
          <div className="mb-1.5">
            <p className="text-xs font-medium text-emerald-700 mb-1">What people love:</p>
            <div className="flex flex-wrap gap-1">
              {data.ai_summary.praise_themes.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        )}
        {data.ai_summary.concern_themes.length > 0 && (
          <div className="mb-1.5">
            <p className="text-xs font-medium text-amber-700 mb-1">Common concerns:</p>
            <div className="flex flex-wrap gap-1">
              {data.ai_summary.concern_themes.map((t) => (
                <span key={t} className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        )}
        {data.ai_summary.size_guidance && (
          <p className="text-xs text-zinc-600 mt-1.5">
            <span className="font-medium">Sizing: </span>{data.ai_summary.size_guidance}
          </p>
        )}
      </div>

      {/* Sample reviews */}
      <div className="space-y-3">
        {data.samples.slice(0, 3).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="pb-3 border-b border-zinc-100 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <StarRow rating={review.rating} size={13} />
          {review.is_verified_purchase && (
            <span className="flex items-center gap-0.5 text-[10px] text-brand-600 font-medium">
              <ShieldCheck size={10} />Verified
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-400">{review.created_at}</span>
      </div>
      {review.title && <p className="text-sm font-semibold text-zinc-900 mb-0.5">{review.title}</p>}
      <p className="text-sm text-zinc-600 leading-relaxed">{review.body}</p>
      <p className="text-xs text-zinc-400 mt-1">{review.author}</p>
    </div>
  );
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={cn(
            s <= Math.round(rating) ? "fill-amber-400 stroke-amber-400" : "fill-zinc-200 stroke-zinc-200"
          )}
        />
      ))}
    </div>
  );
}
