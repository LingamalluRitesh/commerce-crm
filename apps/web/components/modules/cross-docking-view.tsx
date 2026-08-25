"use client";

import React, { useState } from "react";
import {
  Truck,
  ArrowRightLeft,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Zap,
  ArrowRight
} from "lucide-react";

interface CrossDockRecord {
  id: string;
  inboundDoor: string;
  outboundDoor: string;
  sku: string;
  description: string;
  units: number;
  dwellMins: number;
  status: "STAGING" | "LOADING" | "DISPATCHED";
  laborSaved: number;
}

const RECORDS: CrossDockRecord[] = [
  { id: "XD-001", inboundDoor: "BAY-04 (FedEx)", outboundDoor: "BAY-18 (Old Dominion)", sku: "SRV-NODE-X9", description: "Compute Node Blade", units: 40, dwellMins: 11, status: "LOADING", laborSaved: 85 },
  { id: "XD-002", inboundDoor: "BAY-02 (Maersk)", outboundDoor: "BAY-12 (DHL Global)", sku: "RAM-64GB-ECC", description: "DDR5 ECC Memory", units: 120, dwellMins: 8, status: "DISPATCHED", laborSaved: 140 },
  { id: "XD-003", inboundDoor: "BAY-06 (J.B. Hunt)", outboundDoor: "BAY-21 (UPS Freight)", sku: "PSU-2000W-RED", description: "2000W Platinum PSU", units: 35, dwellMins: 14, status: "STAGING", laborSaved: 65 },
];

export function CrossDockingView() {
  const [records, setRecords] = useState<CrossDockRecord[]>(RECORDS);

  const totalLaborSaved = records.reduce((acc, r) => acc + r.laborSaved, 0);
  const avgDwell = Math.round(records.reduce((acc, r) => acc + r.dwellMins, 0) / records.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Warehouse Cross-Docking & Zero-Dwell Transshipment</h2>
              <p className="text-sm text-slate-400">
                Inbound ASN matchmaking, zero put-away staging, automated trailer bay routing & dwell time SLA tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Zap className="h-4 w-4 text-cyan-400" />
            Zero Put-Away Storage
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Dwell Time</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{avgDwell} Minutes</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Well below 30m SLA
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Labor Cost Saved</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${totalLaborSaved}</div>
          <div className="text-xs text-slate-400 mt-1">Direct transshipment bypass</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Transshipments</span>
            <Truck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{records.length} Scheduled</div>
          <div className="text-xs text-slate-400 mt-1">Matched against backorders</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Bay Utilization</span>
            <Boxes className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">92.4%</div>
          <div className="text-xs text-slate-400 mt-1">Continuous trailer turns</div>
        </div>
      </div>

      {/* Cross-Dock Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Inbound Bay to Outbound Bay Active Transshipment Schedule
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Transshipment ID</th>
                <th className="py-3 px-4 font-semibold">SKU & Item</th>
                <th className="py-3 px-4 font-semibold">Inbound Gate</th>
                <th className="py-3 px-4 font-semibold">Outbound Gate</th>
                <th className="py-3 px-4 font-semibold text-right">Units</th>
                <th className="py-3 px-4 font-semibold text-right">Dwell Time</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{r.description}</div>
                    <div className="text-[11px] font-mono text-slate-400">{r.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{r.inboundDoor}</td>
                  <td className="py-3.5 px-4 text-slate-300">{r.outboundDoor}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">{r.units}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-emerald-400">{r.dwellMins} min</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        r.status === "DISPATCHED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : r.status === "LOADING"
                          ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {r.status}
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
