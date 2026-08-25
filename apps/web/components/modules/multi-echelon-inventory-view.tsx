"use client";

import React, { useState } from "react";
import {
  Network,
  Layers,
  TrendingUp,
  Boxes,
  ArrowDownRight,
  ShieldCheck,
  Building,
  RefreshCw,
} from "lucide-react";

interface EchelonNodeUI {
  nodeId: string;
  name: string;
  tier: "CENTRAL_DC" | "REGIONAL_DC" | "LOCAL_STORE";
  onHand: number;
  inTransit: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedOrder: number;
  fillRate: number;
}

const SAMPLE_NODES: EchelonNodeUI[] = [
  {
    nodeId: "CDC-01",
    name: "North America Super-Hub (Chicago CDC)",
    tier: "CENTRAL_DC",
    onHand: 12500,
    inTransit: 2000,
    safetyStock: 3200,
    reorderPoint: 5400,
    recommendedOrder: 0,
    fillRate: 99.4,
  },
  {
    nodeId: "RDC-EAST",
    name: "Eastern Regional Spoke (New Jersey RDC)",
    tier: "REGIONAL_DC",
    onHand: 2100,
    inTransit: 600,
    safetyStock: 1100,
    reorderPoint: 2800,
    recommendedOrder: 700,
    fillRate: 98.2,
  },
  {
    nodeId: "RDC-WEST",
    name: "Western Regional Spoke (California RDC)",
    tier: "REGIONAL_DC",
    onHand: 1800,
    inTransit: 500,
    safetyStock: 1050,
    reorderPoint: 2600,
    recommendedOrder: 800,
    fillRate: 97.9,
  },
  {
    nodeId: "STORE-NYC",
    name: "Manhattan Flagship Store",
    tier: "LOCAL_STORE",
    onHand: 350,
    inTransit: 100,
    safetyStock: 180,
    reorderPoint: 420,
    recommendedOrder: 70,
    fillRate: 96.5,
  },
];

export function MultiEchelonInventoryView() {
  const [nodes, setNodes] = useState<EchelonNodeUI[]>(SAMPLE_NODES);

  const totalNetworkUnits = nodes.reduce((sum, n) => sum + n.onHand + n.inTransit, 0);
  const totalRecommendedOrders = nodes.reduce((sum, n) => sum + n.recommendedOrder, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-Echelon Inventory Optimization (MEIO)</h2>
              <p className="text-sm text-slate-400">
                Clark-Scarf recursive base-stock optimization, echelon safety stock positioning & CDC-to-RDC balancing.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> 98.0% Network CSL Target
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Echelon Pipeline Units</span>
          <span className="text-xl font-bold text-slate-100">{totalNetworkUnits.toLocaleString()} Units</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Immediate Replenishment Due</span>
          <span className="text-xl font-bold text-violet-400">{totalRecommendedOrders.toLocaleString()} Units</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Network Average OTIF Fill Rate</span>
          <span className="text-xl font-bold text-emerald-400">98.0%</span>
        </div>
      </div>

      {/* Nodes Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Boxes className="h-4 w-4 text-violet-400" /> Multi-Tier Node Hierarchy & Base-Stock Health
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Node / Location</th>
                <th className="py-2 font-medium">Tier Classification</th>
                <th className="py-2 font-medium text-right">On-Hand Stock</th>
                <th className="py-2 font-medium text-right">In-Transit</th>
                <th className="py-2 font-medium text-right">Safety Stock</th>
                <th className="py-2 font-medium text-right">ROP Threshold</th>
                <th className="py-2 font-medium text-right">Recommended Dispatch</th>
                <th className="py-2 font-medium text-right">Fill Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nodes.map((n) => (
                <tr key={n.nodeId} className="text-slate-300">
                  <td className="py-3">
                    <span className="font-semibold text-slate-200 block">{n.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{n.nodeId}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        n.tier === "CENTRAL_DC"
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          : n.tier === "REGIONAL_DC"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {n.tier}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-slate-200">{n.onHand.toLocaleString()}</td>
                  <td className="py-3 text-right text-slate-400">{n.inTransit.toLocaleString()}</td>
                  <td className="py-3 text-right text-amber-400 font-medium">{n.safetyStock.toLocaleString()}</td>
                  <td className="py-3 text-right text-slate-300">{n.reorderPoint.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold">
                    {n.recommendedOrder > 0 ? (
                      <span className="text-violet-400 font-bold flex items-center justify-end gap-1">
                        <ArrowDownRight className="h-3.5 w-3.5" /> +{n.recommendedOrder.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-500">Nominal (0)</span>
                    )}
                  </td>
                  <td className="py-3 text-right font-semibold text-emerald-400">{n.fillRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
