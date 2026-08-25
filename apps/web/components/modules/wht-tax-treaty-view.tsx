"use client";

import React, { useState } from "react";
import {
  Globe,
  Coins,
  Scale,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface TreatySettlement {
  id: string;
  source: string;
  category: string;
  gross: number;
  whtRate: number;
  whtRetained: number;
  netRemittance: number;
  treatyStatus: string;
}

const SETTLEMENTS: TreatySettlement[] = [
  { id: "INV-IN-8910", source: "India (IN)", category: "Software SaaS Royalty", gross: 100000, whtRate: 15.0, whtRetained: 15000, netRemittance: 85000, treatyStatus: "DTT Article 12 Applied" },
  { id: "INV-JP-4421", source: "Japan (JP)", category: "Software License", gross: 150000, whtRate: 0.0, whtRetained: 0, netRemittance: 150000, treatyStatus: "0% DTT Treaty Relief" },
  { id: "INV-GB-2219", source: "United Kingdom (GB)", category: "Cloud SaaS Services", gross: 200000, whtRate: 0.0, whtRetained: 0, netRemittance: 200000, treatyStatus: "0% DTT Treaty Relief" },
  { id: "INV-DE-1104", source: "Germany (DE)", category: "Software License", gross: 80000, whtRate: 0.0, whtRetained: 0, netRemittance: 80000, treatyStatus: "0% DTT Treaty Relief" },
];

export function WHTTaxTreatyView() {
  const [settlements, setSettlements] = useState<TreatySettlement[]>(SETTLEMENTS);

  const totalGross = settlements.reduce((acc, s) => acc + s.gross, 0);
  const totalWHT = settlements.reduce((acc, s) => acc + s.whtRetained, 0);
  const totalNet = settlements.reduce((acc, s) => acc + s.netRemittance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">International Withholding Tax (WHT) & Treaty Relief (DTT)</h2>
              <p className="text-sm text-slate-400">
                Bilateral double tax treaty rate optimization, W-8BEN-E validation & IRS Form 1042-S compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-emerald-400" />
            OECD / IRS Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Cross-Border Billing</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalGross / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">Across 4 international markets</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">WHT Tax Shield Savings</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$107.5k Saved</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> DTT Treaty Relief Applied
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Retained Foreign WHT</span>
            <Scale className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">${(totalWHT / 1000).toFixed(1)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">IRS FTC Foreign Tax Credit credit</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Cash Remittance</span>
            <Coins className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${(totalNet / 1000).toFixed(1)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">Remitted to US Parent entity</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            International Invoicing & Treaty Relief Settlement Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Invoice #</th>
                <th className="py-3 px-4 font-semibold">Source Jurisdiction</th>
                <th className="py-3 px-4 font-semibold">Income Category</th>
                <th className="py-3 px-4 font-semibold text-right">Gross Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Treaty WHT Rate</th>
                <th className="py-3 px-4 font-semibold text-right">WHT Retained</th>
                <th className="py-3 px-4 font-semibold text-right">Net Remittance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-100">{s.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{s.source}</td>
                  <td className="py-3.5 px-4 text-slate-400">{s.category}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${s.gross.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">{s.whtRate}%</td>
                  <td className="py-3.5 px-4 font-mono text-right text-amber-400">${s.whtRetained.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">
                    ${s.netRemittance.toLocaleString()}
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
