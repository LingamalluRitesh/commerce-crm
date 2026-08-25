"use client";

import React, { useState } from "react";
import {
  Boxes,
  Truck,
  Layers,
  Scale,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface ContainerSpecUI {
  type: string;
  name: string;
  payloadKg: number;
  volumeM3: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

const CONTAINERS: ContainerSpecUI[] = [
  { type: "20FT_STANDARD", name: "20ft Standard Dry Van", payloadKg: 28080, volumeM3: 33.2, lengthCm: 590, widthCm: 235, heightCm: 239 },
  { type: "40FT_STANDARD", name: "40ft Standard Dry Van", payloadKg: 26700, volumeM3: 67.7, lengthCm: 1203, widthCm: 235, heightCm: 239 },
  { type: "40FT_HIGH_CUBE", name: "40ft High-Cube (HQ)", payloadKg: 26500, volumeM3: 76.2, lengthCm: 1203, widthCm: 235, heightCm: 269 },
  { type: "53FT_INTERMODAL", name: "53ft Domestic Intermodal", payloadKg: 24000, volumeM3: 110.0, lengthCm: 1615, widthCm: 244, heightCm: 279 },
];

export function Container3DPackingView() {
  const [selectedContainer, setSelectedContainer] = useState<string>("40FT_HIGH_CUBE");

  const container = CONTAINERS.find((c) => c.type === selectedContainer) || CONTAINERS[2];

  const totalCargoWeightKg = 21450.0;
  const cargoVolumeM3 = 68.4;
  const itemsPacked = 420;
  const weightUtil = ((totalCargoWeightKg / container.payloadKg) * 100).toFixed(1);
  const volUtil = ((cargoVolumeM3 / container.volumeM3) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">3D Container Bin Packing & Center of Gravity Optimizer</h2>
              <p className="text-sm text-slate-400">
                Spatial cuboid bin-packing, axle load weight balancing & intermodal container utilization.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-300 focus:outline-none focus:border-amber-500"
          >
            {CONTAINERS.map((c) => (
              <option key={c.type} value={c.type}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Items Packed</span>
          <span className="text-xl font-bold text-slate-100">{itemsPacked} Cartons</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Volumetric Utilization</span>
          <span className="text-xl font-bold text-amber-400">{volUtil}%</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Payload Weight Utilization</span>
          <span className="text-xl font-bold text-cyan-400">{weightUtil}%</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Center of Gravity Ratio</span>
          <span className="text-xl font-bold text-emerald-400">0.49 (Balanced)</span>
        </div>
      </div>

      {/* 3D Visualizer Simulation Mock */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Truck className="h-4 w-4 text-amber-400" /> Container Spatial Loading Cross-Section
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {container.lengthCm}cm (L) x {container.widthCm}cm (W) x {container.heightCm}cm (H)
          </span>
        </div>

        {/* Mock Graphic */}
        <div className="h-44 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>[ FRONT AXLE / KINGPIN ]</span>
            <span>[ CENTER OF GRAVITY (49%) ]</span>
            <span>[ REAR TANDEM AXLE ]</span>
          </div>

          <div className="grid grid-cols-6 gap-2 h-24">
            <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-amber-400">Pallet Tier 1</span>
              <span className="text-[9px] text-slate-400">70 Cartons</span>
            </div>
            <div className="bg-cyan-500/20 border border-cyan-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-cyan-400">Pallet Tier 2</span>
              <span className="text-[9px] text-slate-400">70 Cartons</span>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-emerald-400">Pallet Tier 3</span>
              <span className="text-[9px] text-slate-400">70 Cartons</span>
            </div>
            <div className="bg-violet-500/20 border border-violet-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-violet-400">Pallet Tier 4</span>
              <span className="text-[9px] text-slate-400">70 Cartons</span>
            </div>
            <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-blue-400">Pallet Tier 5</span>
              <span className="text-[9px] text-slate-400">70 Cartons</span>
            </div>
            <div className="bg-rose-500/20 border border-rose-500/40 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-rose-400">Pallet Tier 6</span>
              <span className="text-[9px] text-slate-400">70 Cartons</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> DOT Axle Weight Limits Cleared</span>
            <span>Zero Unpacked Spillover Cargo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
