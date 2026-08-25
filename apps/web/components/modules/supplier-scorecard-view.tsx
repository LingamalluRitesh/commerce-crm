"use client";

import React, { useState } from "react";
import {
  Truck,
  ShieldCheck,
  Percent,
  AlertTriangle,
  CheckCircle2,
  Award,
  BarChart3,
  Search,
  ArrowRight
} from "lucide-react";

interface SupplierItem {
  id: string;
  name: string;
  category: string;
  otifPct: number;
  ppmDefects: number;
  tier: "PREFERRED_TIER_1" | "APPROVED_TIER_2" | "PROBATION";
  spendYtd: number;
}

const SUPPLIERS: SupplierItem[] = [
  { id: "SUP-001", name: "Apex Silicon Semiconductor Ltd", category: "Processors / DRAM", otifPct: 99.4, ppmDefects: 120, tier: "PREFERRED_TIER_1", spendYtd: 1250000 },
  { id: "SUP-002", name: "Precision Chassis & Sheet Metal Inc", category: "Chassis / Enclosures", otifPct: 96.2, ppmDefects: 450, tier: "PREFERRED_TIER_1", spendYtd: 450000 },
  { id: "SUP-003", name: "Delta Power Electronics Corp", category: "Server Redundant PSUs", otifPct: 88.5, ppmDefects: 1800, tier: "APPROVED_TIER_2", spendYtd: 320000 },
  { id: "SUP-004", name: "Shenzhen FastPCB Prototype Co", category: "Motherboard Assemblies", otifPct: 74.0, ppmDefects: 6200, tier: "PROBATION", spendYtd: 180000 },
];

export function SupplierScorecardView() {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(SUPPLIERS);
  const [search, setSearch] = useState<string>("");

  const filtered = suppliers.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Supplier Quality Scorecard & OTIF Delivery Engine</h2>
              <p className="text-sm text-slate-400">
                On-Time In-Full (OTIF) delivery compliance, Parts-Per-Million (PPM) defect rates & automated vendor tier governance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Award className="h-4 w-4 text-emerald-400" />
            Active ISO 9001 Auditing
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average OTIF Rate</span>
            <Percent className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">94.8%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> High Delivery Reliability
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quality Defect PPM</span>
            <AlertTriangle className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">420 PPM</div>
          <div className="text-xs text-slate-400 mt-1">&lt; 500 PPM world-class benchmark</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Qualified Vendors</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{suppliers.length} Vendors</div>
          <div className="text-xs text-slate-400 mt-1">Tier-1 and Tier-2 approved</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Sourcing Spend</span>
            <Truck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">$2.2M YTD</div>
          <div className="text-xs text-slate-400 mt-1">Direct material component POs</div>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Evaluated Supplier Performance Matrix
          </h3>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search vendor or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-4 font-semibold">Component Category</th>
                <th className="py-3 px-4 font-semibold text-right">OTIF Delivery %</th>
                <th className="py-3 px-4 font-semibold text-right">Defect Rate (PPM)</th>
                <th className="py-3 px-4 font-semibold text-right">YTD Spend</th>
                <th className="py-3 px-4 font-semibold text-center">Assigned Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{s.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {s.otifPct.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-indigo-300">{s.ppmDefects} PPM</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">
                    ${s.spendYtd.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        s.tier === "PREFERRED_TIER_1"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : s.tier === "APPROVED_TIER_2"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {s.tier.replace(/_/g, " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
