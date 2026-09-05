"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Package,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Flag,
  ShoppingCart,
  Users,
  IndianRupee,
  ToggleLeft,
} from "lucide-react";
import { cn } from "@/lib/cn";

const ADMIN_TOKEN_KEY = "ds_admin_token";

const NAV_SECTIONS = [
  {
    label: "Operations",
    items: [
      { href: "/admin/overview",  icon: LayoutDashboard, label: "Overview",   badge: null },
      { href: "/admin/sellers",   icon: Store,            label: "Sellers",   badge: "3" },
      { href: "/admin/catalog",   icon: Package,          label: "Catalog",   badge: "12" },
      { href: "/admin/fraud",     icon: AlertTriangle,    label: "Fraud",     badge: "2" },
      { href: "/admin/disputes",  icon: MessageSquare,    label: "Disputes",  badge: "5" },
      { href: "/admin/orders",    icon: ShoppingCart,     label: "Orders",    badge: null },
      { href: "/admin/customers", icon: Users,            label: "Customers", badge: null },
      { href: "/admin/finance",   icon: IndianRupee,      label: "Finance",   badge: null },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/analytics",     icon: BarChart3,   label: "Analytics",     badge: null },
      { href: "/admin/feature-flags", icon: ToggleLeft,  label: "Feature Flags", badge: null },
      { href: "/admin/audit-log",     icon: Flag,        label: "Audit Log",     badge: null },
      { href: "/admin/team",          icon: Users,       label: "Team",          badge: null },
      { href: "/admin/settings",      icon: Settings,    label: "Settings",      badge: null },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    router.replace("/admin/login");
  };

  return (
    <aside className="w-56 flex-shrink-0 hidden md:flex flex-col bg-zinc-900 border-r border-zinc-800 min-h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Shield size={14} className="text-brand-500" />
          </div>
          <span className="text-sm font-bold text-zinc-100">
            Dupe<span className="text-brand-500">Scout</span>{" "}
            <span className="text-zinc-500 font-normal">Admin</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{section.label}</p>
            {section.items.map(({ href, icon: Icon, label, badge }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium mb-0.5 transition-colors",
                    active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
                  )}
                >
                  <Icon size={15} />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-zinc-800 pt-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/50 w-full transition-colors"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </aside>
  );
}
