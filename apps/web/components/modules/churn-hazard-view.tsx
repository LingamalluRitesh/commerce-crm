"use client";

import React, { useState } from "react";
import {
  UserMinus,
  TrendingDown,
  DollarSign,
  HeartPulse,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Activity
} from "lucide-react";

interface ChurnAccount {
  id: string;
  name: string;
  arr: number;
  hazardRatio: number;
  churnProb: number;
  risk: "CRITICAL" | "ELEVATED" | "STABLE";
  driver: string;
}

const ACCOUNTS: ChurnAccount[] = [
  { id: "CUST-801", name: "Global FinTech Logistics", arr: 280000, hazardRatio: 2.65, churnProb: 0.32, risk: "CRITICAL", driver: "2 Sev1 tickets & 42% license adoption" },
  { id: "CUST-802", name: "BioHealth Diagnostics", arr: 160000, hazardRatio: 1.45, churnProb: 0.16, risk: "ELEVATED", driver: "Contract renewal in 45 days, declining MAU" },
  { id: "CUST-803", name: "Apex Infrastructure Cloud", arr: 520000, hazardRatio: 0.62, churnProb: 0.04, risk: "STABLE", driver: "96% adoption, NPS +72, executive champion active" },
];

export function ChurnHazardView() {
  const [accounts, setAccounts] = useState<ChurnAccount[]>(ACCOUNTS);

  const totalAtRisk = accounts.filter((a) => a.risk === "CRITICAL").reduce((acc, a) => acc + a.arr, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Customer Churn Survival Analysis & Cox Hazards Engine</h2>
              <p className="text-sm text-slate-400">
                Semi-parametric Cox Proportional Hazards regression, hazard ratios & empirical 12-month renewal projections.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Activity className="h-4 w-4 text-rose-400" />
            Cox Regression Model Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk ARR</span>
            <DollarSign className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${(totalAtRisk / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-rose-300 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> 1 Account needs immediate EBR
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Retained ARR Base</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">$680k USD</div>
          <div className="text-xs text-emerald-400 mt-1">Stable & expanding cohorts</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Hazard Ratio</span>
            <TrendingDown className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">1.24x</div>
          <div className="text-xs text-slate-400 mt-1">Relative to SaaS benchmark</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Model Goodness of Fit</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">0.84 Concordance</div>
          <div className="text-xs text-slate-400 mt-1">Harrell&apos;s C-index verified</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Account Survival Hazard Diagnostic Table
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Account Name</th>
                <th className="py-3 px-4 font-semibold text-right">ARR (USD)</th>
                <th className="py-3 px-4 font-semibold text-right">Hazard Ratio</th>
                <th className="py-3 px-4 font-semibold text-right">12M Churn Risk</th>
                <th className="py-3 px-4 font-semibold">Risk Classification</th>
                <th className="py-3 px-4 font-semibold">Primary Risk Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {accounts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{a.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{a.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-100">${a.arr.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">{a.hazardRatio}x</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-rose-400">
                    {(a.churnProb * 100).toFixed(0)}%
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        a.risk === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : a.risk === "ELEVATED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {a.risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{a.driver}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
