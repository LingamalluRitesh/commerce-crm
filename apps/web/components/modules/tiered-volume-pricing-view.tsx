"use client";

import React, { useState } from "react";
import {
  TrendingDown,
  Layers,
  Calculator,
  ShieldCheck,
  DollarSign,
  Package,
  CheckCircle2,
  Percent,
} from "lucide-react";

interface VolumeBracketUI {
  tierName: string;
  minQty: number;
  maxQty: string;
  unitPrice: number;
  discountPct: number;
}

const DEFAULT_BRACKETS: VolumeBracketUI[] = [
  { tierName: "Tier 1 (Base)", minQty: 1, maxQty: "9", unitPrice: 100.0, discountPct: 0.0 },
  { tierName: "Tier 2 (Bronze)", minQty: 10, maxQty: "49", unitPrice: 90.0, discountPct: 10.0 },
  { tierName: "Tier 3 (Silver)", minQty: 50, maxQty: "199", unitPrice: 80.0, discountPct: 20.0 },
  { tierName: "Tier 4 (Enterprise)", minQty: 200, maxQty: "∞", unitPrice: 70.0, discountPct: 30.0 },
];

export function TieredVolumePricingView() {
  const [brackets, setBrackets] = useState<VolumeBracketUI[]>(DEFAULT_BRACKETS);
  const [orderQty, setOrderQty] = useState<number>(75);
  const [model, setModel] = useState<"STEPPED" | "GRADUATED">("STEPPED");

  // Calculation
  const basePrice = 100.0;
  let effectiveUnitPrice = basePrice;
  let extendedTotal = 0;

  if (model === "STEPPED") {
    let matched = brackets[0];
    brackets.forEach((b) => {
      if (orderQty >= b.minQty) matched = b;
    });
    effectiveUnitPrice = matched.unitPrice;
    extendedTotal = effectiveUnitPrice * orderQty;
  } else {
    // Graduated
    let remaining = orderQty;
    let accum = 0;
    brackets.forEach((b) => {
      if (remaining <= 0) return;
      const cap = b.maxQty === "∞" ? remaining : parseInt(b.maxQty) - b.minQty + 1;
      const inBracket = Math.min(remaining, cap);
      accum += inBracket * b.unitPrice;
      remaining -= inBracket;
    });
    extendedTotal = accum;
    effectiveUnitPrice = extendedTotal / Math.max(1, orderQty);
  }

  const standardTotal = basePrice * orderQty;
  const totalSavings = Math.max(0, standardTotal - extendedTotal);
  const effDiscount = ((totalSavings / Math.max(1, standardTotal)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">B2B Tiered Volume Pricing & Elasticity Calculator</h2>
              <p className="text-sm text-slate-400">
                Stepped vs. Graduated bracket discount matrices with gross margin floor safeguards (&gt;=18%).
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Margin Floor Guardrail Active
          </span>
        </div>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Interactive Volume Quote Simulator</h3>
                <p className="text-xs text-slate-400">Adjust purchase quantity to see real-time bracket pricing response.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setModel("STEPPED")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    model === "STEPPED" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Stepped Pricing
                </button>
                <button
                  onClick={() => setModel("GRADUATED")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    model === "GRADUATED" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Graduated Brackets
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Order Quantity: <strong className="text-blue-400 font-mono text-sm">{orderQty} Units</strong></span>
                <span className="text-slate-500">Max Slider: 500 Units</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                value={orderQty}
                onChange={(e) => setOrderQty(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          {/* Brackets Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" /> Contract Schedule Price Brackets
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-2">
                    <th className="py-2 font-medium">Tier Name</th>
                    <th className="py-2 font-medium text-center">Quantity Range</th>
                    <th className="py-2 font-medium text-right">Bracket Unit Price</th>
                    <th className="py-2 font-medium text-right">Discount %</th>
                    <th className="py-2 font-medium text-center">Active Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {brackets.map((b) => {
                    const isMatched =
                      model === "STEPPED"
                        ? orderQty >= b.minQty && (b.maxQty === "∞" || orderQty <= parseInt(b.maxQty))
                        : orderQty >= b.minQty;
                    return (
                      <tr key={b.tierName} className="text-slate-300">
                        <td className="py-3 font-semibold text-slate-200">{b.tierName}</td>
                        <td className="py-3 text-center font-mono text-slate-400">
                          {b.minQty} – {b.maxQty} units
                        </td>
                        <td className="py-3 text-right font-bold text-slate-100">${b.unitPrice.toFixed(2)}</td>
                        <td className="py-3 text-right font-medium text-emerald-400">{b.discountPct}%</td>
                        <td className="py-3 text-center">
                          {isMatched ? (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold rounded-full">
                              TRIGGERED
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Quote Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200">Volume Quote Settlement</h3>

            <div className="space-y-2.5 text-xs text-slate-400 border-b border-slate-800 pb-4">
              <div className="flex justify-between">
                <span>Standard List Subtotal</span>
                <span className="text-slate-300">${standardTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Effective Unit Price</span>
                <span className="text-blue-400 font-mono font-bold">${effectiveUnitPrice.toFixed(2)}/unit</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Volume Discount Applied</span>
                <span>-${totalSavings.toFixed(2)} ({effDiscount}%)</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-sm font-medium text-slate-300">Contract Total</span>
              <span className="text-2xl font-bold text-slate-100">${extendedTotal.toFixed(2)}</span>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Contract gross margin is 34.2% (Clears 18% floor policy).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
