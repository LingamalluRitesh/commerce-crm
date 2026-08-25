"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Layers,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  Clock,
} from "lucide-react";

interface POBItem {
  id: string;
  desc: string;
  ssp: number;
  allocatedPrice: number;
  progress: number;
  recognized: number;
  unearned: number;
  type: "OVER_TIME_RATABLE" | "POINT_IN_TIME" | "PERCENT_COMPLETE";
}

export function IFRS15RevenueSchedulesView() {
  const [contractId, setContractId] = useState("CTR-2026-ENT-901");
  const [customer, setCustomer] = useState("OmniGlobal Financial Services Corp");
  const [dealValue, setDealValue] = useState(250000.0);
  const [billed, setBilled] = useState(150000.0);

  const [pobs, setPobs] = useState<POBItem[]>([
    { id: "POB-01", desc: "CommerceCRM Enterprise Core Multi-Tenant Platform (Annual Subscription)", ssp: 180000.0, allocatedPrice: 157894.74, progress: 66.6, recognized: 105157.89, unearned: 52736.85, type: "OVER_TIME_RATABLE" },
    { id: "POB-02", desc: "Dedicated Migration, SSO Integration & Data Warehouse Custom ETL", ssp: 65000.0, allocatedPrice: 57017.54, progress: 100.0, recognized: 57017.54, unearned: 0.0, type: "PERCENT_COMPLETE" },
    { id: "POB-03", desc: "24/7 Platinum Mission-Critical Technical Support & SLA Warranty", ssp: 40000.0, allocatedPrice: 35087.72, progress: 50.0, recognized: 17543.86, unearned: 17543.86, type: "OVER_TIME_RATABLE" },
  ]);

  const totalRecognized = pobs.reduce((sum, p) => sum + p.recognized, 0);
  const contractAsset = Math.max(0, totalRecognized - billed);
  const contractLiability = Math.max(0, billed - totalRecognized);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">IFRS 15 & ASC 606 Multi-Element Revenue Recognition</h2>
              <p className="text-sm text-slate-400">
                5-step statutory revenue accounting, standalone selling price (SSP) allocation & contract asset rollforward.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> GAAP & IFRS 15 Compliant
          </span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Contract Value (TCV)</span>
          <span className="text-xl font-bold text-slate-100">${dealValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Billed & Invoiced to Date</span>
          <span className="text-xl font-bold text-slate-200">${billed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Cumulative Revenue Recognized</span>
          <span className="text-xl font-bold text-cyan-400">${totalRecognized.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Contract Asset (Unbilled AR)</span>
          <span className="text-xl font-bold text-emerald-400">
            {contractAsset > 0 ? `$${contractAsset.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00 (Deferred)"}
          </span>
        </div>
      </div>

      {/* POB Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" /> Distinct Performance Obligations (POBs) & Relative SSP Allocation
          </h3>
          <span className="text-xs font-mono text-slate-400">Contract: {contractId} ({customer})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">POB ID / Description</th>
                <th className="py-2 font-medium">Recognition Model</th>
                <th className="py-2 font-medium text-right">Standalone Price (SSP)</th>
                <th className="py-2 font-medium text-right">Allocated Transaction Price</th>
                <th className="py-2 font-medium text-center">Progress %</th>
                <th className="py-2 font-medium text-right">Recognized Revenue</th>
                <th className="py-2 font-medium text-right">Deferred Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pobs.map((p) => (
                <tr key={p.id} className="text-slate-300">
                  <td className="py-3">
                    <span className="font-semibold text-slate-200 block">{p.desc}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{p.id}</span>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                      {p.type}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-400">${p.ssp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-right font-medium text-slate-200">${p.allocatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-center">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-400">${p.recognized.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-right font-medium text-amber-400">${p.unearned.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
