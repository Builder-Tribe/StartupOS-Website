"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  Heart,
  Star,
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Sparkles,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/hooks/useAuth";

interface MenuRow {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: string;
  danger?: boolean;
  onClick?: () => void;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  // ── Not logged in ─────────────────────────────────────────────────────────────
  if (!isLoading && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24">
        <div className="px-4 pt-14 pb-6 bg-white">
          <h1 className="text-xl font-bold text-zinc-900">Profile</h1>
        </div>

        {/* Guest CTA */}
        <div className="mx-4 mt-4 p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-zinc-400" />
          </div>
          <h2 className="text-base font-bold text-zinc-900 mb-1">Join DupeScout</h2>
          <p className="text-sm text-zinc-500 mb-5">
            Save wishlists, track orders, and get personalised recommendations.
          </p>
          <Link
            href="/login?redirect=/profile"
            className="block w-full h-12 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            Login / Sign Up
          </Link>
        </div>

        {/* Guest browsing options */}
        <div className="mx-4 mt-4 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <GuestMenuRows />
        </div>
      </div>
    );
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 pb-24">
        <div className="px-4 pt-14 pb-6 bg-white">
          <div className="skeleton h-7 w-24 rounded-lg" />
        </div>
        <div className="mx-4 mt-4 p-6 bg-white rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="skeleton w-16 h-16 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-5 w-32 rounded mb-2" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in ─────────────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.phone?.slice(-2) ?? "?";

  const accountMenu: MenuRow[] = [
    { icon: ShoppingBag,  label: "My Orders",        href: "/orders"   },
    { icon: Heart,        label: "Saved Items",       href: "/wishlist" },
    { icon: Star,         label: "My Reviews",        href: "/orders"  },
    { icon: MapPin,       label: "Saved Addresses",   href: "/addresses" },
  ];

  const settingsMenu: MenuRow[] = [
    { icon: Bell,         label: "Notifications",     href: "/settings/notifications" },
    { icon: Shield,       label: "Privacy & Security", href: "/settings/privacy" },
    { icon: HelpCircle,   label: "Help & Support",    href: "/help" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Hero */}
      <div className="px-4 pt-14 pb-6 bg-white">
        <h1 className="text-xl font-bold text-zinc-900 mb-6">Profile</h1>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-zinc-900 truncate">{user?.name ?? "DupeScout User"}</p>
            <p className="text-sm text-zinc-500">{user?.phone ?? ""}</p>
            {user?.city && (
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1">
                <MapPin size={10} /> {user.city}
              </p>
            )}
          </div>
          <Link
            href="/profile/edit"
            className="text-xs font-medium text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full"
          >
            Edit
          </Link>
        </div>

        {/* Pro upsell */}
        {!user?.is_pro && (
          <Link
            href="/pro"
            className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100"
          >
            <Sparkles size={18} className="text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-800">Upgrade to DupeScout Pro</p>
              <p className="text-xs text-amber-600">Unlimited searches, 1-year price history ₹99/mo</p>
            </div>
            <ChevronRight size={16} className="text-amber-500 flex-shrink-0" />
          </Link>
        )}
      </div>

      {/* Account */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Account</p>
        {accountMenu.map((row) => (
          <MenuRowItem key={row.label} row={row} />
        ))}
      </div>

      {/* Settings */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Settings</p>
        {settingsMenu.map((row) => (
          <MenuRowItem key={row.label} row={row} />
        ))}
        <MenuRowItem
          row={{
            icon: LogOut,
            label: "Log Out",
            danger: true,
            onClick: handleLogout,
          }}
        />
      </div>

      <p className="text-center text-xs text-zinc-400 mt-6">DupeScout v0.4 · ap-south-1</p>
    </div>
  );
}


// ── Sub-components ────────────────────────────────────────────────────────────

function MenuRowItem({ row }: { row: MenuRow }) {
  const Icon = row.icon;
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-50 last:border-0">
      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", row.danger ? "bg-red-50" : "bg-zinc-50")}>
        <Icon size={16} className={row.danger ? "text-red-500" : "text-zinc-500"} />
      </div>
      <span className={cn("flex-1 text-sm font-medium", row.danger ? "text-red-600" : "text-zinc-800")}>
        {row.label}
      </span>
      {row.badge && (
        <span className="text-[10px] font-bold bg-brand-500 text-white rounded-full px-2 py-0.5">
          {row.badge}
        </span>
      )}
      {!row.danger && <ChevronRight size={16} className="text-zinc-300" />}
    </div>
  );

  if (row.onClick) {
    return <button onClick={row.onClick} className="w-full text-left">{inner}</button>;
  }
  if (row.href) {
    return <Link href={row.href}>{inner}</Link>;
  }
  return inner;
}

function GuestMenuRows() {
  const rows: MenuRow[] = [
    { icon: HelpCircle, label: "Help & Support",     href: "/help"    },
    { icon: Shield,     label: "Privacy Policy",      href: "/privacy" },
  ];
  return (
    <>
      {rows.map((row) => (
        <MenuRowItem key={row.label} row={row} />
      ))}
    </>
  );
}
