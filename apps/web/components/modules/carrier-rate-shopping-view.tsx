"use client";

import React, { useState } from "react";
import {
  Truck,
  DollarSign,
  Clock,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface RateOption {
  carrier: string;
  service: string;
  transit: string;
  base: number;
  fuel: number;
  total: number;
  carbonKg: number;
  isBest: boolean;
}

const RATES: RateOption[] = [
  { carrier: "UPS", service: "UPS Ground Commercial", transit: "2 Business Days", base: 19.10, fuel: 1.95, total: 21.05, carbonKg: 2.3, isBest: true },
  { carrier: "FedEx", service: "FedEx Ground Home Delivery", transit: "2 Business Days", base: 20.00, fuel: 2.10, total: 22.10, carbonKg: 2.4, isBest: false },
  { carrier: "FedEx", service: "FedEx Priority Overnight", transit: "Next Day 10:30 AM", base: 60.00, fuel: 4.50, total: 64.50, carbonKg: 8.5, isBest: false },
  { carrier: "DHL", service: "DHL Express Worldwide", transit: "3 Business Days", base: 85.00, fuel: 6.20, total: 91.20, carbonKg: 12.0, isBest: false },
];

export function CarrierRateShoppingView() {
  const [rates, setRates] = useState<RateOption[]>(RATES);
  const [weight, setWeight] = useState<number>(10.0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-Carrier Rate Shopping & Carbon Offset Engine</h2>
              <p className="text-sm text-slate-400">
                Real-time rate shopping across FedEx, UPS, and DHL with dimensional weight pricing & Scope 3 carbon offsets.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-blue-400" />
            IATA Divisor 139 Dim-Weight
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Optimal Ground Rate</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">$21.05</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> UPS Ground (Lowest Cost)
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fastest Express</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">Next Day 10:30 AM</div>
          <div className="text-xs text-slate-400 mt-1">FedEx Priority Overnight</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Scope 3 Emissions</span>
            <Leaf className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">2.3 kg CO2e</div>
          <div className="text-xs text-slate-400 mt-1">$0.11 carbon offset certified</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Carriers Quoted</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">3 Live APIs</div>
          <div className="text-xs text-slate-400 mt-1">FedEx • UPS • DHL</div>
        </div>
      </div>

      {/* Rate Comparison Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Live Carrier Rate Matrix (Origin: 90210 -&gt; Destination: 10001)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Carrier</th>
                <th className="py-3 px-4 font-semibold">Service Level</th>
                <th className="py-3 px-4 font-semibold">Transit Time</th>
                <th className="py-3 px-4 font-semibold text-right">Base Rate</th>
                <th className="py-3 px-4 font-semibold text-right">Fuel Surcharge</th>
                <th className="py-3 px-4 font-semibold text-right">Total Quoted Rate</th>
                <th className="py-3 px-4 font-semibold text-center">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {rates.map((r) => (
                <tr key={r.service} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100">{r.carrier}</td>
                  <td className="py-3.5 px-4 text-slate-200">{r.service}</td>
                  <td className="py-3.5 px-4 text-slate-400">{r.transit}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${r.base.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">${r.fuel.toFixed(2)}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${r.total.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {r.isBest ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        BEST VALUE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">STANDARD</span>
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
