"use client";

import React, { useState } from "react";
import {
  Boxes,
  MapPin,
  Truck,
  Store,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface NodeAllocation {
  node: string;
  type: string;
  items: string;
  distance: number;
  cost: number;
  isSingleNode: boolean;
}

const ALLOCATIONS: NodeAllocation[] = [
  { node: "Central DC - Dallas (RDC-01)", type: "Regional DC", items: "2x Server Blades, 4x PSUs", distance: 184, cost: 24.50, isSingleNode: true },
  { node: "Silicon Valley Micro-Hub (MFC-04)", type: "Micro Fulfillment", items: "8x DDR5 Memory Kits", distance: 18, cost: 9.80, isSingleNode: false },
  { node: "San Francisco Flagship Store", type: "Ship-from-Store (SFS)", items: "1x Optical Transceiver", distance: 6, cost: 8.50, isSingleNode: false },
];

export function DOMOrderRoutingView() {
  const [allocations, setAllocations] = useState<NodeAllocation[]>(ALLOCATIONS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Distributed Order Management (DOM) & Omnichannel Routing</h2>
              <p className="text-sm text-slate-400">
                Multi-node ATP sourcing, split-shipment minimization & store inventory markdown avoidance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Zero Stockout Race Conditions
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Single-Package Ratio</span>
            <Boxes className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">89.4%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> High consolidation rate
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Fulfillment Cost</span>
            <Truck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">$14.26 / order</div>
          <div className="text-xs text-slate-400 mt-1">-18% vs unoptimized routing</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Store Ship-from-Store</span>
            <Store className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">140 Retail Nodes</div>
          <div className="text-xs text-slate-400 mt-1">BOPIS & SFS enabled</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Regional DCs</span>
            <Warehouse className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">6 Mega RDCs</div>
          <div className="text-xs text-slate-400 mt-1">Full-line inventory hubs</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Live Order Sourcing Dispatch Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Fulfillment Node</th>
                <th className="py-3 px-4 font-semibold">Facility Type</th>
                <th className="py-3 px-4 font-semibold">Assigned Line Items</th>
                <th className="py-3 px-4 font-semibold text-right">Distance to Customer</th>
                <th className="py-3 px-4 font-semibold text-right">Total Fulfillment Cost</th>
                <th className="py-3 px-4 font-semibold text-center">Consolidation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {allocations.map((a) => (
                <tr key={a.node} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{a.node}</td>
                  <td className="py-3.5 px-4 text-slate-300">{a.type}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">{a.items}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">{a.distance} mi</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${a.cost.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {a.isSingleNode ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SINGLE BOX
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        LOCAL HUB
                      </span>
                    )}
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
