"use client";

import React, { useState } from "react";
import {
  Scale,
  DollarSign,
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Calculator
} from "lucide-react";

interface AgingBucket {
  name: string;
  grossAR: number;
  histLossRate: number;
  adjCECLRate: number;
  allowanceRequired: number;
  netRealizable: number;
}

const BUCKETS: AgingBucket[] = [
  { name: "Current (0-30 Days)", grossAR: 12500000, histLossRate: 0.50, adjCECLRate: 0.55, allowanceRequired: 68750, netRealizable: 12431250 },
  { name: "Past Due 31-60 Days", grossAR: 2400000, histLossRate: 2.50, adjCECLRate: 2.75, allowanceRequired: 66000, netRealizable: 2334000 },
  { name: "Past Due 61-90 Days", grossAR: 850000, histLossRate: 8.00, adjCECLRate: 8.80, allowanceRequired: 74800, netRealizable: 775200 },
  { name: "Past Due 91-120 Days", grossAR: 320000, histLossRate: 25.00, adjCECLRate: 27.50, allowanceRequired: 88000, netRealizable: 232000 },
  { name: "Default (>120 Days)", grossAR: 150000, histLossRate: 75.00, adjCECLRate: 82.50, allowanceRequired: 123750, netRealizable: 26250 },
];

export function CECLCreditLossView() {
  const [buckets, setBuckets] = useState<AgingBucket[]>(BUCKETS);

  const totalGross = buckets.reduce((acc, b) => acc + b.grossAR, 0);
  const totalAllowance = buckets.reduce((acc, b) => acc + b.allowanceRequired, 0);
  const netAR = totalGross - totalAllowance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">GAAP ASC 326 Current Expected Credit Loss (CECL) Matrix</h2>
              <p className="text-sm text-slate-400">
                Forward-looking expected credit loss allowance, macroeconomic overlays & AR aging provisions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            GAAP ASC 326 Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Trade AR</span>
            <DollarSign className="h-4 w-4 text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalGross / 1000000).toFixed(2)}M USD</div>
          <div className="text-xs text-slate-400 mt-1">Total outstanding invoices</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">CECL Loss Allowance</span>
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${(totalAllowance / 1000).toFixed(1)}k USD</div>
          <div className="text-xs text-rose-300 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 2.61% Blended Reserve
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Realizable AR</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${(netAR / 1000000).toFixed(2)}M USD</div>
          <div className="text-xs text-slate-400 mt-1">Carried on Balance Sheet</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Macro Stress Multiplier</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">1.10x</div>
          <div className="text-xs text-slate-400 mt-1">Forward-looking GDP buffer</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            AR Aging Portfolio & CECL Reserve Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Aging Bucket</th>
                <th className="py-3 px-4 font-semibold text-right">Gross AR Balance</th>
                <th className="py-3 px-4 font-semibold text-right">Hist Loss %</th>
                <th className="py-3 px-4 font-semibold text-right">CECL Rate %</th>
                <th className="py-3 px-4 font-semibold text-right">Required Loss Allowance</th>
                <th className="py-3 px-4 font-semibold text-right">Net Realizable AR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {buckets.map((b) => (
                <tr key={b.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{b.name}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${b.grossAR.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">{b.histLossRate}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-purple-400">{b.adjCECLRate}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-rose-400">
                    ${b.allowanceRequired.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${b.netRealizable.toLocaleString()}
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
