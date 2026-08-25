"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  Send,
  Sparkles,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

interface AbandonedCart {
  id: string;
  customerName: string;
  email: string;
  itemsCount: number;
  cartVal: number;
  stage: string;
  minsAgo: number;
  recovered: boolean;
}

const CARTS: AbandonedCart[] = [
  { id: "CART-8912", customerName: "Apex Cloud Infrastructure", email: "procurement@apexcloud.com", itemsCount: 4, cartVal: 18500.0, stage: "PAYMENT_GATEWAY", minsAgo: 25, recovered: false },
  { id: "CART-8913", customerName: "Horizon Health Systems", email: "dev@horizonhealth.org", itemsCount: 2, cartVal: 4800.0, stage: "SHIPPING_STEP", minsAgo: 45, recovered: false },
  { id: "CART-8914", customerName: "Quantum AI Labs", email: "orders@quantumlabs.ai", itemsCount: 1, cartVal: 1200.0, stage: "IDLE_CART", minsAgo: 90, recovered: true },
];

export function CartRecoveryView() {
  const [carts, setCarts] = useState<AbandonedCart[]>(CARTS);

  const totalAtRisk = carts.filter((c) => !c.recovered).reduce((acc, c) => acc + c.cartVal, 0);
  const totalRecovered = carts.filter((c) => c.recovered).reduce((acc, c) => acc + c.cartVal, 0);

  const handleTriggerRecovery = (id: string) => {
    setCarts(carts.map((c) => (c.id === id ? { ...c, recovered: true } : c)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">E-Commerce Cart Abandonment & Omnichannel Salvage Engine</h2>
              <p className="text-sm text-slate-400">
                Exit-intent behavioral triggers, high-value SDR alerts, 3-stage drip sequences & revenue recapture analytics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Sparkles className="h-4 w-4 text-rose-400" />
            Auto-Salvage Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">At-Risk Basket Value</span>
            <DollarSign className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${totalAtRisk.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-rose-300 mt-1">2 carts awaiting dispatch</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recaptured Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${totalRecovered.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-300 mt-1">Via automated coupons</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recovery Win Rate</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">33.3%</div>
          <div className="text-xs text-slate-400 mt-1">Industry avg: 18-22%</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High-Value Cart Threshold</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">$5,000+</div>
          <div className="text-xs text-slate-400 mt-1">Triggers SDR priority call</div>
        </div>
      </div>

      {/* Abandoned Cart Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Abandoned Checkout Sessions
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40">
          {carts.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">{c.id}</span>
                  <h4 className="font-semibold text-sm text-slate-100">{c.customerName}</h4>
                  <span className="text-xs text-slate-400">({c.email})</span>
                  {c.cartVal >= 5000 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                      HIGH-VALUE SDR PRIORITY
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Abandoned at <span className="text-indigo-300 font-medium">{c.stage}</span> • {c.minsAgo} mins ago • {c.itemsCount} items in basket
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="font-mono font-bold text-slate-100 text-sm text-right">
                  ${c.cartVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>

                {c.recovered ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> RECOVERED
                  </span>
                ) : (
                  <button
                    onClick={() => handleTriggerRecovery(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Send className="h-3 w-3" /> Trigger Sequence
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
