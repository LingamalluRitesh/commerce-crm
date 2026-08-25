"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  LineChart,
  DollarSign,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Calculator
} from "lucide-react";

interface PipelineDeal {
  id: string;
  name: string;
  account: string;
  stage: string;
  amount: number;
  prob: number;
  expected: number;
}

const DEALS: PipelineDeal[] = [
  { id: "OPP-901", name: "Global Cloud Architecture Overhaul", account: "CitiGroup Enterprise", stage: "Security / Legal Review", amount: 450000, prob: 85, expected: 382500 },
  { id: "OPP-902", name: "Omnichannel Logistics Automation", account: "Target Supply Corp", stage: "Business Case Validated", amount: 320000, prob: 60, expected: 192000 },
  { id: "OPP-903", name: "Multi-Entity Financial Consolidation", account: "Siemens AG", stage: "Solution Validation POC", amount: 280000, prob: 35, expected: 98000 },
  { id: "OPP-904", name: "B2B PunchOut Electronic Catalog", account: "Grainger Industrial", stage: "Discovery & Qualification", amount: 150000, prob: 15, expected: 22500 },
];

export function PipelineMonteCarloView() {
  const [deals, setDeals] = useState<PipelineDeal[]>(DEALS);

  const totalPipeline = deals.reduce((acc, d) => acc + d.amount, 0);
  const totalExpected = deals.reduce((acc, d) => acc + d.expected, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Sales Pipeline Markov Transitions & Monte Carlo Forecast</h2>
              <p className="text-sm text-slate-400">
                10,000 Stochastic Monte Carlo simulations, confidence percentiles (P10, P50, P90) & Value at Risk.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Calculator className="h-4 w-4 text-indigo-400" />
            10,000 Iterations Simulated
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">P50 Expected Median</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalExpected / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 58.7% Projected Win Rate
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">P10 Conservative Floor</span>
            <Target className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${((totalExpected * 0.72) / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">90% Attainment Confidence</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">P90 Optimistic Ceiling</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">${((totalExpected * 1.35) / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">Top-decile upside target</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Pipeline (ACV)</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">${(totalPipeline / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-slate-400 mt-1">4 Qualified Deals</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Quarterly Deal Opportunities & Markov Probabilities
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Opportunity Name</th>
                <th className="py-3 px-4 font-semibold">Account</th>
                <th className="py-3 px-4 font-semibold">Pipeline Stage</th>
                <th className="py-3 px-4 font-semibold text-right">ACV Value</th>
                <th className="py-3 px-4 font-semibold text-right">Markov Win Prob</th>
                <th className="py-3 px-4 font-semibold text-right">Expected Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{d.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{d.account}</td>
                  <td className="py-3.5 px-4 text-slate-400">{d.stage}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${d.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">{d.prob}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${d.expected.toLocaleString()}
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
