"use client";

import React, { useState } from "react";
import {
  Users,
  Target,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Layers,
  ArrowRight
} from "lucide-react";

interface SalesRep {
  id: string;
  name: string;
  territory: string;
  tenureMonths: number;
  baseQuota: number;
  rampPct: number;
  effectiveCap: number;
}

const REPS: SalesRep[] = [
  { id: "REP-01", name: "Marcus Vance", territory: "US-West Enterprise", tenureMonths: 18, baseQuota: 1200000, rampPct: 100, effectiveCap: 1200000 },
  { id: "REP-02", name: "Sarah Jenkins", territory: "US-East Financial", tenureMonths: 14, baseQuota: 1200000, rampPct: 100, effectiveCap: 1200000 },
  { id: "REP-03", name: "David Kim", territory: "EMEA Tech", tenureMonths: 8, baseQuota: 1200000, rampPct: 75, effectiveCap: 900000 },
  { id: "REP-04", name: "Elena Rostova", territory: "APAC Healthcare", tenureMonths: 4, baseQuota: 1200000, rampPct: 50, effectiveCap: 600000 },
  { id: "REP-05", name: "Alex Rivera", territory: "US-Central Mid-Market", tenureMonths: 2, baseQuota: 1000000, rampPct: 25, effectiveCap: 250000 },
];

export function TerritoryCapacityView() {
  const [reps, setReps] = useState<SalesRep[]>(REPS);
  const targetRevenue = 3200000; // $3.2M company target

  const totalEffectiveCap = reps.reduce((acc, r) => acc + r.effectiveCap, 0);
  const coverageRatio = Number((totalEffectiveCap / targetRevenue).toFixed(2));
  const fullyRampedCount = reps.filter((r) => r.rampPct === 100).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Sales Territory Quota Capacity & Rep Ramp Planner</h2>
              <p className="text-sm text-slate-400">
                Quarterly headcount productivity curves (25%-50%-75%-100%), coverage buffer ratios & hiring capacity deficits.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Target className="h-4 w-4 text-emerald-400" />
            1.29x Target Coverage Buffer
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Effective Capacity</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalEffectiveCap / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Exceeds $3.2M Plan Target
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Coverage Ratio</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{coverageRatio}x</div>
          <div className="text-xs text-slate-400 mt-1">1.25x safe buffer target</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sales Headcount</span>
            <Briefcase className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{reps.length} Reps</div>
          <div className="text-xs text-indigo-300 mt-1">{fullyRampedCount} fully ramped (100%)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ramping Quota In-Flight</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">$1.75M</div>
          <div className="text-xs text-slate-400 mt-1">3 reps in ramp progression</div>
        </div>
      </div>

      {/* Sales Team Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Sales Rep Capacity & Ramp Status
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Account Executive</th>
                <th className="py-3 px-4 font-semibold">Assigned Territory</th>
                <th className="py-3 px-4 font-semibold text-right">Tenure</th>
                <th className="py-3 px-4 font-semibold text-right">Base Quota</th>
                <th className="py-3 px-4 font-semibold text-right">Ramp Productivity %</th>
                <th className="py-3 px-4 font-semibold text-right">Effective Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {reps.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{r.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{r.territory}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">{r.tenureMonths} mos</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${(r.baseQuota / 1000000).toFixed(1)}M</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.rampPct === 100
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : r.rampPct >= 50
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {r.rampPct}% Productive
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${(r.effectiveCap / 1000000).toFixed(2)}M
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
