"use client";

import React, { useState } from "react";
import {
  Boxes,
  HandCoins,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building,
  ArrowRight
} from "lucide-react";

interface VMIItem {
  sku: string;
  name: string;
  supplier: string;
  onHand: number;
  minBuffer: number;
  maxBuffer: number;
  unitCost: number;
}

const VMI_ITEMS: VMIItem[] = [
  { sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC RAM", supplier: "Apex Silicon Semiconductor", onHand: 420, minBuffer: 200, maxBuffer: 800, unitCost: 180.0 },
  { sku: "PSU-2000W-RED", name: "2000W Redundant Platinum PSU", supplier: "Delta Power Corp", onHand: 140, minBuffer: 150, maxBuffer: 500, unitCost: 320.0 },
  { sku: "SSD-NVME-4TB", name: "4TB NVMe Gen5 SSD", supplier: "Precision Storage Inc", onHand: 310, minBuffer: 100, maxBuffer: 600, unitCost: 240.0 },
];

export function VMIConsignmentView() {
  const [items, setItems] = useState<VMIItem[]>(VMI_ITEMS);
  const [consumedCount, setConsumedCount] = useState<number>(0);

  const totalConsignmentVal = items.reduce((acc, i) => acc + i.onHand * i.unitCost, 0);

  const handleConsume = (sku: string) => {
    setItems(
      items.map((i) => (i.sku === sku && i.onHand > 0 ? { ...i, onHand: i.onHand - 10 } : i))
    );
    setConsumedCount(consumedCount + 10);
  };

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
              <h2 className="text-xl font-bold text-slate-100">Vendor Managed Inventory (VMI) & Consignment Stock</h2>
              <p className="text-sm text-slate-400">
                Supplier-owned supermarket buffers, automated 852 EDI pull signals & instant title transfer at point of use.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <HandCoins className="h-4 w-4 text-emerald-400" />
            Zero Working Capital Lockup
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consignment Stock Value</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalConsignmentVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Supplier Owned (Off-Balance Sheet)
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consignment SKUs</span>
            <Boxes className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{items.length} Active Parts</div>
          <div className="text-xs text-slate-400 mt-1">Tier-1 supplier managed</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Title Transfers Today</span>
            <RotateCcw className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{consumedCount} Units</div>
          <div className="text-xs text-slate-400 mt-1">Transferred to AP on consumption</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supermarket Buffer Health</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Optimal</div>
          <div className="text-xs text-slate-400 mt-1">1 replenishment signal triggered</div>
        </div>
      </div>

      {/* VMI Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Consignment Supermarket Buffers & Point-of-Use Pull Triggers
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Component / SKU</th>
                <th className="py-3 px-4 font-semibold">Managing Supplier</th>
                <th className="py-3 px-4 font-semibold text-right">On-Hand Units</th>
                <th className="py-3 px-4 font-semibold text-right">Buffer Limits (Min / Max)</th>
                <th className="py-3 px-4 font-semibold text-right">Consignment Value</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {items.map((i) => (
                <tr key={i.sku} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{i.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{i.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{i.supplier}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {i.onHand} units
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">
                    {i.minBuffer} / {i.maxBuffer}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-200">
                    ${(i.onHand * i.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleConsume(i.sku)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      Consume 10 Units
                    </button>
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
