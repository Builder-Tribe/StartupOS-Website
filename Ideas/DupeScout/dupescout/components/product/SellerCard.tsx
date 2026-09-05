import Link from "next/link";
import { Star, ShieldCheck, MapPin, Clock, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Seller } from "@/lib/types";

interface SellerCardProps {
  seller: Seller & {
    total_orders?: number;
    response_time_hours?: number;
    ships_pan_india?: boolean;
  };
}

export function SellerCard({ seller }: SellerCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-zinc-900">{seller.name}</p>
            {seller.is_verified && (
              <ShieldCheck size={15} className="text-brand-500 shrink-0" />
            )}
            {seller.type === "artisan" && (
              <Badge variant="brand">Artisan</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-zinc-500">
              <Star size={12} className="fill-amber-400 stroke-amber-400" />
              <strong className="text-zinc-700">{seller.rating.toFixed(1)}</strong> seller rating
            </span>
            {seller.total_orders !== undefined && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Package size={12} />
                {seller.total_orders.toLocaleString("en-IN")} orders
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {seller.city && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <MapPin size={12} />
                {seller.city}
                {seller.ships_pan_india && " · Ships pan-India"}
              </span>
            )}
            {seller.response_time_hours !== undefined && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Clock size={12} />
                Replies in ~{seller.response_time_hours}h
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/seller/${seller.id}`}
          className="shrink-0 text-xs font-medium text-brand-600 hover:underline"
        >
          View profile →
        </Link>
      </div>
    </div>
  );
}
