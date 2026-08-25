"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  LineChart,
  Boxes,
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight
} from "lucide-react";

interface SKUForecast {
  sku: string;
  name: string;
  pattern: string;
  mape: number;
  q1Forecast: number;
  q2Forecast: number;
  q3Forecast: number;
  q4Forecast: number;
  safetyStock: number;
}

const FORECASTS: SKUForecast[] = [
  { sku: "SRV-NODE-X9", name: "Compute Blade Node X9", pattern: "Smooth Seasonal", mape: 94.2, q1Forecast: 450, q2Forecast: 520, q3Forecast: 610, q4Forecast: 780, safetyStock: 125 },
  { sku: "RAM-64GB-ECC", name: "64GB DDR5 ECC Memory", pattern: "Linear Trending", mape: 91.8, q1Forecast: 1200, q2Forecast: 1350, q3Forecast: 1500, q4Forecast: 1680, safetyStock: 280 },
  { sku: "PSU-2000W-RED", name: "2000W Platinum PSU", pattern: "Smooth Seasonal", mape: 89.5, q1Forecast: 310, q2Forecast: 360, q3Forecast: 410, q4Forecast: 540, safetyStock: 90 },
  { sku: "FAN-MOD-40MM", name: "40mm Server Fan Module", pattern: "Intermittent Lumpy", mape: 86.4, q1Forecast: 85, q2Forecast: 90, q3Forecast: 110, q4Forecast: 140, safetyStock: 45 },
];

export function DemandForecastingView() {
  const [forecasts, setForecasts] = useState<SKUForecast[]>(FORECASTS);

  const avgMape = (forecasts.reduce((acc, f) => acc + f.mape, 0) / forecasts.length).toFixed(1);
  const totalNextQtr = forecasts.reduce((acc, f) => acc + f.q1Forecast, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <LineChart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Stochastic Demand Forecasting & Safety Stock Optimizer</h2>
              <p className="text-sm text-slate-400">
                Holt-Winters triple exponential smoothing, Croston intermittent demand & 95% confidence bounds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            {avgMape}% Backtested Accuracy
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Model Accuracy (MAPE)</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{avgMape}%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> High precision forecast
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Next Quarter Projected</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{totalNextQtr.toLocaleString()} Units</div>
          <div className="text-xs text-slate-400 mt-1">Q1 2026 expected demand</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dynamic Safety Stock</span>
            <Boxes className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">540 Units Buffer</div>
          <div className="text-xs text-slate-400 mt-1">1.96σ (97.5% service level)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Forecast Horizon</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">4 Quarters</div>
          <div className="text-xs text-slate-400 mt-1">Rolling 12-month horizon</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            SKU Demand Projections & Dynamic Buffer Sizing
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU / Item</th>
                <th className="py-3 px-4 font-semibold">Demand Pattern</th>
                <th className="py-3 px-4 font-semibold text-right">Q1 2026</th>
                <th className="py-3 px-4 font-semibold text-right">Q2 2026</th>
                <th className="py-3 px-4 font-semibold text-right">Q3 2026</th>
                <th className="py-3 px-4 font-semibold text-right">Q4 2026</th>
                <th className="py-3 px-4 font-semibold text-right">Rec. Safety Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {forecasts.map((f) => (
                <tr key={f.sku} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{f.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{f.sku}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {f.pattern}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">{f.q1Forecast}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{f.q2Forecast}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{f.q3Forecast}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{f.q4Forecast}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-cyan-400">{f.safetyStock} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
