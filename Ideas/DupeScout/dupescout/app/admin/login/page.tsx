"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { loginAdmin } from "@/lib/auth-store";

const ADMIN_TOKEN_KEY = "ds_admin_token";
const ADMIN_USER_KEY  = "ds_admin_user";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const canSubmit = email.length > 0 && password.length > 0 && !loading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));
    try {
      const result = loginAdmin(email, password);
      if (!result.success) {
        setError(result.error);
        return;
      }
      localStorage.setItem(ADMIN_TOKEN_KEY, "dev-admin-jwt-token");
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify({
        id:             result.user.id,
        name:           result.user.name,
        email:          result.user.email,
        role:           result.user.role,
        is_super_admin: result.user.is_super_admin,
      }));
      setSuccess(true);
      setTimeout(() => router.replace("/admin/overview"), 1000);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <p className="text-zinc-300 font-semibold">Signed in — loading console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Shield size={20} className="text-brand-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-100">DupeScout Admin</p>
            <p className="text-xs text-zinc-500">Internal use only</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-zinc-100 mb-6">Sign in</h1>

        <div className="space-y-3 mb-5">
          <input
            type="email"
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Email address"
            className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-brand-500 outline-none px-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors"
          />
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-brand-500 outline-none px-4 pr-12 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle size={12} />{error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={!canSubmit}
          className={cn(
            "w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center transition-all",
            canSubmit
              ? "bg-brand-500 hover:bg-brand-600 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign in"}
        </button>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Secure admin access. All actions are logged.
        </p>
      </div>
    </div>
  );
}
