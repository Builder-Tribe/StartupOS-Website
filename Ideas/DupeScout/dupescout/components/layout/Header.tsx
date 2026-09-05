"use client";

import Link from "next/link";
import { Bell, User } from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/hooks/useAuth";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { user, isLoggedIn } = useAuth();

  const initials = user?.name
    ? user.name[0].toUpperCase()
    : user?.phone?.slice(-2) ?? "";

  return (
    <header className={cn("flex items-center justify-between px-4 py-3 bg-white", className)}>
      <Link href="/" className="flex items-center gap-1.5">
        <span className="text-lg font-bold tracking-tight text-zinc-900">
          Dupe<span className="text-brand-500">Scout</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <button
          aria-label="Notifications"
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        <Link
          href={isLoggedIn ? "/profile" : "/login?redirect=/profile"}
          aria-label="Profile"
          className="p-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
        >
          {isLoggedIn && initials ? (
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          ) : (
            <User size={20} className="text-zinc-500" />
          )}
        </Link>
      </div>
    </header>
  );
}
