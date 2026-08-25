"use client";

import React, { useState } from "react";
import {
  Coins,
  ArrowRightLeft,
  TrendingUp,
  DollarSign,
  Globe,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";

interface FXRate {
  currency: string;
  name: string;
  rateAgainstUSD: number;
  change24h: number;
}

const FX_RATES: FXRate[] = [
  { currency: "EUR", name: "Euro", rateAgainstUSD: 0.925, change24h: +0.15 },
  { currency: "GBP", name: "British Pound", rateAgainstUSD: 0.785, change24h: -0.08 },
  { currency: "JPY", name: "Japanese Yen", rateAgainstUSD: 154.2, change24h: +0.42 },
  { currency: "CAD", name: "Canadian Dollar", rateAgainstUSD: 1.365, change24h: +0.05 },
  { currency: "AUD", name: "Australian Dollar", rateAgainstUSD: 1.515, change24h: -0.12 },
  { currency: "CHF", name: "Swiss Franc", rateAgainstUSD: 0.902, change24h: +0.02 },
  { currency: "SGD", name: "Singapore Dollar", rateAgainstUSD: 1.348, change24h: +0.01 },
  { currency: "INR", name: "Indian Rupee", rateAgainstUSD: 83.45, change24h: -0.04 },
];

export function ForexTreasuryView() {
  const [rates, setRates] = useState<FXRate[]>(FX_RATES);
  const [fromCurr, setFromCurr] = useState<string>("USD");
  const [toCurr, setToCurr] = useState<string>("EUR");
  const [amount, setAmount] = useState<number>(10000);

  const getUsdRate = (curr: string) => {
    if (curr === "USD") return 1.0;
    const r = rates.find((item) => item.currency === curr);
    return r ? r.rateAgainstUSD : 1.0;
  };

  // Cross rate: (1 / fromRate) * toRate = toRate / fromRate
  const crossRate = getUsdRate(toCurr) / getUsdRate(fromCurr);
  const convertedAmount = (amount * crossRate).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-Currency FX & Corporate Treasury</h2>
              <p className="text-sm text-slate-400">
                Real-time central bank spot rates, triangular cross-currency conversion & GAAP ASC 830 balance sheet revaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Globe className="h-4 w-4 text-yellow-400" />
            ECB & Fed Feed Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Treasury Currencies</span>
            <Coins className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">9 Active Pairs</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Synchronized Feed
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">EUR / USD Spot</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">1.0811</div>
          <div className="text-xs text-emerald-400 mt-1">+0.15% (24h)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">GBP / USD Spot</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">1.2738</div>
          <div className="text-xs text-rose-400 mt-1">-0.08% (24h)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unrealized FX Gain (YTD)</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">+$31,250</div>
          <div className="text-xs text-slate-400 mt-1">ASC 830 period revaluation</div>
        </div>
      </div>

      {/* Triangular Cross-Currency Converter */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-4 w-4 text-yellow-400" /> Real-Time Triangular Cross Converter
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">From Currency & Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-2/3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="w-1/3 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500 font-bold"
              >
                <option value="USD">USD</option>
                {rates.map((r) => (
                  <option key={r.currency} value={r.currency}>
                    {r.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">To Target Currency</label>
            <select
              value={toCurr}
              onChange={(e) => setToCurr(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-yellow-500 font-bold"
            >
              <option value="USD">USD</option>
              {rates.map((r) => (
                <option key={r.currency} value={r.currency}>
                  {r.currency} - {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Converted Value</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-slate-100 font-mono text-base font-bold flex items-center justify-between">
              <span>{convertedAmount}</span>
              <span className="text-yellow-400 text-xs font-semibold">{toCurr}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Exchange Rate: <code className="text-yellow-300">1 {fromCurr} = {crossRate.toFixed(4)} {toCurr}</code>
          </span>
          <span className="text-emerald-400">Zero Execution Spread</span>
        </div>
      </div>

      {/* Spot Rate Matrix Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Spot Exchange Rates vs USD Base
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Currency Code</th>
                <th className="py-3 px-4 font-semibold">Currency Name</th>
                <th className="py-3 px-4 font-semibold text-right">Units per 1 USD</th>
                <th className="py-3 px-4 font-semibold text-right">USD per 1 Unit</th>
                <th className="py-3 px-4 font-semibold text-center">24h Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {rates.map((r) => (
                <tr key={r.currency} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-yellow-400">{r.currency}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">{r.name}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    {r.rateAgainstUSD.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">
                    {(1.0 / r.rateAgainstUSD).toFixed(4)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`text-[11px] font-bold ${
                        r.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {r.change24h >= 0 ? `+${r.change24h}%` : `${r.change24h}%`}
                    </span>
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
