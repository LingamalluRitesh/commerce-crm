"use client";

import React, { useState } from "react";
import {
  FileText,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Building,
  DollarSign,
} from "lucide-react";

interface StateNexusUI {
  stateCode: string;
  stateName: string;
  salesUSD: number;
  txnCount: number;
  thresholdSales: number;
  nexusType: "PHYSICAL_PRESENCE" | "ECONOMIC_WAYFAIR" | "NO_NEXUS";
  status: "REGISTERED" | "MANDATORY_DUE" | "APPROACHING" | "EXEMPT";
}

const SAMPLE_NEXUS: StateNexusUI[] = [
  { stateCode: "CA", stateName: "California", salesUSD: 1450000.0, txnCount: 1240, thresholdSales: 500000.0, nexusType: "PHYSICAL_PRESENCE", status: "REGISTERED" },
  { stateCode: "NY", stateName: "New York", salesUSD: 680000.0, txnCount: 420, thresholdSales: 500000.0, nexusType: "ECONOMIC_WAYFAIR", status: "REGISTERED" },
  { stateCode: "TX", stateName: "Texas", salesUSD: 520000.0, txnCount: 380, thresholdSales: 500000.0, nexusType: "ECONOMIC_WAYFAIR", status: "MANDATORY_DUE" },
  { stateCode: "IL", stateName: "Illinois", salesUSD: 88000.0, txnCount: 175, thresholdSales: 100000.0, nexusType: "NO_NEXUS", status: "APPROACHING" },
  { stateCode: "WA", stateName: "Washington", salesUSD: 45000.0, txnCount: 62, thresholdSales: 100000.0, nexusType: "NO_NEXUS", status: "EXEMPT" },
];

export function TaxNexusGovernanceView() {
  const [nexusStates, setNexusStates] = useState<StateNexusUI[]>(SAMPLE_NEXUS);

  const registeredCount = nexusStates.filter((s) => s.status === "REGISTERED").length;
  const actionRequiredCount = nexusStates.filter((s) => s.status === "MANDATORY_DUE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-State Tax Nexus & Wayfair Compliance Matrix</h2>
              <p className="text-sm text-slate-400">
                Economic nexus sales threshold monitoring ($100k / $500k), statutory filing dates & tax liability exposure.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Wayfair Rules Enforced
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">States Actively Registered & Collecting</span>
          <span className="text-xl font-bold text-slate-100">{registeredCount} Jurisdictions</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Registration Mandatory Due</span>
          <span className="text-xl font-bold text-rose-400">{actionRequiredCount} States (Action Required)</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Trailing 12M Multi-State Sales</span>
          <span className="text-xl font-bold text-emerald-400">$2,783,000.00</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-400" /> State Statutory Nexus Thresholds & Exposure Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">State Jurisdiction</th>
                <th className="py-2 font-medium">Nexus Classification</th>
                <th className="py-2 font-medium text-right">Trailing 12M Gross Sales</th>
                <th className="py-2 font-medium text-center">Orders Count</th>
                <th className="py-2 font-medium text-right">Statutory Threshold</th>
                <th className="py-2 font-medium text-center">Threshold Utilization</th>
                <th className="py-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nexusStates.map((s) => {
                const util = Math.min(100, Math.round((s.salesUSD / s.thresholdSales) * 100));
                return (
                  <tr key={s.stateCode} className="text-slate-300">
                    <td className="py-3">
                      <span className="font-semibold text-slate-200 block">{s.stateName}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{s.stateCode}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                        {s.nexusType}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-slate-100">${s.salesUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-center font-mono text-slate-400">{s.txnCount}</td>
                    <td className="py-3 text-right text-slate-400">${s.thresholdSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${util >= 100 ? "bg-rose-500" : util >= 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${util}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-300">{util}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      {s.status === "REGISTERED" ? (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold rounded-full">
                          COLLECTING
                        </span>
                      ) : s.status === "MANDATORY_DUE" ? (
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold rounded-full">
                          REGISTER DUE
                        </span>
                      ) : s.status === "APPROACHING" ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold rounded-full">
                          APPROACHING
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-full">
                          EXEMPT
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
