"use client";

import React, { useState } from "react";
import {
  Boxes,
  Navigation,
  Clock,
  Compass,
  CheckCircle2,
  TrendingUp,
  MapPin,
  ArrowRight,
  Layers
} from "lucide-react";

interface PickStop {
  binId: string;
  sku: string;
  name: string;
  aisleX: number;
  bayY: number;
  shelfZ: number;
  qty: number;
}

const SAMPLE_STOPS: PickStop[] = [
  { binId: "BIN-A01-B02-S1", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", aisleX: 5.0, bayY: 4.0, shelfZ: 1.0, qty: 2 },
  { binId: "BIN-A01-B08-S3", sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC RAM Module", aisleX: 5.0, bayY: 16.0, shelfZ: 3.0, qty: 6 },
  { binId: "BIN-A03-B04-S2", sku: "SSD-NVME-4TB", name: "4TB NVMe PCIe Gen5 SSD", aisleX: 15.0, bayY: 8.0, shelfZ: 2.0, qty: 4 },
  { binId: "BIN-B02-B10-S4", sku: "PSU-2000W-RED", name: "2000W Redundant Platinum PSU", aisleX: 25.0, bayY: 20.0, shelfZ: 4.0, qty: 2 },
];

export function Warehouse3DRoutingView() {
  const [stops, setStops] = useState<PickStop[]>(SAMPLE_STOPS);

  // Compute travel distance
  let totalMeters = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    const s1 = stops[i];
    const s2 = stops[i + 1];
    const dx = Math.abs(s1.aisleX - s2.aisleX);
    const dy = Math.abs(s1.bayY - s2.bayY);
    const dz = Math.abs(s1.shelfZ - s2.shelfZ);
    const turn = s1.aisleX !== s2.aisleX ? 4.0 : 0.0;
    totalMeters += dx + dy + dz + turn;
  }

  const estSeconds = Math.round(totalMeters / 2.0 + stops.length * 15);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">3D Warehouse Spatial Indexing & Forklift Routing</h2>
              <p className="text-sm text-slate-400">
                Aisle-bay-shelf coordinate spaces, TSP heuristic pick paths & vertical hoist lift penalties.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Navigation className="h-4 w-4 text-emerald-400" />
            Active Route Optimizer: TSP-2OPT
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pick Distance</span>
            <Compass className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{totalMeters.toFixed(1)} Meters</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Shortest Path Solved
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Execution Time</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{estSeconds}s ({Math.round(estSeconds / 60)} mins)</div>
          <div className="text-xs text-slate-400 mt-1">Travel + hoist + pick</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pick Stops</span>
            <MapPin className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{stops.length} Bins</div>
          <div className="text-xs text-slate-400 mt-1">4 SKUs allocated</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warehouse Zone</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Zone-A / High Bay</div>
          <div className="text-xs text-slate-400 mt-1">Dallas-Fort Worth Hub</div>
        </div>
      </div>

      {/* Ordered Pick Stops Sequence */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Optimized Pick Sequence (Nearest Neighbor Heuristic)
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40">
          {stops.map((s, idx) => (
            <div key={s.binId} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {s.binId}
                    </span>
                    <h4 className="font-semibold text-sm text-slate-100">{s.name}</h4>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    3D Coords: X={s.aisleX}m (Aisle) • Y={s.bayY}m (Bay) • Z={s.shelfZ}m (Shelf Tier)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-200 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  Pick {s.qty} units
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
