import Link from "next/link";
import { MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="hidden md:block border-t border-zinc-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-lg font-bold text-zinc-900 mb-1">
              Dupe<span className="text-brand-600">Scout</span>
            </p>
            <p className="text-sm text-zinc-500 mb-3">Shop the Look. Not the Markup.</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <MapPin size={12} />
              India · ap-south-1
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Shop</p>
            <ul className="space-y-2">
              {["Sarees", "Kurtas", "Jewellery", "Bags", "Footwear"].map((c) => (
                <li key={c}>
                  <Link href={`/search?q=${c.toLowerCase()}`} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Help</p>
            <ul className="space-y-2">
              {[
                { label: "Returns & Refunds", href: "/help/returns" },
                { label: "Shipping Policy", href: "/help/shipping" },
                { label: "Track Order", href: "/orders" },
                { label: "Contact Us", href: "/help" },
                { label: "Seller Support", href: "/seller" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3">Company</p>
            <ul className="space-y-2">
              {[
                { label: "About DupeScout", href: "/about" },
                { label: "Sell on DupeScout", href: "/seller" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "DPDP Compliance", href: "/privacy#dpdp" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} DupeScout Technologies Pvt. Ltd. · All rights reserved
          </p>
          <p className="text-xs text-zinc-400">
            Made with ❤ for India · DPDP compliant · Data stored in Mumbai
          </p>
        </div>
      </div>
    </footer>
  );
}
