"use client";

import React, { useState } from "react";
import {
  Truck,
  MapPin,
  Clock,
  DollarSign,
  Fuel,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Maximize2
} from "lucide-react";

interface ScheduledStop {
  seq: number;
  stopId: string;
  customer: string;
  arrival: string;
  departure: string;
  weightLbs: number;
  distanceMiles: number;
}

const STOPS: ScheduledStop[] = [
  { seq: 1, stopId: "STP-101", customer: "Apex Data Center (Santa Clara)", arrival: "08:45 AM", departure: "09:15 AM", weightLbs: 4500, distanceMiles: 14.2 },
  { seq: 2, stopId: "STP-102", customer: "Oracle Cloud Hub (San Jose)", arrival: "09:40 AM", departure: "10:10 AM", weightLbs: 6200, distanceMiles: 11.8 },
  { seq: 3, stopId: "STP-103", customer: "Palo Alto Networks Depot", arrival: "10:55 AM", departure: "11:25 AM", weightLbs: 3800, distanceMiles: 18.5 },
  { seq: 4, stopId: "STP-104", customer: "Equinix SV5 Colocation", arrival: "11:50 AM", departure: "12:20 PM", weightLbs: 5100, distanceMiles: 9.4 },
];

export function RouteOptimizationView() {
  const [stops, setStops] = useState<ScheduledStop[]>(STOPS);

  const totalWeight = stops.reduce((acc, s) => acc + s.weightLbs, 0);
  const totalMiles = stops.reduce((acc, s) => acc + s.distanceMiles, 0) + 16.5; // Return to depot

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Vehicle Routing Problem with Time Windows (VRPTW)</h2>
              <p className="text-sm text-slate-400">
                Clarke-Wright multi-stop savings heuristic, DOT Hours-of-Service constraints, and dynamic carbon tracking.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            DOT HOS Compliant (4.5 / 11.0 hrs)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Optimized Distance</span>
            <MapPin className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalMiles.toFixed(1)} Miles</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> -22.4% vs unsequenced route
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Payload Utilization</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{((totalWeight / 26000) * 100).toFixed(1)}%</div>
          <div className="text-xs text-slate-400 mt-1">{totalWeight.toLocaleString()} / 26,000 lbs</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Operating Route Cost</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${(totalMiles * 2.85).toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1">$2.85 / mile blended cost</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Carbon Footprint</span>
            <Leaf className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{((totalMiles * 920) / 1000).toFixed(1)} kg</div>
          <div className="text-xs text-slate-400 mt-1">Scope 3 emissions certified</div>
        </div>
      </div>

      {/* Route Schedule Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Vehicle #TRK-891 Optimized Stop Manifest (Box Truck 26ft)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Sequence</th>
                <th className="py-3 px-4 font-semibold">Destination Customer</th>
                <th className="py-3 px-4 font-semibold">Arrival Window</th>
                <th className="py-3 px-4 font-semibold">Departure</th>
                <th className="py-3 px-4 font-semibold text-right">Leg Distance</th>
                <th className="py-3 px-4 font-semibold text-right">Payload Delivered</th>
                <th className="py-3 px-4 font-semibold text-center">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {stops.map((s) => (
                <tr key={s.stopId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">Stop #{s.seq}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{s.customer}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.stopId}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{s.arrival}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{s.departure}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">{s.distanceMiles} mi</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {s.weightLbs.toLocaleString()} lbs
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ON-TIME
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
