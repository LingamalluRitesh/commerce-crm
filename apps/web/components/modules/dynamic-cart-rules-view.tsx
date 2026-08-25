"use client";

import React, { useState } from "react";
import {
  Tag,
  Percent,
  DollarSign,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface PromoRule {
  code: string;
  name: string;
  type: string;
  minSpend: number;
  discount: string;
  stackable: boolean;
}

const PROMOS: PromoRule[] = [
  { code: "TIERED-5K", name: "Enterprise Volume Tier ($5k+)", type: "Fixed Tiered", minSpend: 5000, discount: "$750 Off", stackable: true },
  { code: "FREESHIP-EXP", name: "Free Expedited Air Freight", type: "Free Freight", minSpend: 2000, discount: "100% Free Shipping", stackable: true },
  { code: "CLOUD-SAVE-15", name: "Q3 Cloud Hardware Incentive", type: "Percentage", minSpend: 1000, discount: "15% Off", stackable: false },
];

export function DynamicCartRulesView() {
  const [promos, setPromos] = useState<PromoRule[]>(PROMOS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Dynamic Cart Promotions & Tiered Coupon Stacking Engine</h2>
              <p className="text-sm text-slate-400">
                Order-level percentage discounts, spend tier milestones, BOGO rules & stackability guardrails.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Zero Stacking Conflicts
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Promo Campaigns</span>
            <Tag className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">3 Active Rules</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Margin floors enforced
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Cart Conversion Lift</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">+22.8%</div>
          <div className="text-xs text-slate-400 mt-1">Tiered incentive threshold</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Freight Cost Savings</span>
            <Truck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$185 / order</div>
          <div className="text-xs text-slate-400 mt-1">Automated shipping waiver</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rule Evaluation SLA</span>
            <Percent className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">&lt;1.2 ms</div>
          <div className="text-xs text-slate-400 mt-1">In-memory cart evaluator</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Active Promotion Rules & Eligibility Criteria
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Promo Code</th>
                <th className="py-3 px-4 font-semibold">Promotion Name</th>
                <th className="py-3 px-4 font-semibold">Discount Type</th>
                <th className="py-3 px-4 font-semibold text-right">Min Cart Spend</th>
                <th className="py-3 px-4 font-semibold text-right">Discount Benefit</th>
                <th className="py-3 px-4 font-semibold text-center">Stackable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {promos.map((p) => (
                <tr key={p.code} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{p.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{p.type}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${p.minSpend.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-indigo-400">{p.discount}</td>
                  <td className="py-3.5 px-4 text-center">
                    {p.stackable ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        YES (STACKABLE)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">EXCLUSIVE</span>
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
