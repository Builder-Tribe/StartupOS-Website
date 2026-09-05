"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SellerSidebar, SellerBottomNav } from "@/components/seller/SellerNav";

const SELLER_TOKEN_KEY = "ds_seller_token";

export default function SellerDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Guard: redirect to login if no seller token
  useEffect(() => {
    const token = localStorage.getItem(SELLER_TOKEN_KEY);
    if (!token) router.replace("/seller/login");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <SellerSidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>
      <SellerBottomNav />
    </div>
  );
}
