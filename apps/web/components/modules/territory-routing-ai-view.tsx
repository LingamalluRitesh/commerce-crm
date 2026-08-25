"use client";

import React, { useState } from "react";
import {
  Compass,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  ArrowRight
} from "lucide-react";

interface RoutingRule {
  industry: string;
  repName: string;
  attainment: number;
  openLeads: number;
  matchScore: number;
}

const RULES: RoutingRule[] = [
  { industry: "FinTech / Banking", repName: "Sarah Jenkins", attainment: 94, openLeads: 12, matchScore: 98.4 },
  { industry: "Healthcare & Life Sciences", repName: "Elena Rostova", attainment: 78, openLeads: 8, matchScore: 95.0 },
  { industry: "Enterprise Cloud & SaaS", repName: "Marcus Vance", attainment: 112, openLeads: 15, matchScore: 91.2 },
  { industry: "Semiconductors & Manufacturing", repName: "David Kim", attainment: 88, openLeads: 10, matchScore: 89.6 },
];

export function TerritoryRoutingAIView() {
  const [rules, setRules] = useState<RoutingRule[]>(RULES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Predictive AI Lead Routing & Territory Quota Balancing</h2>
              <p className="text-sm text-slate-400">
                Multi-dimensional industry vector affinity, quota pacing balancing & sub-5 minute inbound response SLA.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Zap className="h-4 w-4 text-violet-400" />
            &lt;5 Min Response SLA
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Routing Speed</span>
            <Zap className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">1.8 Seconds</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Instant Webhook Dispatch
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quota Pacing Spread</span>
            <Target className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">±14% Delta</div>
          <div className="text-xs text-slate-400 mt-1">Balanced team attainment</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lead Conversion Lift</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">+28.4%</div>
          <div className="text-xs text-slate-400 mt-1">Industry specialization match</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Circular Loop Guards</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">100% Protected</div>
          <div className="text-xs text-slate-400 mt-1">Deterministic state lock</div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Active Routing Topology & Rep Allocation
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Inbound Industry Domain</th>
                <th className="py-3 px-4 font-semibold">Matched Account Executive</th>
                <th className="py-3 px-4 font-semibold text-right">Quota Attainment %</th>
                <th className="py-3 px-4 font-semibold text-right">Active Lead Queue</th>
                <th className="py-3 px-4 font-semibold text-right">AI Affinity Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {rules.map((r) => (
                <tr key={r.industry} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{r.industry}</td>
                  <td className="py-3.5 px-4 text-slate-300">{r.repName}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">{r.attainment}%</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">{r.openLeads} active</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {r.matchScore}%
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
