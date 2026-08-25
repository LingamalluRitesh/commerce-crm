"use client";

import React, { useState } from "react";
import {
  GitFork,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from "lucide-react";

interface SourcingSplit {
  sku: string;
  name: string;
  demand: number;
  primary: string;
  primaryRatio: number;
  secondary: string;
  secondaryRatio: number;
  resilienceIndex: number;
  blendedCost: number;
}

const SPLITS: SourcingSplit[] = [
  { sku: "CHIP-MCU-ARM", name: "32-bit ARM Microcontroller", demand: 50000, primary: "TSMC (Taiwan)", primaryRatio: 70, secondary: "GlobalFoundries (US)", secondaryRatio: 30, resilienceIndex: 92.4, blendedCost: 185000 },
  { sku: "BAT-LI-5000MAH", name: "Industrial Lithium Battery", demand: 20000, primary: "CATL (China)", primaryRatio: 65, secondary: "Panasonic (Japan)", secondaryRatio: 35, resilienceIndex: 88.5, blendedCost: 142000 },
  { sku: "OPT-FIBER-TRANS", name: "100Gbps Optical Transceiver", demand: 15000, primary: "Finisar (US)", primaryRatio: 80, secondary: "Lumentum (Thailand)", secondaryRatio: 20, resilienceIndex: 95.0, blendedCost: 120000 },
];

export function DualSourcingRiskView() {
  const [splits, setSplits] = useState<SourcingSplit[]>(SPLITS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <GitFork className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Dual-Sourcing Optimization & Supplier Disruption Markov Engine</h2>
              <p className="text-sm text-slate-400">
                Markov disruption state transitions, risk-adjusted volume split allocation & supply chain resilience hedging.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Resilience Index &gt;85% Met
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Resilience Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">92.0%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Hedged against single-point failure
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Hedged Spend</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">$447k USD</div>
          <div className="text-xs text-slate-400 mt-1">Across 3 critical component SKUs</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Primary Split Ratio</span>
            <GitFork className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">71.7% Avg</div>
          <div className="text-xs text-slate-400 mt-1">28.3% allocated to secondary</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Geographic Diversity</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">5 Nations</div>
          <div className="text-xs text-slate-400 mt-1">US • TW • JP • CN • TH</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Critical SKU Sourcing Allocation Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU / Component</th>
                <th className="py-3 px-4 font-semibold text-right">Annual Demand</th>
                <th className="py-3 px-4 font-semibold">Primary Supplier</th>
                <th className="py-3 px-4 font-semibold text-right">Primary %</th>
                <th className="py-3 px-4 font-semibold">Secondary Supplier</th>
                <th className="py-3 px-4 font-semibold text-right">Secondary %</th>
                <th className="py-3 px-4 font-semibold text-right">Resilience Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {splits.map((s) => (
                <tr key={s.sku} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{s.name}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">{s.demand.toLocaleString()} units</td>
                  <td className="py-3.5 px-4 text-slate-300">{s.primary}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">{s.primaryRatio}%</td>
                  <td className="py-3.5 px-4 text-slate-300">{s.secondary}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">{s.secondaryRatio}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-cyan-400">{s.resilienceIndex}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
