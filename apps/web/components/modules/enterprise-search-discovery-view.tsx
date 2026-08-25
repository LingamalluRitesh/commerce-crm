"use client";

import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  FileText,
  Boxes,
  Users,
  Building,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Tag
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "CUSTOMER" | "DEAL" | "PRODUCT" | "INVOICE" | "COMPLIANCE";
  title: string;
  subtitle: string;
  badge: string;
  score: number;
}

const RESULTS: SearchResult[] = [
  { id: "ACC-01", type: "CUSTOMER", title: "Acme Health Systems Inc.", subtitle: "Enterprise Customer • 650 Employees • $180k ARR", badge: "CUSTOMER", score: 0.98 },
  { id: "DL-891", type: "DEAL", title: "Apex Cloud Server Upgrade Expansion", subtitle: "Stage: Proposal • $240,000 USD • Owner: Sarah Jenkins", badge: "PIPELINE", score: 0.94 },
  { id: "SKU-99", type: "PRODUCT", title: "Enterprise Server Node X9 Motherboard", subtitle: "SKU: SRV-NODE-X9 • 420 On-Hand • Dallas Hub", badge: "INVENTORY", score: 0.91 },
  { id: "INV-1092", type: "INVOICE", title: "Quarterly Enterprise SaaS License Renewal", subtitle: "Amount: $45,000 • Status: Paid • Due: Net 30", badge: "FINANCE", score: 0.88 },
  { id: "SOC2-CC6", type: "COMPLIANCE", title: "AICPA SOC 2 Control CC6.1 (MFA Enforced)", subtitle: "Continuous Evidence • FIDO2 WebAuthn • 100% Pass", badge: "AUDIT", score: 0.86 },
];

export function EnterpriseSearchDiscoveryView() {
  const [query, setQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = RESULTS.filter(
    (r) =>
      (filterType === "ALL" || r.type === filterType) &&
      (r.title.toLowerCase().includes(query.toLowerCase()) || r.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Global Enterprise Unified Search & Discovery</h2>
              <p className="text-sm text-slate-400">
                Full-text inverted index and pgvector semantic embeddings across CRM deals, customers, inventory & GL ledger.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-violet-400" />
            pgvector Semantic Index
          </div>
        </div>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search across all customers, deals, products, invoices, or compliance controls..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {["ALL", "CUSTOMER", "DEAL", "PRODUCT", "INVOICE", "COMPLIANCE"].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                filterType === t
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Matching Discovery Results ({filtered.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg text-slate-300">
                  {r.type === "CUSTOMER" && <Building className="h-4 w-4 text-blue-400" />}
                  {r.type === "DEAL" && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                  {r.type === "PRODUCT" && <Boxes className="h-4 w-4 text-indigo-400" />}
                  {r.type === "INVOICE" && <FileText className="h-4 w-4 text-purple-400" />}
                  {r.type === "COMPLIANCE" && <Tag className="h-4 w-4 text-cyan-400" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-100">{r.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {r.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{r.subtitle}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs text-emerald-400 font-semibold">
                  {(r.score * 100).toFixed(0)}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
