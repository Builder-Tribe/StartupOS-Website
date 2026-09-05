"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Store, Building2, CreditCard, CheckCircle2, ChevronRight, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { markSellerOnboarded } from "@/lib/auth-store";

type Step = "business" | "gst" | "bank" | "success";

interface OnboardingData {
  business_name: string;
  seller_type: "artisan" | "brand" | "d2c" | "reseller" | "";
  city: string;
  gstin: string;
  gst_trade_name: string;
  upi_id: string;
}

const SELLER_TYPES = [
  { value: "artisan",  label: "Artisan / Maker",   desc: "Handmade, craft, or bespoke products" },
  { value: "brand",    label: "Established Brand",  desc: "Registered brand with trademark" },
  { value: "d2c",      label: "D2C Brand",          desc: "Direct-to-consumer startup" },
  { value: "reseller", label: "Reseller",           desc: "Multi-brand retailer or distributor" },
] as const;

function ProgressBar({ current }: { current: number }) {
  const steps = ["Business", "GST", "Bank"];
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            i < current ? "bg-brand-500 text-white" : i === current ? "bg-brand-500 text-white" : "bg-zinc-200 text-zinc-400"
          )}>
            {i < current ? "✓" : i + 1}
          </div>
          <span className={cn("text-xs font-medium hidden sm:block", i <= current ? "text-zinc-700" : "text-zinc-400")}>{label}</span>
          {i < steps.length - 1 && <div className={cn("flex-1 h-0.5 rounded", i < current ? "bg-brand-500" : "bg-zinc-200")} />}
        </div>
      ))}
    </div>
  );
}

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [step, setStep]     = useState<Step>("business");
  const [data, setData]     = useState<OnboardingData>({ business_name: "", seller_type: "", city: "", gstin: "", gst_trade_name: "", upi_id: "" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const stepIndex = { business: 0, gst: 1, bank: 2, success: 3 }[step];

  const update = useCallback((field: keyof OnboardingData, val: string) => {
    setData((d) => ({ ...d, [field]: val }));
    setError("");
  }, []);

  const handleBusinessNext = () => {
    if (!data.business_name.trim()) { setError("Enter your business name"); return; }
    if (!data.seller_type) { setError("Select your seller type"); return; }
    if (!data.city.trim()) { setError("Enter your city"); return; }
    setStep("gst");
    setError("");
  };

  const handleGstNext = useCallback(async () => {
    const gstin = data.gstin.trim().toUpperCase();
    if (gstin.length !== 15) { setError("GSTIN must be 15 characters"); return; }
    setError("");
    setLoading(true);
    // TODO: real GSTN API verification — mock delay here
    await new Promise((r) => setTimeout(r, 1200));
    const tradeName = data.business_name + " (verified)"; // mock
    setData((d) => ({ ...d, gstin, gst_trade_name: tradeName }));
    setLoading(false);
    setStep("bank");
  }, [data.gstin, data.business_name]);

  const handleBankSubmit = useCallback(async () => {
    if (!data.upi_id.includes("@")) { setError("Enter a valid UPI ID (e.g. business@upi)"); return; }
    setError("");
    setLoading(true);
    // TODO: POST /api/v1/seller/onboarding with full data
    await new Promise((r) => setTimeout(r, 1000));

    // Mark this seller as fully onboarded in the local auth store
    const sellerRaw = typeof window !== "undefined" ? localStorage.getItem("ds_seller_user") : null;
    if (sellerRaw) {
      try {
        const sellerObj = JSON.parse(sellerRaw) as { id?: string };
        if (sellerObj.id) markSellerOnboarded(sellerObj.id);
      } catch { /* ignore */ }
    }

    setLoading(false);
    setStep("success");
    setTimeout(() => router.replace("/seller/dashboard"), 2000);
  }, [data.upi_id, router]);


  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto px-6 py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center">
          <Store size={18} className="text-white" />
        </div>
        <span className="text-base font-bold text-zinc-900">
          Dupe<span className="text-brand-500">Scout</span>
          <span className="text-zinc-400 font-normal"> Seller</span>
        </span>
      </div>

      {step !== "success" && <ProgressBar current={stepIndex} />}

      {/* Step 1 — Business */}
      {step === "business" && (
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Your Business</h1>
          <p className="text-zinc-500 text-sm mb-6">Tell us about your business so we can set up your store.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Business Name *</label>
              <input
                type="text"
                value={data.business_name}
                onChange={(e) => update("business_name", e.target.value)}
                placeholder="e.g. Priya's Handloom Studio"
                className="w-full h-12 rounded-xl border-2 border-zinc-200 focus:border-brand-500 outline-none px-4 text-sm font-medium transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">Seller Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {SELLER_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => update("seller_type", t.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      data.seller_type === t.value ? "border-brand-500 bg-brand-50" : "border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <p className={cn("text-xs font-semibold", data.seller_type === t.value ? "text-brand-700" : "text-zinc-800")}>{t.label}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">City *</label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Jaipur"
                className="w-full h-12 rounded-xl border-2 border-zinc-200 focus:border-brand-500 outline-none px-4 text-sm font-medium transition-colors"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
          <button onClick={handleBusinessNext} className="mt-6 w-full h-13 py-3.5 rounded-2xl bg-brand-500 text-white font-semibold flex items-center justify-center gap-2">
            Next <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Step 2 — GST */}
      {step === "gst" && (
        <div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Building2 size={20} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">GST Verification</h1>
          <p className="text-zinc-500 text-sm mb-6">Required to sell on DupeScout. We verify via GSTN API.</p>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2 mb-5">
            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">If you are a first-time seller under GST threshold (₹20L/year), you can submit Aadhaar + PAN instead. <span className="font-medium underline cursor-pointer">Learn more</span></p>
          </div>

          <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">GSTIN</label>
          <input
            type="text"
            maxLength={15}
            value={data.gstin}
            onChange={(e) => update("gstin", e.target.value.toUpperCase())}
            placeholder="22AAAAA0000A1Z5"
            className="w-full h-12 rounded-xl border-2 border-zinc-200 focus:border-brand-500 outline-none px-4 text-sm font-mono tracking-widest font-medium transition-colors mb-1"
          />
          <p className="text-[10px] text-zinc-400 mb-4">Format: State code (2) + PAN (10) + Entity number (1) + Z + checksum</p>

          {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
          <button
            onClick={handleGstNext}
            disabled={loading || data.gstin.length !== 15}
            className={cn(
              "w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all",
              data.gstin.length === 15 && !loading ? "bg-brand-500 text-white" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : <>Verify & Continue <ChevronRight size={18} /></>}
          </button>
        </div>
      )}

      {/* Step 3 — Bank / UPI */}
      {step === "bank" && (
        <div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
            <CreditCard size={20} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Payout Account</h1>
          <p className="text-zinc-500 text-sm mb-6">We&apos;ll send your earnings here every T+7 days.</p>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-5">
            <p className="text-xs font-semibold text-emerald-800">✓ GST Verified — {data.gst_trade_name}</p>
          </div>

          <label className="block text-xs font-medium text-zinc-500 mb-1.5 uppercase tracking-wide">UPI ID *</label>
          <input
            type="text"
            value={data.upi_id}
            onChange={(e) => update("upi_id", e.target.value)}
            placeholder="yourstore@ybl or @okicici"
            className="w-full h-12 rounded-xl border-2 border-zinc-200 focus:border-brand-500 outline-none px-4 text-sm font-medium transition-colors mb-1"
          />
          <p className="text-[10px] text-zinc-400 mb-1">We&apos;ll send a ₹1 verification transfer to confirm.</p>

          {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
          <button
            onClick={handleBankSubmit}
            disabled={loading}
            className={cn(
              "mt-4 w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2",
              !loading ? "bg-brand-500 text-white" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Setting up…</> : <>Complete Setup <ChevronRight size={18} /></>}
          </button>
        </div>
      )}

      {/* Success */}
      {step === "success" && (
        <div className="flex flex-col items-center justify-center pt-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">You&apos;re live!</h2>
          <p className="text-zinc-500 text-sm mb-2">Your seller account is set up. Start adding products with our AI Catalog Creator.</p>
          <p className="text-xs text-zinc-400">Taking you to your dashboard…</p>
        </div>
      )}
    </div>
  );
}
