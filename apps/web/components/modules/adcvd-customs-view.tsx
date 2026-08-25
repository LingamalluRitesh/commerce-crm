"use client";

import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  Globe,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from "lucide-react";

interface CustomsEntry {
  entryNo: string;
  hts: string;
  country: string;
  commodity: string;
  enteredVal: number;
  baseDuty: number;
  adCvdDeposit: number;
  totalDuty: number;
  effectiveRate: number;
}

const ENTRIES: CustomsEntry[] = [
  { entryNo: "ENT-8910-LAX", hts: "8541.40.60", country: "CN", commodity: "Photovoltaic Silicon Cells", enteredVal: 250000, baseDuty: 6250, adCvdDeposit: 96750, totalDuty: 103000, effectiveRate: 41.2 },
  { entryNo: "ENT-7721-LGB", hts: "7604.21.00", country: "CN", commodity: "Aluminum Structural Extrusions", enteredVal: 180000, baseDuty: 4500, adCvdDeposit: 81684, totalDuty: 86184, effectiveRate: 47.88 },
  { entryNo: "ENT-4402-HOU", hts: "7304.41.00", country: "TR", commodity: "Stainless Steel Seamless Pipe", enteredVal: 120000, baseDuty: 3000, adCvdDeposit: 22500, totalDuty: 25500, effectiveRate: 21.25 },
];

export function ADCVDcustomsView() {
  const [entries, setEntries] = useState<CustomsEntry[]>(ENTRIES);

  const totalCustomsValue = entries.reduce((acc, e) => acc + e.enteredVal, 0);
  const totalDeposit = entries.reduce((acc, e) => acc + e.totalDuty, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Customs Anti-Dumping & Countervailing Duty (AD/CVD) Matrix</h2>
              <p className="text-sm text-slate-400">
                Statutory DOC/ITC case management, cash deposit rate computation & CBP 7501 tariff calculation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            CBP 19 U.S.C. 1673 Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customs Deposit</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalDeposit / 1000).toFixed(1)}k USD</div>
          <div className="text-xs text-amber-400 mt-1">MFN Base + AD/CVD Deposits</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Entered Merchandise</span>
            <Globe className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${(totalCustomsValue / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">Port of LAX, Long Beach, Houston</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blended Effective Duty</span>
            <Scale className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">38.9%</div>
          <div className="text-xs text-slate-400 mt-1">Across covered import categories</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">DOC / ITC Cases</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">3 Active Cases</div>
          <div className="text-xs text-slate-400 mt-1">A-570-979 • A-570-967 • A-489-844</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Customs Import Entry Summary & AD/CVD Assessment
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Entry #</th>
                <th className="py-3 px-4 font-semibold">HTS Code</th>
                <th className="py-3 px-4 font-semibold">Country</th>
                <th className="py-3 px-4 font-semibold">Commodity Description</th>
                <th className="py-3 px-4 font-semibold text-right">Entered Value</th>
                <th className="py-3 px-4 font-semibold text-right">AD/CVD Deposit</th>
                <th className="py-3 px-4 font-semibold text-right">Total Duty</th>
                <th className="py-3 px-4 font-semibold text-right">Effective Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {entries.map((e) => (
                <tr key={e.entryNo} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{e.entryNo}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{e.hts}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">{e.country}</td>
                  <td className="py-3.5 px-4 text-slate-200">{e.commodity}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${e.enteredVal.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-rose-400">${e.adCvdDeposit.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    ${e.totalDuty.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-amber-400">{e.effectiveRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
