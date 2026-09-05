import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | DupeScout Seller", default: "DupeScout Seller" },
  description: "Sell on DupeScout — reach Gen Z India with AI-powered listings",
};

export default function SellerRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-50">{children}</div>;
}
