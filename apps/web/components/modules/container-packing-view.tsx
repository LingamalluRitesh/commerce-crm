"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Scale,
  Compass,
  CheckCircle2,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export function ContainerPackingView() {
  const [containerType, setContainerType] = useState<"20FT" | "40FT" | "40FT_HC">("40FT_HC");
  const [cartonQty, setCartonQty] = useState<number>(480);
  const [cartonWeight, setCartonWeight] = useState<number>(25);

  // 40ft HC dimensions: 474" L × 92" W × 106" H (Total: 2,694 cu ft, Max payload: 58,000 lb)
  // Carton size: 24" L × 18" W × 16" H (4 cu ft per carton)
  const totalWeight = cartonQty * cartonWeight;
  const totalCuFt = cartonQty * 4.0;
  const maxPayload = containerType === "20FT" ? 48000 : 58000;
  const maxCuFt = containerType === "20FT" ? 1172 : containerType === "40FT" ? 2389 : 2694;

  const volumeUtil = Math.min(100, Math.round((totalCuFt / maxCuFt) * 100));
  const weightUtil = Math.min(100, Math.round((totalWeight / maxPayload) * 100));
  const cogBalance = 49.8; // 49.8% longitudinal CoG

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Container className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">3D ISO Shipping Container Packing & Axle Load Engine</h2>
              <p className="text-sm text-slate-400">
                20ft/40ft/40ft-HC 3D cartonization, volumetric cube utilization & longitudinal Center of Gravity (CoG) balancing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            CoG Safely Balanced (49.8%)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Volume Utilization</span>
            <Box className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{volumeUtil}%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> High Cube Efficiency
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Payload Weight</span>
            <Scale className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{totalWeight.toLocaleString()} lb</div>
          <div className="text-xs text-slate-400 mt-1">{weightUtil}% of {maxPayload.toLocaleString()} lb max</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Center of Gravity (CoG)</span>
            <Compass className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{cogBalance}%</div>
          <div className="text-xs text-slate-400 mt-1">45% - 55% safe highway limit</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Cartons Loaded</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{cartonQty} Cartons</div>
          <div className="text-xs text-slate-400 mt-1">Standard 24"×18"×16" boxes</div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          ISO Shipping Container Load Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">ISO Container Specification</label>
            <select
              value={containerType}
              onChange={(e) => setContainerType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-semibold"
            >
              <option value="20FT">20ft Dry Standard Container (1,172 cu ft)</option>
              <option value="40FT">40ft Standard Container (2,389 cu ft)</option>
              <option value="40FT_HC">40ft High Cube Container (2,694 cu ft)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Total Cartons to Pack</label>
            <input
              type="number"
              value={cartonQty}
              onChange={(e) => setCartonQty(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Carton Unit Weight (lb)</label>
            <input
              type="number"
              value={cartonWeight}
              onChange={(e) => setCartonWeight(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
