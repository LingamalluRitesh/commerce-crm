"use client";

import React, { useState } from "react";
import {
  CreditCard,
  RefreshCw,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export function SubscriptionLifecycleView() {
  const [currentSeats, setCurrentSeats] = useState<number>(10);
  const [newSeats, setNewSeats] = useState<number>(25);
  const [seatPrice, setSeatPrice] = useState<number>(50);
  const [daysRemaining, setDaysRemaining] = useState<number>(20);
  const [totalDays, setTotalDays] = useState<number>(30);

  // Proration calculation:
  // credit_old = (currentSeats * seatPrice / totalDays) * daysRemaining
  // charge_new = (newSeats * seatPrice / totalDays) * daysRemaining
  const creditOld = ((currentSeats * seatPrice) / totalDays) * daysRemaining;
  const chargeNew = ((newSeats * seatPrice) / totalDays) * daysRemaining;
  const netDueToday = Math.max(0, chargeNew - creditOld);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Enterprise SaaS Subscription & Proration Engine</h2>
              <p className="text-sm text-slate-400">
                Mid-cycle seat additions, exact day/second proration netting, multi-cadence renewals & smart dunning retry sequences.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Active Stripe Billing Engine
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Current MRR</span>
            <DollarSign className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(currentSeats * seatPrice).toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">{currentSeats} seats × ${seatPrice}/mo</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">New Projected MRR</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${(newSeats * seatPrice).toLocaleString()}</div>
          <div className="text-xs text-indigo-300 mt-1">+{newSeats - currentSeats} new enterprise seats</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unused Plan Credit</span>
            <RefreshCw className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">-${creditOld.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1">{daysRemaining} days remaining in cycle</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Immediate Prorated Due</span>
            <CreditCard className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${netDueToday.toFixed(2)}</div>
          <div className="text-xs text-emerald-300 mt-1">Billed immediately on card</div>
        </div>
      </div>

      {/* Interactive Proration Simulator */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Mid-Cycle Subscription Seat Upgrade Simulator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Current Active Seats</label>
            <input
              type="number"
              value={currentSeats}
              onChange={(e) => setCurrentSeats(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Target Upgraded Seats</label>
            <input
              type="number"
              value={newSeats}
              onChange={(e) => setNewSeats(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Seat Unit Price ($/mo)</label>
            <input
              type="number"
              value={seatPrice}
              onChange={(e) => setSeatPrice(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Days Remaining in Period</label>
            <input
              type="number"
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="text-slate-400">
            Proration Formula: <code className="text-violet-300">Net = (New_Rate × Days) - (Old_Rate × Days)</code>
          </div>
          <div className="font-semibold text-slate-200">
            Net Proration Charge Today: <span className="text-emerald-400 text-sm font-bold font-mono">${netDueToday.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
