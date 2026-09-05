"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingBag, MessageCircle, User, Menu, X, Package, LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/lib/store";
import { useAuth } from "@/lib/hooks/useAuth";
import { SearchBar } from "@/components/search/SearchBar";
import { isActive } from "@/lib/nav";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/ai-chat",  label: "AI Chat",  icon: MessageCircle },
  { href: "/wishlist", label: "Wishlist", icon: Heart         },
];

export function ConsumerNav() {
  const { user, isLoggedIn, logout } = useAuth();
  const cartCount = useCart((s) => s.totalItems());
  const pathname  = usePathname();
  const router    = useRouter();

  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [profileDropOpen,  setProfileDropOpen]  = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const isHomePage   = pathname === "/";
  const isSearchPage = pathname === "/search";
  const hideSearch   = isHomePage || isSearchPage;

  const initials = user?.name
    ? user.name[0].toUpperCase()
    : user?.phone?.slice(-2) ?? "";

  // Close profile dropdown on outside click
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleLogout = () => {
    setProfileDropOpen(false);
    logout();
    router.push("/");
  };

  const AvatarCircle = ({ size = 8 }: { size?: number }) =>
    isLoggedIn && initials ? (
      <div className={size === 8 ? "w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold" : "w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold"}>
        {initials}
      </div>
    ) : (
      <div className={size === 8 ? "w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center" : "w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center"}>
        <User size={size === 8 ? 18 : 15} className="text-zinc-500" />
      </div>
    );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 shrink-0 mr-2">
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Dupe<span className="text-brand-600">Scout</span>
            </span>
          </Link>

          {/* Center search — hidden on home and search pages */}
          {!hideSearch && (
            <div className="hidden md:flex flex-1 max-w-2xl">
              <SearchBar size="compact" className="w-full" />
            </div>
          )}
          {hideSearch && <div className="hidden md:flex flex-1" />}

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive(href, pathname)
                    ? "text-brand-600 bg-brand-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-brand-600"
                )}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            ))}

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors relative focus-ring"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Profile with dropdown */}
            <div ref={profileRef} className="relative ml-1">
              <button
                onClick={() => {
                  if (!isLoggedIn) router.push("/login?redirect=/profile");
                  else setProfileDropOpen((v) => !v);
                }}
                aria-label="Profile menu"
                aria-expanded={profileDropOpen}
                className="flex items-center gap-1 p-1 rounded-xl hover:bg-zinc-100 transition-colors focus-ring"
              >
                <AvatarCircle />
                {isLoggedIn && <ChevronDown size={14} className="text-zinc-400" />}
              </button>

              {profileDropOpen && isLoggedIn && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-zinc-100 shadow-lg shadow-zinc-100/80 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-zinc-50">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{user?.name ?? "My Account"}</p>
                    <p className="text-xs text-zinc-400 truncate">{user?.phone ?? ""}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <User size={15} className="text-zinc-400" />
                    My Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setProfileDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <Package size={15} className="text-zinc-400" />
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-b-2xl"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile: cart + profile + hamburger */}
          <div className="flex md:hidden items-center gap-1 ml-auto">
            <Link
              href="/cart"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="p-2 rounded-xl text-zinc-500 relative focus-ring"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center leading-none">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            <Link
              href={isLoggedIn ? "/profile" : "/login"}
              aria-label="Profile"
              className="p-1 rounded-xl hover:bg-zinc-100 focus-ring"
            >
              <AvatarCircle />
            </Link>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 focus-ring"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search row — hidden on home and search pages */}
        {!hideSearch && (
          <div className="md:hidden pb-3">
            <SearchBar size="compact" />
          </div>
        )}
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-100 bg-white">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                  isActive(href, pathname) ? "text-brand-600 bg-brand-50" : "text-zinc-700 hover:bg-zinc-50"
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Package size={18} />
              My Orders
            </Link>
            {isLoggedIn && (
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
