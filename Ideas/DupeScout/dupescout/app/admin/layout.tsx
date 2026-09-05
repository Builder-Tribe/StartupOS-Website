import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | DupeScout Admin", default: "DupeScout Admin Console" },
  robots: "noindex, nofollow", // Admin never indexed
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>;
}
