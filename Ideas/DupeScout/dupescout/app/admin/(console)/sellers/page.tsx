"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, Shield, AlertTriangle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

type SellerStatus = "pending" | "active" | "suspended" | "banned";

const MOCK_SELLERS = [
  { id: "S-001", name: "Priya Textiles",       phone: "+91 98765 43210", city: "Jaipur",     status: "pending",   gstin: "08AABCP1234F1Z9", products: 0,  revenue: 0,       joined: "Today 09:35",    risk: 12 },
  { id: "S-002", name: "Meera Craft Studio",   phone: "+91 87654 32109", city: "Ahmedabad",  status: "pending",   gstin: "24AAEPM5678G1Z4", products: 0,  revenue: 0,       joined: "Today 08:20",    risk: 8  },
  { id: "S-003", name: "Nila Handloom",        phone: "+91 76543 21098", city: "Kutch",      status: "pending",   gstin: "24AAFPN9012H1Z7", products: 0,  revenue: 0,       joined: "Yesterday",      risk: 5  },
  { id: "S-004", name: "Urban Desi Collective", phone: "+91 65432 10987", city: "Bengaluru", status: "active",    gstin: "29AABCU3456J1Z2", products: 47, revenue: 1240000, joined: "3 months ago",   risk: 15 },
  { id: "S-005", name: "Craft Bazaar",         phone: "+91 54321 09876", city: "Delhi",      status: "active",    gstin: "07AABCC7890K1Z5", products: 112, revenue: 4820000, joined: "8 months ago",   risk: 3  },
  { id: "S-006", name: "Fake Reviews Shop",    phone: "+91 44444 44444", city: "Unknown",    status: "suspended", gstin: "29AAAAF1234L1Z1", products: 23, revenue: 320000,  joined: "2 months ago",   risk: 92 },
];

const STATUS_META: Record<SellerStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pending Review", color: "bg-amber-500/10 text-amber-400 border-amber-500/20",   icon: Clock         },
  active:    { label: "Active",          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle },
  suspended: { label: "Suspended",       color: "bg-red-500/10 text-red-400 border-red-500/20",          icon: AlertTriangle },
  banned:    { label: "Banned",          color: "bg-zinc-700 text-zinc-500 border-zinc-600",              icon: XCircle      },
};

const FILTER_TABS: { key: string; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "active",    label: "Active" },
  { key: "suspended", label: "Suspended" },
];

export default function AdminSellersPage() {
  const [search, setSearch]         = useState("");
  const [tab, setTab]               = useState("pending");
  const [sellers, setSellers]       = useState(MOCK_SELLERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = (id: string) => {
    setSellers((prev) => prev.map((s) => s.id === id ? { ...s, status: "active" as SellerStatus } : s));
  };
  const handleReject = (id: string) => {
    setSellers((prev) => prev.map((s) => s.id === id ? { ...s, status: "banned" as SellerStatus } : s));
  };
  const handleSuspend = (id: string) => {
    setSellers((prev) => prev.map((s) => s.id === id ? { ...s, status: "suspended" as SellerStatus } : s));
  };

  const filtered = sellers.filter((s) => {
    const matchTab = tab === "all" || s.status === tab;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-lg font-bold text-zinc-100 mb-6">Sellers</h1>

      {/* Search + filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 h-10 rounded-lg bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 px-3 transition-colors">
          <Search size={14} className="text-zinc-600 flex-shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sellers…" className="flex-1 bg-transparent text-sm text-zinc-300 outline-none placeholder:text-zinc-600" />
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              tab === t.key ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.label}
            {t.key === "pending" && <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold">{sellers.filter((s) => s.status === "pending").length}</span>}
          </button>
        ))}
      </div>

      {/* Seller list */}
      <div className="space-y-2">
        {filtered.map((seller) => {
          const meta = STATUS_META[seller.status as SellerStatus];
          const StatusIcon = meta.icon;
          const isExpanded = expandedId === seller.id;

          return (
            <div key={seller.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-zinc-800/30"
                onClick={() => setExpandedId(isExpanded ? null : seller.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-100">{seller.name}</p>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta.color}`}>
                      <StatusIcon size={9} /> {meta.label}
                    </span>
                    {seller.risk >= 80 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertTriangle size={9} /> Risk {seller.risk}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">{seller.id} · {seller.city} · {seller.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {seller.revenue > 0 && <p className="text-xs font-semibold text-zinc-300">₹{seller.revenue.toLocaleString()}</p>}
                  <p className="text-xs text-zinc-600">{seller.products} products</p>
                </div>
                <ChevronDown size={14} className={cn("text-zinc-600 flex-shrink-0 transition-transform", isExpanded ? "rotate-180" : "")} />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-zinc-800 px-4 py-4 bg-zinc-800/20">
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                    <div><span className="text-zinc-500">GSTIN:</span> <span className="text-zinc-300 font-mono">{seller.gstin}</span></div>
                    <div><span className="text-zinc-500">Joined:</span> <span className="text-zinc-300">{seller.joined}</span></div>
                    <div><span className="text-zinc-500">Risk Score:</span> <span className={cn("font-bold", seller.risk >= 80 ? "text-red-400" : seller.risk >= 40 ? "text-amber-400" : "text-emerald-400")}>{seller.risk}/100</span></div>
                    <div><span className="text-zinc-500">GST Verified:</span> <span className="text-emerald-400">✓ Verified</span></div>
                  </div>

                  <div className="flex gap-2">
                    {seller.status === "pending" && (
                      <>
                        <button onClick={() => handleApprove(seller.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => handleReject(seller.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600/80 text-white text-xs font-semibold">
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                    {seller.status === "active" && (
                      <button onClick={() => handleSuspend(seller.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600/80 text-white text-xs font-semibold">
                        <AlertTriangle size={12} /> Suspend
                      </button>
                    )}
                    {seller.status === "suspended" && (
                      <button onClick={() => handleApprove(seller.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600/80 text-white text-xs font-semibold">
                        <CheckCircle size={12} /> Reinstate
                      </button>
                    )}
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium">
                      <Shield size={12} /> Full KYC Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
