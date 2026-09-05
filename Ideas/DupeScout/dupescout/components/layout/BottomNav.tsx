"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, MessageCircle, Heart, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCart } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/",         icon: Home,          label: "Home"    },
  { href: "/search",   icon: Search,        label: "Search"  },
  { href: "/ai-chat",  icon: MessageCircle, label: "AI Chat" },
  { href: "/wishlist", icon: Heart,         label: "Saved"   },
  { href: "/cart",     icon: ShoppingBag,   label: "Cart"    },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const cartCount = useCart((s) => s.totalItems());

  return (
    <nav className="bottom-nav z-40 md:hidden">
      <div className="flex items-center justify-around px-2 h-14">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const isCart = href === "/cart";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors",
                active ? "text-brand-500" : "text-zinc-400 hover:text-zinc-600"
              )}
              aria-label={label}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.75} />
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
