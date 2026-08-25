"use client";

import React, { useState } from "react";
import {
  Cpu,
  Clock,
  DollarSign,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Gauge
} from "lucide-react";

interface ProductionJob {
  id: string;
  sku: string;
  name: string;
  qty: number;
  hours: number;
  cost: number;
  criticalRatio: number;
  status: "FEASIBLE" | "BOTTLENECK";
}

const JOBS: ProductionJob[] = [
  { id: "JOB-401", sku: "BLD-X9-SRV", name: "Compute Blade Motherboard X9", qty: 250, hours: 42.5, cost: 4850, criticalRatio: 1.42, status: "FEASIBLE" },
  { id: "JOB-402", sku: "NIC-100G-PCIE", name: "100Gbps SmartNIC PCIe Gen5", qty: 500, hours: 34.0, cost: 3620, criticalRatio: 1.18, status: "FEASIBLE" },
  { id: "JOB-403", sku: "PSU-2000W-MOD", name: "2000W Platinum Power Supply Module", qty: 300, hours: 28.5, cost: 2940, criticalRatio: 1.65, status: "FEASIBLE" },
];

export function MRPFiniteCapacityView() {
  const [jobs, setJobs] = useState<ProductionJob[]>(JOBS);

  const totalHours = jobs.reduce((acc, j) => acc + j.hours, 0);
  const totalCost = jobs.reduce((acc, j) => acc + j.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-Tier BOM & Finite Capacity MRP II Scheduling</h2>
              <p className="text-sm text-slate-400">
                Work-center machine hour routing, SMT / AOI test sequencing & Critical Ratio (CR) dispatching.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Finite Capacity Feasible
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scheduled Work Hours</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalHours.toFixed(1)} Machine Hrs</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 84.2% Work-Center Utilization
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Production Cost</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${totalCost.toLocaleString()} USD</div>
          <div className="text-xs text-slate-400 mt-1">Direct labor + machine overhead</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Work Centers</span>
            <Wrench className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">4 Machine Lines</div>
          <div className="text-xs text-slate-400 mt-1">SMT • AOI • Sys Assembly • Burn-in</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical Ratio Index</span>
            <Gauge className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">1.41 Avg</div>
          <div className="text-xs text-slate-400 mt-1">Zero production schedule delays</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Shop Floor Job Orders & Work-Center Schedule
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Job Order #</th>
                <th className="py-3 px-4 font-semibold">Assembly SKU</th>
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold text-right">Batch Qty</th>
                <th className="py-3 px-4 font-semibold text-right">Machine Hours</th>
                <th className="py-3 px-4 font-semibold text-right">Production Cost</th>
                <th className="py-3 px-4 font-semibold text-right">Critical Ratio</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{j.id}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{j.sku}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{j.name}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{j.qty} units</td>
                  <td className="py-3.5 px-4 font-mono text-right text-purple-400">{j.hours} hrs</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${j.cost.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-cyan-400">{j.criticalRatio}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      SCHEDULED
                    </span>
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
