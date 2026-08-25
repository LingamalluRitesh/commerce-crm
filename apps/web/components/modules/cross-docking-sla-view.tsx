"use client";

import React, { useState } from "react";
import {
  Truck,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Warehouse
} from "lucide-react";

interface BayAppointment {
  id: string;
  carrier: string;
  trailer: string;
  bay: number;
  pallets: number;
  dwellMins: number;
  detentionFee: number;
  status: "ON_TIME" | "DETENTION_WARNING";
}

const APPOINTMENTS: BayAppointment[] = [
  { id: "APT-881", carrier: "J.B. Hunt Transport", trailer: "TRL-9921", bay: 12, pallets: 28, dwellMins: 85, detentionFee: 0, status: "ON_TIME" },
  { id: "APT-882", carrier: "Schneider National", trailer: "TRL-4410", bay: 14, pallets: 32, dwellMins: 95, detentionFee: 0, status: "ON_TIME" },
  { id: "APT-883", carrier: "Swift Freight Lines", trailer: "TRL-7712", bay: 15, pallets: 24, dwellMins: 110, detentionFee: 0, status: "ON_TIME" },
];

export function CrossDockingSLAView() {
  const [appointments, setAppointments] = useState<BayAppointment[]>(APPOINTMENTS);

  const totalPallets = appointments.reduce((acc, a) => acc + a.pallets, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Warehouse className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Cross-Docking Bay Scheduling & Dwell Time SLA Engine</h2>
              <p className="text-sm text-slate-400">
                Inbound trailer ASN to outbound linehaul transshipment with automated detention penalty avoidance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Zero Detention Fees Accrued
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Bay Turnaround</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">96.7 Minutes</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Well below 120m free time
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pallets Transshipped</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{totalPallets} Pallets</div>
          <div className="text-xs text-slate-400 mt-1">Direct dock-to-dock routing</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Detention Savings</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$4,850 Saved</div>
          <div className="text-xs text-slate-400 mt-1">This operational week</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Dock Bays</span>
            <Truck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">18 Active Bays</div>
          <div className="text-xs text-slate-400 mt-1">Dallas RDC Facility</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Live Dock Bay Appointment & Staging Manifest
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Appointment #</th>
                <th className="py-3 px-4 font-semibold">Carrier</th>
                <th className="py-3 px-4 font-semibold">Trailer ID</th>
                <th className="py-3 px-4 font-semibold text-center">Bay #</th>
                <th className="py-3 px-4 font-semibold text-right">Pallet Count</th>
                <th className="py-3 px-4 font-semibold text-right">Dwell Time</th>
                <th className="py-3 px-4 font-semibold text-right">Detention Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {appointments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{a.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-100">{a.carrier}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{a.trailer}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-purple-400">Bay #{a.bay}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{a.pallets} plts</td>
                  <td className="py-3.5 px-4 font-mono text-right text-emerald-400">{a.dwellMins} mins</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    ${a.detentionFee.toFixed(2)}
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
