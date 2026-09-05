import type { Metadata } from "next";
import { SearchBar } from "@/components/search/SearchBar";
import { ProductCard } from "@/components/search/ProductCard";
import { MOCK_TREND_CARDS, MOCK_RECOMMENDATIONS } from "@/lib/mock-data";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, MapPin, Sparkles, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "DupeScout — Shop the Look. Not the Markup.",
};

const CATEGORIES = [
  { label: "Sarees",      emoji: "🥻", href: "/search?q=saree"    },
  { label: "Kurtas",      emoji: "👗", href: "/search?q=kurta"    },
  { label: "Jewellery",   emoji: "💍", href: "/search?q=jewellery" },
  { label: "Bags",        emoji: "👜", href: "/search?q=bags"     },
  { label: "Footwear",    emoji: "👠", href: "/search?q=footwear"  },
  { label: "Home Decor",  emoji: "🏮", href: "/search?q=home+decor" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-zinc-50 to-white border-b border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-5">
            <Sparkles size={13} />
            AI-powered visual search for India
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-4">
            Shop the Look.<br className="hidden sm:block" />
            <span className="text-brand-500"> Not the Markup.</span>
          </h1>
          <p className="text-zinc-500 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Upload any photo, paste a product link, or describe anything — find it from Indian artisans and brands at the right price.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBar size="large" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* ── Quick category pills ─────────────────────────────────────────────── */}
        <section className="py-8 border-b border-zinc-100">
          <div className="flex items-center gap-3 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-sm font-medium text-zinc-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all"
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Trending Today ───────────────────────────────────────────────────── */}
        <section className="py-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-500" />
              <h2 className="text-lg font-bold text-zinc-900">Trending Today</h2>
            </div>
            <Link href="/search?tab=trending" className="flex items-center gap-1 text-sm text-brand-500 font-medium hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {MOCK_TREND_CARDS.map((card) => (
              <TrendCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        {/* ── For You ─────────────────────────────────────────────────────────── */}
        <section className="py-10 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-zinc-900">For You</h2>
            <Link href="/search?tab=recommendations" className="flex items-center gap-1 text-sm text-brand-500 font-medium hover:underline">
              See all <ChevronRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {MOCK_RECOMMENDATIONS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* ── Local Sellers ────────────────────────────────────────────────────── */}
        <section className="py-10 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-gradient-to-r from-brand-50 to-emerald-50 rounded-2xl border border-brand-100 p-6 sm:p-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-brand-500" />
                <h2 className="text-lg font-bold text-zinc-900">Discover artisans near you</h2>
              </div>
              <p className="text-zinc-500 text-sm max-w-lg mb-4">
                We surface local makers first — same aesthetic, better price, real story. When a local seller is within 5% of the top result, they always rank first.
              </p>
              <Link
                href="/search?local_only=true"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
              >
                Browse local sellers <ChevronRight size={15} />
              </Link>
            </div>
            <div className="hidden sm:flex gap-3">
              {[
                "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=100&q=70",
                "https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=100&q=70",
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=100&q=70",
              ].map((src, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 shrink-0">
                  <Image src={src} alt="" width={80} height={80} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Chat promo ────────────────────────────────────────────────────── */}
        <section className="py-6 border-t border-zinc-100">
          <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-200 hover:border-brand-300 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-emerald-400 flex items-center justify-center text-white text-xl shrink-0">
                ✨
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Ask Dupe AI anything</p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  &ldquo;Find me a Zara-style linen coord under ₹2000 from an Indian brand&rdquo;
                </p>
              </div>
            </div>
            <Link
              href="/ai-chat"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors shrink-0"
            >
              Chat now <ChevronRight size={15} />
            </Link>
          </div>
        </section>

      </div>

      {/* Bottom padding for mobile bottom nav */}
      <div className="h-16 md:h-0" />
    </div>
  );
}

function TrendCard({ card }: { card: (typeof MOCK_TREND_CARDS)[0] }) {
  const saveK = card.save_count >= 1000
    ? `${(card.save_count / 1000).toFixed(1)}K`
    : card.save_count.toString();

  return (
    <Link
      href={`/category/${card.aesthetic.replace(/_/g, "-")}`}
      className="rounded-2xl overflow-hidden bg-zinc-100 group block"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={card.cover_image}
          alt={card.label}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 16vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-white text-xs font-semibold truncate">{card.label}</p>
          <p className="text-white/70 text-[10px] mt-0.5">+{saveK} saves</p>
        </div>
      </div>
    </Link>
  );
}
