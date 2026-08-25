"use client";

import React, { useState } from "react";
import {
  Anchor,
  FileCheck,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  TrendingUp,
  ArrowRight
} from "lucide-react";

export function CustomsBrokerageView() {
  const [annualDuties, setAnnualDuties] = useState<number>(380000);

  // 10% CBP bond calculation rounded up to $10k, minimum $50k
  const tenPct = annualDuties * 0.10;
  const bondAmount = Math.max(50000, Math.ceil(tenPct / 10000) * 10000);
  const annualPremium = bondAmount * 0.008; // 0.8%

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
              <Anchor className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">US Customs Brokerage & ISF 10+2 Ocean Security Filing</h2>
              <p className="text-sm text-slate-400">
                Statutory CBP 24-hour advance cargo declarations, ACE Entry Summary (Form 7501) & Continuous Import Bond calculator.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            ACE ABI Automated Link Active
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Required Continuous Bond</span>
            <ShieldCheck className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${bondAmount.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 10% CBP Compliant
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Surety Premium</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${annualPremium.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-400 mt-1">0.8% underwritten rate</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ISF 10+2 Compliance</span>
            <FileCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">100% On-Time</div>
          <div className="text-xs text-slate-400 mt-1">Filed &gt; 24h before lading</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Annual Duty / Tax Base</span>
            <Building className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">${annualDuties.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Trailing 12 months</div>
        </div>
      </div>

      {/* Bond Calculator Slider */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Statutory CBP Continuous Import Bond Size Calculator
        </h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-slate-400">Estimated Annual Duties, Taxes & Fees Paid to CBP ($)</label>
              <span className="font-mono font-bold text-sky-400">${annualDuties.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="2000000"
              step="10000"
              value={annualDuties}
              onChange={(e) => setAnnualDuties(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              Formula: <code className="text-sky-300">Bond = Max($50,000, Ceil(Annual_Duties × 10%, $10,000))</code>
            </div>
            <div className="font-semibold text-slate-200">
              Required Continuous Bond: <span className="font-mono text-emerald-400 text-sm font-bold">${bondAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
