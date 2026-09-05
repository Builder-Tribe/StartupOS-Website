"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminNav";

const ADMIN_TOKEN_KEY = "ds_admin_token";

export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) router.replace("/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
