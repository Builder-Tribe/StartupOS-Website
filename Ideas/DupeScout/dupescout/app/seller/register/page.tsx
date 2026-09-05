"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, Loader2, Store, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { registerSeller } from "@/lib/auth-store";

const SELLER_TOKEN_KEY = "ds_seller_token";
const SELLER_USER_KEY  = "ds_seller_user";

export default function SellerRegisterPage() {
  const router = useRouter();

  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [error,     setError]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success,   setSuccess]   = useState(false);

  const nameValid     = name.trim().length >= 2;
  const emailValid    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 8;
  const confirmValid  = password === confirm && confirm.length > 0;
  const canSubmit     = nameValid && emailValid && passwordValid && confirmValid && !isLoading;

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    try {
      const result = registerSeller(name, email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Save seller session
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
      // New seller → always goes to onboarding
      setTimeout(() => router.replace("/seller/onboarding"), 1200);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-md mx-auto">
      <div className="px-6 pt-16 pb-8">

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
          <div className="flex flex-col items-center justify-center pt-16">
            <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Account created!</h2>
            <p className="text-zinc-500 text-sm mt-1">Setting up your onboarding…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-zinc-900 mb-1">Create seller account</h1>
            <p className="text-zinc-500 text-sm mb-8">
              Register to start selling on DupeScout. Business details come next.
            </p>

            <form onSubmit={handleRegister} className="space-y-4">

              {/* Name */}
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Your Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    autoFocus
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="Harshit Agarwal"
                    className="w-full h-14 pl-10 pr-4 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@business.com"
                    className="w-full h-14 pl-10 pr-4 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Min. 8 characters"
                    className="w-full h-14 pl-10 pr-12 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                    aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {password.length > 0 && !passwordValid && (
                  <p className="mt-1 text-xs text-amber-600">Use at least 8 characters</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                  <input
                    id="reg-confirm"
                    type={showConf ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    placeholder="Re-enter your password"
                    className={cn(
                      "w-full h-14 pl-10 pr-12 border-2 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors",
                      confirm.length > 0
                        ? confirmValid ? "border-emerald-400" : "border-red-300"
                        : "border-zinc-200 focus:border-brand-500"
                    )}
                  />
                  <button type="button" onClick={() => setShowConf((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                    aria-label={showConf ? "Hide confirm" : "Show confirm"}>
                    {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirm.length > 0 && !confirmValid && (
                  <p className="mt-1 text-xs text-red-500">Passwords don&apos;t match</p>
                )}
              </div>

              {error && <p role="alert" className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all mt-2",
                  canSubmit
                    ? "bg-brand-500 hover:bg-brand-600 text-white active:scale-[0.98]"
                    : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {isLoading
                  ? <Loader2 size={20} className="animate-spin" />
                  : <>Create account <ChevronRight size={18} /></>}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-500">
              Already have an account?{" "}
              <span
                onClick={() => router.push("/seller/login")}
                className="text-brand-600 font-semibold cursor-pointer hover:underline"
              >
                Sign in
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
