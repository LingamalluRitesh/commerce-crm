"use client";

import React, { useState } from "react";
import {
  AlertOctagon,
  TrendingDown,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight
} from "lucide-react";

interface DealRisk {
  id: string;
  name: string;
  account: string;
  value: number;
  stage: string;
  health: number;
  risk: "CRITICAL" | "MODERATE" | "HEALTHY";
  daysGhosted: number;
  action: string;
}

const DEALS: DealRisk[] = [
  { id: "DL-901", name: "Global Enterprise Cloud Migration", account: "Apex Financial Corp", value: 340000, stage: "Legal / Security Review", health: 38, risk: "CRITICAL", daysGhosted: 16, action: "VP Sales outreach to CIO" },
  { id: "DL-902", name: "Multi-Store POS Integration Fleet", account: "Metro Retail Brands", value: 180000, stage: "Proposal & Pricing", health: 62, risk: "MODERATE", daysGhosted: 8, action: "Send customized ROI deck" },
  { id: "DL-903", name: "Unified ERP Database Modernization", account: "Precision Medical Systems", value: 420000, stage: "Final Contract Redline", health: 94, risk: "HEALTHY", daysGhosted: 2, action: "Execute DocuSign MSA" },
];

export function DealRiskTelemetryView() {
  const [deals, setDeals] = useState<DealRisk[]>(DEALS);

  const totalAtRisk = deals.filter((d) => d.risk === "CRITICAL").reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">B2B Deal Risk Telemetry & Sentiment Drift Diagnostics</h2>
              <p className="text-sm text-slate-400">
                Stakeholder ghosting alerts, pipeline slippage index & automated AI rescue intervention playbooks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Zap className="h-4 w-4 text-amber-400" />
            Real-Time Telemetry Monitor
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pipeline At Risk</span>
            <DollarSign className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${(totalAtRisk / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-rose-300 mt-1 flex items-center gap-1 font-medium">
            <AlertTriangle className="h-3.5 w-3.5" /> 1 Deal requires executive intervention
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Healthy Pipeline</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">$600k USD</div>
          <div className="text-xs text-emerald-400 mt-1">2 deals pacing on schedule</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Days Ghosted</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">8.6 Days</div>
          <div className="text-xs text-slate-400 mt-1">Across active pipeline</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rescue Playbooks</span>
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Active</div>
          <div className="text-xs text-slate-400 mt-1">Automated alert triggers</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Deal Health Telemetry & Rescue Recommendations
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Deal Opportunity</th>
                <th className="py-3 px-4 font-semibold">Customer Account</th>
                <th className="py-3 px-4 font-semibold text-right">Value (USD)</th>
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold text-right">Health Score</th>
                <th className="py-3 px-4 font-semibold text-right">Days Inactive</th>
                <th className="py-3 px-4 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{d.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{d.account}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    ${d.value.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{d.stage}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`font-mono font-bold ${
                        d.health < 50
                          ? "text-rose-400"
                          : d.health < 80
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {d.health} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">{d.daysGhosted}d</td>
                  <td className="py-3.5 px-4 text-slate-200">{d.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
