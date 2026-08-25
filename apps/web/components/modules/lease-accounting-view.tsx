"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Building,
  DollarSign,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Calculator
} from "lucide-react";

interface LeaseItem {
  id: string;
  asset: string;
  lessor: string;
  term: number;
  monthlyPmt: number;
  type: "OPERATING" | "FINANCE";
  rouBalance: number;
  liabilityBalance: number;
}

const LEASES: LeaseItem[] = [
  { id: "LSE-HQ-01", asset: "Global HQ Corporate Office (Floor 12-14)", lessor: "Boston Properties REIT", term: 60, monthlyPmt: 45000, type: "OPERATING", rouBalance: 2180000, liabilityBalance: 2210000 },
  { id: "LSE-DC-02", asset: "Equinix SV5 Colocation Data Center Hall", lessor: "Equinix Global LLC", term: 36, monthlyPmt: 28000, type: "OPERATING", rouBalance: 870000, liabilityBalance: 885000 },
  { id: "LSE-SRV-03", asset: "Dell PowerEdge Compute Fleet (100 Nodes)", lessor: "Dell Financial Services", term: 36, monthlyPmt: 18500, type: "FINANCE", rouBalance: 520000, liabilityBalance: 535000 },
];

export function LeaseAccountingView() {
  const [leases, setLeases] = useState<LeaseItem[]>(LEASES);

  const totalROU = leases.reduce((acc, l) => acc + l.rouBalance, 0);
  const totalLiab = leases.reduce((acc, l) => acc + l.liabilityBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">GAAP ASC 842 & IFRS 16 Lease Accounting Ledger</h2>
              <p className="text-sm text-slate-400">
                Right-of-Use (ROU) asset capitalization, lease liability discounting & 5-criteria classification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-emerald-400" />
            GAAP ASC 842 Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total ROU Assets</span>
            <Building className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalROU / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-slate-400 mt-1">Capitalized on Balance Sheet</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Lease Liabilities</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalLiab / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> IBR Discounting Applied
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Monthly Cash Outflow</span>
            <Calculator className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$91.5k / mo</div>
          <div className="text-xs text-slate-400 mt-1">3 active corporate leases</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weighted Avg IBR</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">5.75%</div>
          <div className="text-xs text-slate-400 mt-1">Incremental borrowing rate</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Active Corporate Lease Contracts & Balances
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Lease Contract</th>
                <th className="py-3 px-4 font-semibold">Lessor Counterparty</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold text-right">Monthly Rent</th>
                <th className="py-3 px-4 font-semibold text-right">ROU Asset Carrying Val</th>
                <th className="py-3 px-4 font-semibold text-right">Ending Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {leases.map((l) => (
                <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{l.asset}</div>
                    <div className="text-[11px] font-mono text-slate-400">{l.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{l.lessor}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        l.type === "FINANCE"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}
                    >
                      {l.type} LEASE
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">${l.monthlyPmt.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">
                    ${l.rouBalance.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${l.liabilityBalance.toLocaleString()}
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
