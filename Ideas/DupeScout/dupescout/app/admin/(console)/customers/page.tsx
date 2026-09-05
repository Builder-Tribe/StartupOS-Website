"use client";

import { useState } from "react";
import { Search, Shield, ShieldAlert, User } from "lucide-react";
import { cn } from "@/lib/cn";

type CustomerStatus = "active" | "blocked" | "flagged";

interface Customer {
  id: string;
  phone: string;
  name: string;
  joined: string;
  orders: number;
  spent: number;
  status: CustomerStatus;
  risk_score: number;
  is_pro: boolean;
  last_active: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  { id: "U-1842", phone: "+91 98765 43210", name: "Ananya Kumar",   joined: "Jan 2026", orders: 12, spent: 18400, status: "active",  risk_score: 2,  is_pro: true,  last_active: "Today"        },
  { id: "U-1741", phone: "+91 87654 32109", name: "Rohan Mehta",    joined: "Feb 2026", orders: 4,  spent: 5200,  status: "active",  risk_score: 4,  is_pro: false, last_active: "Yesterday"    },
  { id: "U-1623", phone: "+91 76543 21098", name: "Priya Joshi",    joined: "Mar 2026", orders: 8,  spent: 9800,  status: "flagged", risk_score: 72, is_pro: false, last_active: "3 days ago"   },
  { id: "U-1512", phone: "+91 65432 10987", name: "Vikram Singh",   joined: "Apr 2026", orders: 1,  spent: 650,   status: "blocked", risk_score: 95, is_pro: false, last_active: "1 week ago"   },
  { id: "U-1403", phone: "+91 54321 09876", name: "Meera Iyer",     joined: "May 2026", orders: 22, spent: 34200, status: "active",  risk_score: 1,  is_pro: true,  last_active: "30 mins ago"  },
];

const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string }> = {
  active:  { label: "Active",  color: "text-emerald-400 bg-emerald-900/30" },
  blocked: { label: "Blocked", color: "text-red-400 bg-red-900/30"         },
  flagged: { label: "Flagged", color: "text-amber-400 bg-amber-900/30"     },
};

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_CUSTOMERS.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.id.includes(search)
  );

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold text-zinc-100 mb-6">Customer Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Users",  value: "48,291", color: "text-zinc-100" },
          { label: "Pro Members",  value: "2,184",  color: "text-amber-400" },
          { label: "Flagged",      value: "23",     color: "text-amber-400" },
          { label: "Blocked",      value: "7",      color: "text-red-400"   },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 h-9 mb-4">
        <Search size={14} className="text-zinc-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, phone, or user ID…"
          className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-600 outline-none"
        />
      </div>

      {/* Customer list */}
      <div className="space-y-2">
        {filtered.map((customer) => {
          const cfg = STATUS_CONFIG[customer.status];
          const isOpen = expanded === customer.id;
          const riskColor = customer.risk_score >= 70 ? "text-red-400" : customer.risk_score >= 40 ? "text-amber-400" : "text-emerald-400";

          return (
            <div key={customer.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : customer.id)}
                className="w-full flex items-center gap-3 px-4 py-3"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-zinc-400" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-100">{customer.name}</p>
                    {customer.is_pro && <span className="text-[10px] bg-amber-900/40 text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">PRO</span>}
                  </div>
                  <p className="text-xs text-zinc-500">{customer.phone} · {customer.last_active}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", cfg.color)}>{cfg.label}</span>
                  <p className={cn("text-xs font-mono mt-1", riskColor)}>Risk: {customer.risk_score}</p>
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-zinc-800">
                  <div className="grid grid-cols-3 gap-3 mt-3 mb-4">
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-lg font-bold text-zinc-100">{customer.orders}</p>
                      <p className="text-xs text-zinc-500">Orders</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-lg font-bold text-zinc-100">₹{customer.spent.toLocaleString()}</p>
                      <p className="text-xs text-zinc-500">Total Spent</p>
                    </div>
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 mb-1">Joined</p>
                      <p className="text-sm font-medium text-zinc-200">{customer.joined}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 h-8 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700">
                      View Orders
                    </button>
                    {customer.status !== "blocked" ? (
                      <button className="h-8 px-3 rounded-lg bg-red-900/40 text-red-400 text-xs font-medium hover:bg-red-900/60">
                        Block
                      </button>
                    ) : (
                      <button className="h-8 px-3 rounded-lg bg-emerald-900/40 text-emerald-400 text-xs font-medium hover:bg-emerald-900/60">
                        Unblock
                      </button>
                    )}
                    {customer.status === "flagged" && (
                      <button className="h-8 px-3 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 flex items-center gap-1">
                        <ShieldAlert size={12} /> Investigate
                      </button>
                    )}
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
