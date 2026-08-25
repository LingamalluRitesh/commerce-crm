"use client";

import React, { useState } from "react";
import {
  CreditCard,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Zap
} from "lucide-react";

interface DunningCase {
  id: string;
  customer: string;
  amount: number;
  reason: string;
  attempt: number;
  status: "RECOVERED" | "RETRYING" | "CANCELLED";
  recoveredAmt: number;
}

const CASES: DunningCase[] = [
  { id: "SUB-DUN-101", customer: "Apex Cloud Services", amount: 4500, reason: "Card Expired (Auto-Updated via VAU)", attempt: 2, status: "RECOVERED", recoveredAmt: 4500 },
  { id: "SUB-DUN-102", customer: "BioData Labs Corp", amount: 2800, reason: "Insufficient Funds (Payday Retry)", attempt: 2, status: "RECOVERED", recoveredAmt: 2800 },
  { id: "SUB-DUN-103", customer: "Quantum Media Group", amount: 6200, reason: "Soft Decline / Do Not Honor", attempt: 1, status: "RETRYING", recoveredAmt: 0 },
];

export function DunningWaterfallView() {
  const [cases, setCases] = useState<DunningCase[]>(CASES);

  const totalRecovered = cases.filter((c) => c.status === "RECOVERED").reduce((acc, c) => acc + c.recoveredAmt, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Smart Recurring Billing Dunning & Involuntary Churn Recovery</h2>
              <p className="text-sm text-slate-400">
                Visa/Mastercard Account Updater (VAU/ABU), dynamic payday retry scheduling & grace period orchestration.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            82.5% Involuntary Churn Recovered
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recovered Recurring MRR</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalRecovered.toLocaleString()} USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Direct revenue saved
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">VAU Auto-Updates</span>
            <RefreshCw className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">142 Cards</div>
          <div className="text-xs text-slate-400 mt-1">Automatic network token refresh</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Retry Cycles</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">1.6 Attempts</div>
          <div className="text-xs text-slate-400 mt-1">To successful auth recovery</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Customer Grace Period</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">14 Days</div>
          <div className="text-xs text-slate-400 mt-1">Zero immediate service cutoffs</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Active Dunning Recovery Pipeline
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Subscription Case</th>
                <th className="py-3 px-4 font-semibold">Customer Name</th>
                <th className="py-3 px-4 font-semibold text-right">Plan Amount</th>
                <th className="py-3 px-4 font-semibold">Decline Category / Strategy</th>
                <th className="py-3 px-4 font-semibold text-center">Attempt</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Recovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{c.id}</td>
                  <td className="py-3.5 px-4 text-slate-200">{c.customer}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${c.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-400">{c.reason}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-300">#{c.attempt}</td>
                  <td className="py-3.5 px-4 text-center">
                    {c.status === "RECOVERED" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        RECOVERED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        RETRYING
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${c.recoveredAmt.toLocaleString()}
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
