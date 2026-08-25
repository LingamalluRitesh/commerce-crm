"use client";

import React, { useState } from "react";
import {
  Package,
  Sparkles,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface BundleOffer {
  id: string;
  name: string;
  modulesCount: number;
  standalonePrice: number;
  bundlePrice: number;
  discount: number;
  grossMargin: number;
  attachLift: string;
}

const BUNDLES: BundleOffer[] = [
  { id: "BNDL-REV-OPS", name: "Revenue Intelligence & CPQ Suite", modulesCount: 4, standalonePrice: 2400, bundlePrice: 1800, discount: 25.0, grossMargin: 84.5, attachLift: "+30.0%" },
  { id: "BNDL-SUPPLY-CHAIN", name: "Global Logistics & Cross-Docking Suite", modulesCount: 5, standalonePrice: 3200, bundlePrice: 2240, discount: 30.0, grossMargin: 81.2, attachLift: "+36.0%" },
  { id: "BNDL-COMPLIANCE", name: "SOC 2 & ISO 27001 ISMS Trust Suite", modulesCount: 3, standalonePrice: 1800, bundlePrice: 1440, discount: 20.0, grossMargin: 89.0, attachLift: "+24.0%" },
];

export function BundlePricingView() {
  const [bundles, setBundles] = useState<BundleOffer[]>(BUNDLES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Submodular Product Bundling & Revenue Optimization</h2>
              <p className="text-sm text-slate-400">
                Cross-elasticity discount optimization, cannibalization guardrails & &gt;70% gross margin gates.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            All Margin Gates Passed (&gt;70%)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Gross Margin</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">84.9%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> High profitability software
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Attach Lift</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">+30.0%</div>
          <div className="text-xs text-slate-400 mt-1">Multi-product adoption</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Bundles</span>
            <Package className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">3 Curated Bundles</div>
          <div className="text-xs text-slate-400 mt-1">Revenue, Logistics, Trust</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Optimal Discount</span>
            <Percent className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">25.0% Blended</div>
          <div className="text-xs text-slate-400 mt-1">Submodular curve fitted</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Curated Enterprise Bundle Catalogs & Margin Economics
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Bundle Catalog Offer</th>
                <th className="py-3 px-4 font-semibold text-center">Modules</th>
                <th className="py-3 px-4 font-semibold text-right">Standalone Price</th>
                <th className="py-3 px-4 font-semibold text-right">Bundle Price</th>
                <th className="py-3 px-4 font-semibold text-right">Effective Discount</th>
                <th className="py-3 px-4 font-semibold text-right">Gross Margin</th>
                <th className="py-3 px-4 font-semibold text-right">Attach Lift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {bundles.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{b.name}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-slate-300">{b.modulesCount} SKUs</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">${b.standalonePrice}/mo</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${b.bundlePrice}/mo
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-purple-400">-{b.discount}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">{b.grossMargin}%</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-cyan-400">{b.attachLift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
