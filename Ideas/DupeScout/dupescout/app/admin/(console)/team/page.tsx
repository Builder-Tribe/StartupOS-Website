"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserPlus, Trash2, RefreshCw, Shield, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, KeyRound, Crown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  getAllAdmins,
  addAdminUser,
  revokeAdminUser,
  type AdminUser,
} from "@/lib/auth-store";

const ROLE_LABELS: Record<AdminUser["role"], string> = {
  super_admin: "Super Admin",
  admin:       "Admin",
  support:     "Support",
};

const ROLE_COLORS: Record<AdminUser["role"], string> = {
  super_admin: "bg-violet-100 text-violet-700",
  admin:       "bg-brand-100 text-brand-700",
  support:     "bg-zinc-100 text-zinc-600",
};

interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  is_super_admin: boolean;
}

// ── Add User Modal ────────────────────────────────────────────────────────────

function AddUserModal({
  currentAdminId,
  onClose,
  onAdded,
}: {
  currentAdminId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [tempPwd,  setTempPwd]  = useState("");
  const [role,     setRole]     = useState<AdminUser["role"]>("admin");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit  = name.trim().length >= 2 && emailValid && tempPwd.length >= 6 && !loading;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      const result = addAdminUser(currentAdminId, name, email, tempPwd, role);
      if (!result.success) { setError(result.error); return; }
      setDone(true);
      setTimeout(() => { onAdded(); onClose(); }, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
        {done ? (
          <div className="flex flex-col items-center py-6">
            <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
            <p className="font-semibold text-zinc-800">User added successfully</p>
            <p className="text-sm text-zinc-500 mt-1">They must reset their password on first login.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-zinc-900">Add Admin User</h2>
              <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  placeholder="Jane Smith"
                  className="w-full h-11 px-4 border-2 border-zinc-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="jane@dupescout.in"
                  className="w-full h-11 px-4 border-2 border-zinc-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Temporary Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    value={tempPwd}
                    onChange={(e) => { setTempPwd(e.target.value); setError(""); }}
                    placeholder="Min. 6 characters"
                    className="w-full h-11 px-4 pr-11 border-2 border-zinc-200 rounded-xl text-sm outline-none focus:border-brand-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-400">User will be prompted to change this on first login.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wide">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["admin", "support"] as AdminUser["role"][]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all text-left",
                        role === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      )}
                    >
                      {ROLE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <AlertCircle size={14} />{error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={cn(
                  "w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                  canSubmit ? "bg-brand-500 hover:bg-brand-600 text-white" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                )}
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <><UserPlus size={15} /> Add user</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminTeamPage() {
  const [admins,      setAdmins]      = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentAdmin | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [revoking,    setRevoking]    = useState<string | null>(null);

  const load = useCallback(() => {
    setAdmins(getAllAdmins());
    try {
      const raw = localStorage.getItem("ds_admin_user");
      if (raw) setCurrentUser(JSON.parse(raw) as CurrentAdmin);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRevoke = async (targetId: string) => {
    if (!currentUser) return;
    if (!confirm("Revoke this user's admin access? This cannot be undone.")) return;
    setRevoking(targetId);
    await new Promise((r) => setTimeout(r, 400));
    revokeAdminUser(currentUser.id, targetId);
    load();
    setRevoking(null);
  };

  const isSuperAdmin = currentUser?.is_super_admin ?? false;

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Team</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Admin console access.{" "}
            {isSuperAdmin
              ? "As super admin, you can add or revoke users."
              : "Contact the super admin to make changes."}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            <UserPlus size={16} /> Add user
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Added</th>
              {isSuperAdmin && <th className="px-5 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {admins.map((admin) => (
              <tr key={admin.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0",
                      admin.is_super_admin ? "bg-violet-100 text-violet-700" : "bg-brand-100 text-brand-700"
                    )}>
                      {admin.is_super_admin ? <Crown size={16} /> : admin.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                        {admin.name}
                        {admin.id === currentUser?.id && (
                          <span className="text-[10px] font-medium bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">You</span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", ROLE_COLORS[admin.role])}>
                    {ROLE_LABELS[admin.role]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {admin.must_reset_pwd ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                      <KeyRound size={12} /> Password reset required
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                      <Shield size={12} /> Active
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-xs text-zinc-400">
                  {new Date(admin.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                {isSuperAdmin && (
                  <td className="px-5 py-4 text-right">
                    {!admin.is_super_admin && (
                      <button
                        onClick={() => handleRevoke(admin.id)}
                        disabled={revoking === admin.id}
                        className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                        title="Revoke access"
                      >
                        {revoking === admin.id
                          ? <RefreshCw size={15} className="animate-spin" />
                          : <Trash2 size={15} />}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <div className="py-12 text-center text-zinc-400 text-sm">No admin users found</div>
        )}
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        {admins.length} user{admins.length !== 1 ? "s" : ""} · Admin access is logged. Revocation takes effect immediately.
      </p>

      {showModal && currentUser && (
        <AddUserModal
          currentAdminId={currentUser.id}
          onClose={() => setShowModal(false)}
          onAdded={load}
        />
      )}
    </div>
  );
}
