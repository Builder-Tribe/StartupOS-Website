export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function FocusedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="h-16 border-b border-zinc-100 flex items-center px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Dupe<span className="text-brand-600">Scout</span>
        </Link>
        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors focus-ring rounded-lg px-2 py-1"
        >
          <ArrowLeft size={15} />
          Back to shopping
        </Link>
      </header>
      {children}
    </div>
  );
}
