"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, Loader2, Store, Eye, EyeOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { loginSeller } from "@/lib/auth-store";

const SELLER_TOKEN_KEY = "ds_seller_token";
const SELLER_USER_KEY  = "ds_seller_user";

export default function SellerLoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit  = emailValid && password.length > 0 && !loading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    try {
      const result = loginSeller(email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      localStorage.setItem(SELLER_TOKEN_KEY, "dev-seller-jwt-token");
      localStorage.setItem(SELLER_USER_KEY, JSON.stringify({
        id:            result.user.id,
        name:          result.user.name,
        email:         result.user.email,
        business_name: result.user.business_name,
        city:          result.user.city,
        is_onboarded:  result.user.is_onboarded,
      }));
      setSuccess(true);
      setTimeout(() => {
        // If onboarding was never completed, go there first
        if (!result.user.is_onboarded) {
          router.replace("/seller/onboarding");
        } else {
          router.replace("/seller/dashboard");
        }
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="px-6 pt-16 pb-4">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <Store size={20} className="text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900">
            Dupe<span className="text-brand-500">Scout</span>{" "}
            <span className="text-zinc-400 font-normal">Seller</span>
          </span>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold">Welcome back!</h2>
            <p className="text-zinc-500 text-sm mt-1">Loading your dashboard…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">Seller Login</h1>
            <p className="text-zinc-500 text-sm mb-8">Sign in to manage your store.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="seller-email" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  id="seller-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className="w-full h-14 px-4 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="seller-password" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="seller-password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Your password"
                    className="w-full h-14 px-4 pr-12 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={14} />{error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
                  canSubmit
                    ? "bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98]"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <>Sign in <ChevronRight size={18} /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              New seller?{" "}
              <span
                onClick={() => router.push("/seller/register")}
                className="text-brand-600 font-semibold cursor-pointer hover:underline"
              >
                Create an account
              </span>
            </p>

            <p className="mt-3 text-center text-xs text-zinc-400">
              Consumer?{" "}
              <span onClick={() => router.push("/login")} className="text-zinc-500 cursor-pointer hover:underline">
                Sign in here
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
