"use client";

import React, { useState } from "react";
import {
  Activity,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function UsageMeteringView() {
  const [consumedCalls, setConsumedCalls] = useState<number>(1450000);
  const includedCalls = 1000000; // 1M included

  const overageCalls = Math.max(0, consumedCalls - includedCalls);
  // $0.0001 per extra call ($100 per 1M overage)
  const overageCharge = overageCalls * 0.0001;
  const utilPct = Math.round((consumedCalls / includedCalls) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Consumption Usage Metering & Overage Billing Engine</h2>
              <p className="text-sm text-slate-400">
                High-throughput real-time meter event ingestion, graduated tier brackets & Stripe metered billing synchronization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Stripe Meter Stream Synced
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consumed API Units</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{(consumedCalls / 1000000).toFixed(2)}M Calls</div>
          <div className="text-xs text-slate-400 mt-1">{utilPct}% of {includedCalls / 1000000}M included</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Billable Overage</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">+{(overageCalls / 1000).toFixed(0)}k Units</div>
          <div className="text-xs text-amber-300 mt-1">Exceeds contracted base</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overage Surcharge</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">+${overageCharge.toFixed(2)}</div>
          <div className="text-xs text-emerald-300 mt-1">Added to month-end invoice</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Meter Health</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Sub-ms Latency</div>
          <div className="text-xs text-slate-400 mt-1">Zero event loss</div>
        </div>
      </div>

      {/* Interactive Usage Slider */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Simulated API Consumption Meter & Overage Surcharge
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-slate-400">Total Monthly Ingested API Calls</label>
              <span className="font-mono font-bold text-cyan-400">{consumedCalls.toLocaleString()} Calls</span>
            </div>
            <input
              type="range"
              min="500000"
              max="5000000"
              step="50000"
              value={consumedCalls}
              onChange={(e) => setConsumedCalls(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              Contract Bracket: <code className="text-cyan-300">1,000,000 Included @ $0.00 | Extra @ $0.00010/call</code>
            </div>
            <div className="font-semibold text-slate-200">
              Projected Overage Charge: <span className="font-mono text-emerald-400 text-sm font-bold">${overageCharge.toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
