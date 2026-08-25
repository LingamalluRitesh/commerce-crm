"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Recycle,
  Layers,
  ArrowRight
} from "lucide-react";

interface RMARecord {
  rma: string;
  sku: string;
  msrp: number;
  grade: "GRADE_A" | "GRADE_B" | "GRADE_C_HARVEST" | "GRADE_D_RECYCLE";
  recoveredVal: number;
  disposition: string;
}

const RMA_RECORDS: RMARecord[] = [
  { rma: "RMA-9081", sku: "SRV-NODE-X9", msrp: 4500, grade: "GRADE_A", recoveredVal: 4275, disposition: "Restocked to Main WH1 Shelf A01" },
  { rma: "RMA-9082", sku: "SAN-ARRAY-100TB", msrp: 24000, grade: "GRADE_B", recoveredVal: 16800, disposition: "Refurbished to Outlet Channel (30% off)" },
  { rma: "RMA-9083", sku: "ETH-SW-400G", msrp: 12000, grade: "GRADE_C_HARVEST", recoveredVal: 6200, disposition: "Harvested: 2x 2000W PSUs + 8x Fan Modules" },
  { rma: "RMA-9084", sku: "RAM-64GB-FAULTY", msrp: 180, grade: "GRADE_D_RECYCLE", recoveredVal: 0, disposition: "WEEE Certified E-Waste Destruction" },
];

export function ReverseLogisticsView() {
  const [records, setRecords] = useState<RMARecord[]>(RMA_RECORDS);

  const totalRecovered = records.reduce((acc, r) => acc + r.recoveredVal, 0);
  const totalMSRP = records.reduce((acc, r) => acc + r.msrp, 0);
  const recoveryPct = ((totalRecovered / totalMSRP) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Reverse Logistics, RMA Grading & Component Harvesting</h2>
              <p className="text-sm text-slate-400">
                Grade A-D inspection routing, salvage parts harvesting, secondary market outlet & WEEE e-waste compliance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Recycle className="h-4 w-4 text-emerald-400" />
            Circular Economy Recovery
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Salvage Value Recovered</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalRecovered.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> {recoveryPct}% Asset Recovery Rate
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Harvested ASIC Parts</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">10 Parts</div>
          <div className="text-xs text-slate-400 mt-1">Returned to spares depot</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Refurbished Outlet</span>
            <Sparkles className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$16.8k</div>
          <div className="text-xs text-slate-400 mt-1">Ready for secondary channel</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">EPA / WEEE Certified</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">100% Pass</div>
          <div className="text-xs text-slate-400 mt-1">Zero landfill e-waste compliance</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            RMA Disposition & Harvesting Inspection Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">RMA Number</th>
                <th className="py-3 px-4 font-semibold">Product SKU</th>
                <th className="py-3 px-4 font-semibold">Inspection Grade</th>
                <th className="py-3 px-4 font-semibold text-right">Original MSRP</th>
                <th className="py-3 px-4 font-semibold text-right">Recovered Salvage Value</th>
                <th className="py-3 px-4 font-semibold">Disposition Routing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {records.map((r) => (
                <tr key={r.rma} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{r.rma}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{r.sku}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.grade === "GRADE_A"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : r.grade === "GRADE_B"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : r.grade === "GRADE_C_HARVEST"
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">${r.msrp.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${r.recoveredVal.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{r.disposition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
