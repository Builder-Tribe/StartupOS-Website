"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, CheckCircle2, Loader2, Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/hooks/useAuth";
import { registerConsumer } from "@/lib/auth-store";

export default function SignupPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/";
  const { login }    = useAuth();

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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    try {
      const result = registerConsumer(name, email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }

      // Auto-login immediately after registration
      login("dev-consumer-jwt-token", {
        id:     result.user.id,
        name:   result.user.name,
        email:  result.user.email,
        phone:  "",
        is_pro: result.user.is_pro,
        city:   result.user.city,
      });

      setSuccess(true);
      setTimeout(() => router.replace(redirectTo), 1200);
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Welcome to DupeScout!</h1>
        <p className="text-zinc-500">Taking you to the app…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start md:items-center justify-center px-4 py-8 md:py-16 bg-zinc-50">
      <div className="w-full max-w-md bg-white rounded-3xl md:shadow-lg md:shadow-zinc-100 p-8 md:p-10">

        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <span className="text-2xl" role="img" aria-label="sparkles">✨</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Create your account</h1>
          <p className="text-zinc-500 text-sm">Join DupeScout — shop smarter, not expensive.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">

          {/* Full Name */}
          <div>
            <label htmlFor="signup-name" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              Full Name
            </label>
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Harshit Agarwal"
                className="w-full h-13 pl-10 pr-4 py-3 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="w-full h-13 pl-10 pr-4 py-3 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-600 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                id="signup-password"
                type={showPwd ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="Min. 8 characters"
                className="w-full h-13 pl-10 pr-12 py-3 border-2 border-zinc-200 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand-600 transition-colors"
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
            <label htmlFor="signup-confirm" className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                id="signup-confirm"
                type={showConf ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                placeholder="Re-enter your password"
                className={cn(
                  "w-full h-13 pl-10 pr-12 py-3 border-2 rounded-2xl text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors",
                  confirm.length > 0
                    ? confirmValid ? "border-emerald-400 focus:border-emerald-500" : "border-red-300 focus:border-red-400"
                    : "border-zinc-200 focus:border-brand-600"
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
              "w-full h-14 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all",
              canSubmit
                ? "bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98]"
                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            {isLoading
              ? <Loader2 size={20} className="animate-spin" />
              : <>Create account <ChevronRight size={18} /></>}
          </button>
        </form>

        <p className="mt-6 text-xs text-zinc-400 text-center">
          By signing up you agree to our{" "}
          <Link href="/terms" className="text-zinc-600 underline underline-offset-2">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-zinc-600 underline underline-offset-2">Privacy Policy</Link>
        </p>

        <div className="mt-4 pt-4 border-t border-zinc-100 text-center">
          <p className="text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
