export const dynamic = "force-dynamic";

import { ConsumerNav } from "@/components/layout/ConsumerNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { CompareBar } from "@/components/compare/CompareBar";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ConsumerNav />
      <div className="flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
      <CompareBar />
      <Footer />
      <BottomNav />
    </div>
  );
}
