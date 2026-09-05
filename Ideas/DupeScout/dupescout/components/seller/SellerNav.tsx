"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Plus,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/seller/dashboard",  icon: LayoutDashboard, label: "Dashboard" },
  { href: "/seller/products",   icon: Package,          label: "Products"  },
  { href: "/seller/orders",     icon: ShoppingCart,     label: "Orders"    },
  { href: "/seller/payouts",    icon: IndianRupee,      label: "Payouts"   },
  { href: "/seller/analytics",  icon: BarChart3,        label: "Analytics" },
  { href: "/seller/settings",   icon: Settings,         label: "Settings"  },
] as const;

const SELLER_TOKEN_KEY = "ds_seller_token";

export function SellerSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(SELLER_TOKEN_KEY);
    router.replace("/seller/login");
  };

  return (
    <aside className="w-56 flex-shrink-0 hidden md:flex flex-col bg-white border-r border-zinc-100 min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-100">
        <Link href="/seller/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <span className="text-sm font-bold text-zinc-900">
            Dupe<span className="text-brand-500">Scout</span>
          </span>
        </Link>
      </div>

      {/* Add product CTA */}
      <div className="px-3 py-4">
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 w-full h-9 px-3 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
        >
          <Plus size={14} /> New Product
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 w-full transition-colors"
        >
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );
}

export function SellerBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 z-40" style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
      <div className="flex items-center justify-around px-2 h-14">
        {NAV_ITEMS.slice(0, 4).map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl",
                active ? "text-brand-500" : "text-zinc-400"
              )}
            >
              <Icon size={21} strokeWidth={active ? 2.5 : 1.75} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <Link
          href="/seller/products/new"
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl",
            pathname === "/seller/products/new" ? "text-brand-500" : "text-zinc-400"
          )}
        >
          <Plus size={21} strokeWidth={1.75} />
          <span className="text-[10px] font-medium">Add</span>
        </Link>
      </div>
    </nav>
  );
}
