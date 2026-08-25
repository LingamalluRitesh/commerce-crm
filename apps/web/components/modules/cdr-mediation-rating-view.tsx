"use client";

import React, { useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  DollarSign,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Gauge
} from "lucide-react";

interface UsageMetric {
  tenant: string;
  metric: string;
  units: number;
  grossCharge: number;
  creditApplied: number;
  netPayable: number;
  effectiveRate: string;
}

const METRICS: UsageMetric[] = [
  { tenant: "Acme Cloud Logistics", metric: "API Volume Calls", units: 4850000, grossCharge: 1655.00, creditApplied: 250.00, netPayable: 1405.00, effectiveRate: "$0.000341 / call" },
  { tenant: "Quant Trading Capital", metric: "GPU Compute Seconds", units: 320000, grossCharge: 530.00, creditApplied: 100.00, netPayable: 430.00, effectiveRate: "$0.001656 / sec" },
  { tenant: "Nexus Health AI", metric: "NVMe Storage GB-Hours", units: 12500000, grossCharge: 875.00, creditApplied: 50.00, netPayable: 825.00, effectiveRate: "$0.000070 / GB-hr" },
];

export function CDRMediationRatingView() {
  const [metrics, setMetrics] = useState<UsageMetric[]>(METRICS);

  const totalGross = metrics.reduce((acc, m) => acc + m.grossCharge, 0);
  const totalNet = metrics.reduce((acc, m) => acc + m.netPayable, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Usage CDR Event Mediation & Real-Time Tiered Rating</h2>
              <p className="text-sm text-slate-400">
                High-throughput deduplication, graduated volume rating & prepaid credit drawdown engine.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Gauge className="h-4 w-4 text-emerald-400" />
            Real-Time Rating Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Rated Usage</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalGross.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1">Across 3 active tenants</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Payable AR</span>
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${totalNet.toFixed(2)}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Credits deducted
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Events Ingested</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">17.6M CDRs</div>
          <div className="text-xs text-slate-400 mt-1">Zero dropped events</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mediation Latency</span>
            <Gauge className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">&lt;2.4 ms</div>
          <div className="text-xs text-slate-400 mt-1">In-memory rate evaluator</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Tenant Usage Rating & Drawdown Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Tenant Account</th>
                <th className="py-3 px-4 font-semibold">Consumption Metric</th>
                <th className="py-3 px-4 font-semibold text-right">Units Consumed</th>
                <th className="py-3 px-4 font-semibold text-right">Gross Charge</th>
                <th className="py-3 px-4 font-semibold text-right">Prepaid Drawdown</th>
                <th className="py-3 px-4 font-semibold text-right">Net Payable</th>
                <th className="py-3 px-4 font-semibold text-right">Blended Unit Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {metrics.map((m) => (
                <tr key={m.tenant} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{m.tenant}</td>
                  <td className="py-3.5 px-4 text-slate-300">{m.metric}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{m.units.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${m.grossCharge.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-emerald-400">-${m.creditApplied.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">
                    ${m.netPayable.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">{m.effectiveRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
