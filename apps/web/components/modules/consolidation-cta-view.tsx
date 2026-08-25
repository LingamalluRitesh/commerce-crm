"use client";

import React, { useState } from "react";
import {
  Globe,
  Coins,
  Scale,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  ArrowRight
} from "lucide-react";

interface SubEntity {
  code: string;
  name: string;
  currency: string;
  spotRate: number;
  assetsUSD: number;
  liabUSD: number;
  ctaUSD: number;
}

const SUBS: SubEntity[] = [
  { code: "UK_LTD", name: "CommerceCRM UK Limited", currency: "GBP (£)", spotRate: 1.285, assetsUSD: 14200000, liabUSD: 6100000, ctaUSD: 240000 },
  { code: "DE_GMBH", name: "CommerceCRM Europe GmbH", currency: "EUR (€)", spotRate: 1.082, assetsUSD: 18500000, liabUSD: 8200000, ctaUSD: -110000 },
  { code: "JP_KK", name: "CommerceCRM Japan K.K.", currency: "JPY (¥)", spotRate: 0.0068, assetsUSD: 9800000, liabUSD: 3900000, ctaUSD: 85000 },
  { code: "SG_PTE", name: "CommerceCRM Asia-Pac Pte", currency: "SGD (S$)", spotRate: 0.745, assetsUSD: 7400000, liabUSD: 2800000, ctaUSD: 42000 },
];

export function ConsolidationCTAView() {
  const [subs, setSubs] = useState<SubEntity[]>(SUBS);

  const totalAssets = subs.reduce((acc, s) => acc + s.assetsUSD, 0) + 45000000; // + Parent US
  const totalLiab = subs.reduce((acc, s) => acc + s.liabUSD, 0) + 18000000;
  const netCTA = subs.reduce((acc, s) => acc + s.ctaUSD, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Global Financial Consolidation & ASC 830 Currency Translation (CTA)</h2>
              <p className="text-sm text-slate-400">
                Multi-entity functional currency remeasurement, Other Comprehensive Income (OCI) CTA & balance sheet rollups.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-emerald-400" />
            Assets = Liabilities + Equity (Balanced)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Group Consolidated Assets</span>
            <Building className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalAssets / 1000000).toFixed(1)}M USD</div>
          <div className="text-xs text-slate-400 mt-1">Parent US + 4 Foreign Subs</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consolidated Liabilities</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${(totalLiab / 1000000).toFixed(1)}M USD</div>
          <div className="text-xs text-slate-400 mt-1">Period-end spot rate translated</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cumulative CTA (OCI)</span>
            <Coins className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">+${(netCTA / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Equity CTA reserve balanced
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Operating Jurisdictions</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">5 Entities</div>
          <div className="text-xs text-slate-400 mt-1">US • UK • DE • JP • SG</div>
        </div>
      </div>

      {/* Subsidiary Consolidation Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Foreign Subsidiary Trial Balance Remeasurement
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Entity</th>
                <th className="py-3 px-4 font-semibold">Functional Currency</th>
                <th className="py-3 px-4 font-semibold text-right">Period Spot Rate</th>
                <th className="py-3 px-4 font-semibold text-right">Translated Assets (USD)</th>
                <th className="py-3 px-4 font-semibold text-right">Translated Liab (USD)</th>
                <th className="py-3 px-4 font-semibold text-right">CTA (OCI Plug)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {subs.map((s) => (
                <tr key={s.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.code}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{s.currency}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">{s.spotRate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    ${(s.assetsUSD / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">
                    ${(s.liabUSD / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {s.ctaUSD >= 0 ? `+$${s.ctaUSD.toLocaleString()}` : `-$${Math.abs(s.ctaUSD).toLocaleString()}`}
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
