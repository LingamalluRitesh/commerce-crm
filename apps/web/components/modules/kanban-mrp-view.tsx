"use client";

import React, { useState } from "react";
import {
  Layers,
  Box,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sliders,
  BarChart3,
  Flame,
  Truck
} from "lucide-react";

interface KanbanCard {
  id: string;
  sku: string;
  name: string;
  state: "FULL" | "IN_CONSUMPTION" | "EMPTY_SIGNAL" | "IN_REPLENISHMENT";
  containerQty: number;
  workCenter: string;
  lastUpdated: string;
}

const INITIAL_CARDS: KanbanCard[] = [
  { id: "KAN-001", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", state: "FULL", containerQty: 50, workCenter: "WC-SMT-LINE1", lastUpdated: "10 mins ago" },
  { id: "KAN-002", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", state: "FULL", containerQty: 50, workCenter: "WC-SMT-LINE1", lastUpdated: "25 mins ago" },
  { id: "KAN-003", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", state: "IN_CONSUMPTION", containerQty: 50, workCenter: "WC-FINAL-ASSY", lastUpdated: "5 mins ago" },
  { id: "KAN-004", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", state: "EMPTY_SIGNAL", containerQty: 50, workCenter: "WC-FINAL-ASSY", lastUpdated: "2 mins ago" },
  { id: "KAN-005", sku: "SRV-NODE-X9", name: "Enterprise Server Motherboard", state: "IN_REPLENISHMENT", containerQty: 50, workCenter: "WC-SMT-LINE1", lastUpdated: "Just now" },
  { id: "KAN-006", sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC Memory Module", state: "FULL", containerQty: 100, workCenter: "WC-FINAL-ASSY", lastUpdated: "1 hour ago" },
  { id: "KAN-007", sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC Memory Module", state: "FULL", containerQty: 100, workCenter: "WC-FINAL-ASSY", lastUpdated: "40 mins ago" },
  { id: "KAN-008", sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC Memory Module", state: "EMPTY_SIGNAL", containerQty: 100, workCenter: "WC-FINAL-ASSY", lastUpdated: "12 mins ago" },
];

export function KanbanMRPView() {
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);
  const [dailyDemand, setDailyDemand] = useState<number>(100);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(2);
  const [safetyDays, setSafetyDays] = useState<number>(1);
  const [alphaVolatility, setAlphaVolatility] = useState<number>(20);
  const [containerCapacity, setContainerCapacity] = useState<number>(50);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Dynamic TPS Kanban formula: K = ceil((D * (L + S) * (1 + alpha)) / C)
  const calcCards = Math.ceil(
    (dailyDemand * (leadTimeDays + safetyDays) * (1 + alphaVolatility / 100)) / containerCapacity
  );

  const fullCount = cards.filter((c) => c.state === "FULL" || c.state === "IN_CONSUMPTION").length;
  const bufferUtilization = Math.round((fullCount / cards.length) * 100);

  const handleTriggerEmpty = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: "EMPTY_SIGNAL", lastUpdated: "Just now" } : c))
    );
  };

  const handleStartReplenish = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: "IN_REPLENISHMENT", lastUpdated: "Just now" } : c))
    );
  };

  const handleRefill = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, state: "FULL", lastUpdated: "Just now" } : c))
    );
  };

  const filteredCards = cards.filter((c) => statusFilter === "ALL" || c.state === statusFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Dynamic e-Kanban & Pull Replenishment</h2>
              <p className="text-sm text-slate-400">
                Toyota Production System (TPS) electronic signal cards, supermarket buffer monitoring & work center pull flows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Supermarket Active: {bufferUtilization}% Stocked
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supermarket Buffer</span>
            <Box className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{bufferUtilization}%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Optimal Buffer Zone
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Kanban Cards</span>
            <Sliders className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{cards.length} Cards</div>
          <div className="text-xs text-slate-400 mt-1">Calculated TPS loop size</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Empty Signal Bins</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {cards.filter((c) => c.state === "EMPTY_SIGNAL").length} Bins
          </div>
          <div className="text-xs text-amber-300 mt-1">Requires work center pickup</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Replenishment Active</span>
            <Truck className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {cards.filter((c) => c.state === "IN_REPLENISHMENT").length} Bins
          </div>
          <div className="text-xs text-blue-300 mt-1">On SMT surface mount line</div>
        </div>
      </div>

      {/* Sizing Calculator & Parameters */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-indigo-400" /> Dynamic TPS Card Sizing Parameters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Daily Demand (D)</label>
            <input
              type="number"
              value={dailyDemand}
              onChange={(e) => setDailyDemand(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Lead Time Days (L)</label>
            <input
              type="number"
              value={leadTimeDays}
              onChange={(e) => setLeadTimeDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Safety Time Days (S)</label>
            <input
              type="number"
              value={safetyDays}
              onChange={(e) => setSafetyDays(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Volatility Buffer % (α)</label>
            <input
              type="number"
              value={alphaVolatility}
              onChange={(e) => setAlphaVolatility(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Container Capacity (C)</label>
            <input
              type="number"
              value={containerCapacity}
              onChange={(e) => setContainerCapacity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Formula: <code className="text-indigo-300">K = ⌈(D × (L + S) × (1 + α)) / C⌉</code>
          </span>
          <span className="font-semibold text-slate-200">
            Recommended Cards for Loop: <span className="text-indigo-400 text-sm">{calcCards} Cards</span>
          </span>
        </div>
      </div>

      {/* Interactive Kanban Card Grid */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Active e-Kanban Signals ({filteredCards.length})
          </h3>
          <div className="flex gap-2 text-xs">
            {["ALL", "FULL", "IN_CONSUMPTION", "EMPTY_SIGNAL", "IN_REPLENISHMENT"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === st
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCards.map((c) => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition-all ${
                c.state === "FULL"
                  ? "bg-slate-950/80 border-emerald-500/30"
                  : c.state === "IN_CONSUMPTION"
                  ? "bg-slate-950/80 border-blue-500/30"
                  : c.state === "EMPTY_SIGNAL"
                  ? "bg-amber-950/20 border-amber-500/50"
                  : "bg-purple-950/20 border-purple-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-semibold text-slate-300">{c.id}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.state === "FULL"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : c.state === "IN_CONSUMPTION"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : c.state === "EMPTY_SIGNAL"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                      : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  }`}
                >
                  {c.state}
                </span>
              </div>

              <div className="font-semibold text-sm text-slate-100">{c.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{c.sku}</div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Lot Size: {c.containerQty} units</span>
                <span>{c.workCenter}</span>
              </div>

              <div className="mt-3 flex gap-2">
                {c.state === "FULL" || c.state === "IN_CONSUMPTION" ? (
                  <button
                    onClick={() => handleTriggerEmpty(c.id)}
                    className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Signal Bin Empty
                  </button>
                ) : c.state === "EMPTY_SIGNAL" ? (
                  <button
                    onClick={() => handleStartReplenish(c.id)}
                    className="w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Start Production
                  </button>
                ) : (
                  <button
                    onClick={() => handleRefill(c.id)}
                    className="w-full py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Refill to Supermarket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
