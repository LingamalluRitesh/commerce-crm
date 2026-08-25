"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Calendar,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight
} from "lucide-react";

interface WaterfallMonth {
  month: string;
  recognized: number;
  deferredBalance: number;
}

const TIMELINE: WaterfallMonth[] = [
  { month: "2026-01", recognized: 10000, deferredBalance: 110000 },
  { month: "2026-02", recognized: 10000, deferredBalance: 100000 },
  { month: "2026-03", recognized: 10000, deferredBalance: 90000 },
  { month: "2026-04", recognized: 10000, deferredBalance: 80000 },
  { month: "2026-05", recognized: 10000, deferredBalance: 70000 },
  { month: "2026-06", recognized: 10000, deferredBalance: 60000 },
  { month: "2026-07", recognized: 10000, deferredBalance: 50000 },
  { month: "2026-08", recognized: 10000, deferredBalance: 40000 },
  { month: "2026-09", recognized: 10000, deferredBalance: 30000 },
  { month: "2026-10", recognized: 10000, deferredBalance: 20000 },
  { month: "2026-11", recognized: 10000, deferredBalance: 10000 },
  { month: "2026-12", recognized: 10000, deferredBalance: 0 },
];

export function RevenueWaterfallView() {
  const [timeline, setTimeline] = useState<WaterfallMonth[]>(TIMELINE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">SaaS Deferred Revenue Waterfall & ASC 606 Amortization</h2>
              <p className="text-sm text-slate-400">
                Linear monthly revenue recognition schedules, Remaining Performance Obligations (RPO), and co-terming.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            ASC 606 Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Contract Value</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">$120,000</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 12-Month Annual Pre-Paid
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Recognition</span>
            <Calendar className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">$10,000 / mo</div>
          <div className="text-xs text-slate-400 mt-1">Straight-line daily accrual</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current RPO (Backlog)</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$120,000</div>
          <div className="text-xs text-slate-400 mt-1">Contracted future revenue</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">True-Up Variances</span>
            <Lock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">$0.00</div>
          <div className="text-xs text-slate-400 mt-1">Zero churn degradation</div>
        </div>
      </div>

      {/* Waterfall Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Monthly GAAP ASC 606 Revenue Recognition Waterfall
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Accounting Period</th>
                <th className="py-3 px-4 font-semibold text-right">Recognized Revenue (P&L)</th>
                <th className="py-3 px-4 font-semibold text-right">Ending Deferred Balance (Balance Sheet)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {timeline.map((t) => (
                <tr key={t.month} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{t.month}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${t.recognized.toLocaleString()}.00
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">
                    ${t.deferredBalance.toLocaleString()}.00
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      AMORTIZED
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
