"use client";

import React, { useState } from "react";
import {
  Boxes,
  Truck,
  Calculator,
  Layers,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  Package,
  Plus,
  RefreshCw
} from "lucide-react";

export function SupplyChainView() {
  const [activeTab, setActiveTab] = useState<"bom" | "safety_stock" | "eoq" | "freight">("bom");

  // BOM State
  const [selectedSku, setSelectedSku] = useState("SRV-NODE-X9");
  const [bomQty, setBomQty] = useState(1);

  // EOQ State
  const [annualDemand, setAnnualDemand] = useState(1200);
  const [setupCost, setSetupCost] = useState(150);
  const [holdingPct, setHoldingPct] = useState(20);

  // Freight State
  const [originZip, setOriginZip] = useState("78701");
  const [destZip, setDestZip] = useState("10001");
  const [weightLb, setWeightLb] = useState(45);

  const bomTree = {
    sku: "SRV-NODE-X9",
    name: "Enterprise Edge Compute Node X9",
    qty: bomQty,
    unitCost: 4500.00,
    leadTimeDays: 14,
    children: [
      {
        sku: "MB-XEON-D",
        name: "Dual-Socket Server Motherboard",
        qty: bomQty * 1,
        unitCost: 1200.00,
        leadTimeDays: 10,
        children: [
          { sku: "CPU-XEON-24C", name: "24-Core Server CPU Processor", qty: bomQty * 2, unitCost: 850.00, leadTimeDays: 5, children: [] },
          { sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC Registered DIMM", qty: bomQty * 8, unitCost: 180.00, leadTimeDays: 3, children: [] }
        ]
      },
      { sku: "SSD-NVME-3.8T", name: "3.84TB Enterprise NVMe U.2 Drive", qty: bomQty * 4, unitCost: 320.00, leadTimeDays: 4, children: [] },
      { sku: "CHASSIS-2U", name: "2U Rackmount Server Chassis w/ Redundant PSU", qty: bomQty * 1, unitCost: 450.00, leadTimeDays: 7, children: [] }
    ]
  };

  const calculatedEOQ = Math.round(Math.sqrt((2 * annualDemand * setupCost) / (90.0 * (holdingPct / 100))));
  const calculatedSafetyStock = Math.ceil(1.6449 * Math.sqrt((14 * 16) + (25 * 4)));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Supply Chain & Logistics
            </span>
            <span className="text-xs text-slate-400">Multi-Echelon Optimization Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Supply Chain & MRP Intelligence</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Bill of Materials (BOM) explosion, King&apos;s statistical safety stock buffers, Wilson EOQ models, and multi-carrier rating.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("bom")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "bom" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Multi-Level BOM
          </button>
          <button
            onClick={() => setActiveTab("safety_stock")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "safety_stock" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Safety Stock
          </button>
          <button
            onClick={() => setActiveTab("eoq")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "eoq" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            EOQ Price Breaks
          </button>
          <button
            onClick={() => setActiveTab("freight")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "freight" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Freight Matrix
          </button>
        </div>
      </div>

      {/* TAB 1: MULTI-LEVEL BOM */}
      {activeTab === "bom" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Hierarchical Assembly Tree Explosion
                </h3>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Order Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    value={bomQty}
                    onChange={(e) => setBomQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Level 0 */}
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-indigo-200">Level 0: {bomTree.sku} - {bomTree.name}</span>
                  <span className="text-xs font-mono text-indigo-300">Qty: {bomTree.qty} | Ext: ${(bomTree.unitCost * bomTree.qty).toLocaleString()}</span>
                </div>

                {/* Children Level 1 */}
                <div className="pl-4 border-l-2 border-indigo-500/20 space-y-2">
                  {bomTree.children.map((child, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">Level 1: {child.sku} ({child.name})</span>
                        <span className="font-mono text-slate-300">Qty: {child.qty} | Unit: ${child.unitCost} | Ext: ${(child.unitCost * child.qty).toLocaleString()}</span>
                      </div>

                      {/* Children Level 2 */}
                      {child.children.length > 0 && (
                        <div className="pl-4 border-l-2 border-slate-600/30 space-y-1 mt-1">
                          {child.children.map((subChild, sIdx) => (
                            <div key={sIdx} className="p-1.5 rounded bg-slate-900/60 flex items-center justify-between text-xs">
                              <span className="text-slate-400">Level 2: {subChild.sku} - {subChild.name}</span>
                              <span className="font-mono text-slate-300">Qty: {subChild.qty} | Ext: ${(subChild.unitCost * subChild.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-white">Cost & Lead Time Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-800/50">
                  <span className="text-slate-400">Assembly Unit Cost:</span>
                  <span className="font-semibold text-white">${(bomTree.unitCost).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-800/50">
                  <span className="text-slate-400">Total Rolled-Up Order Cost:</span>
                  <span className="font-semibold text-emerald-400">${(bomTree.unitCost * bomQty).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-800/50">
                  <span className="text-slate-400">Critical Path Lead Time:</span>
                  <span className="font-semibold text-indigo-300">29 Days</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-800/50">
                  <span className="text-slate-400">Engineering ECO Version:</span>
                  <span className="font-mono text-slate-300">ECO-2026-X9-REV4</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAFETY STOCK */}
      {activeTab === "safety_stock" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              King&apos;s Statistical Variance Engine
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Cycle Service Level (CSL):</label>
                <select className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-xs">
                  <option value="95.0">95.0% Service Level (Z = 1.645)</option>
                  <option value="98.0">98.0% Service Level (Z = 2.054)</option>
                  <option value="99.0">99.0% Service Level (Z = 2.326)</option>
                  <option value="99.9">99.9% Aerospace/Medical (Z = 3.090)</option>
                </select>
              </div>
              <div className="p-3 rounded bg-slate-800/60 border border-slate-700 text-slate-300 space-y-1.5">
                <div className="flex justify-between">
                  <span>Computed Safety Stock Buffer:</span>
                  <span className="font-bold text-emerald-400">{calculatedSafetyStock} Units</span>
                </div>
                <div className="flex justify-between">
                  <span>Reorder Point (ROP):</span>
                  <span className="font-bold text-indigo-400">{calculatedSafetyStock + 70} Units</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Item Fill Rate:</span>
                  <span className="font-bold text-white">99.42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EOQ & QUANTITY DISCOUNTS */}
      {activeTab === "eoq" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              Wilson-Harris EOQ Lot Sizing Parameters
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Annual Demand (D):</label>
                <input
                  type="number"
                  value={annualDemand}
                  onChange={(e) => setAnnualDemand(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Order Setup Cost (S):</label>
                <input
                  type="number"
                  value={setupCost}
                  onChange={(e) => setSetupCost(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Holding Cost % (H):</label>
                <input
                  type="number"
                  value={holdingPct}
                  onChange={(e) => setHoldingPct(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-sm text-indigo-200">
                <span>Optimal Order Quantity (EOQ):</span>
                <span>{calculatedEOQ} Units / Order</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Orders per Year:</span>
                <span>{(annualDemand / calculatedEOQ).toFixed(1)} Orders</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Order Interval:</span>
                <span>{(365 / (annualDemand / calculatedEOQ)).toFixed(0)} Days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FREIGHT RATING */}
      {activeTab === "freight" && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-400" />
            Multi-Carrier Freight Rating & Transit Simulator
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Origin ZIP:</label>
              <input
                type="text"
                value={originZip}
                onChange={(e) => setOriginZip(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Destination ZIP:</label>
              <input
                type="text"
                value={destZip}
                onChange={(e) => setDestZip(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Weight (lbs):</label>
              <input
                type="number"
                value={weightLb}
                onChange={(e) => setWeightLb(parseInt(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-600/30">
                Calculate Rates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
