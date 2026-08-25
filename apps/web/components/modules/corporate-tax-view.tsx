"use client";

import React, { useState } from "react";
import {
  Calculator,
  Scale,
  DollarSign,
  TrendingUp,
  FileCheck,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowRight
} from "lucide-react";

export function CorporateTaxView() {
  const preTaxBookIncome = 12500000; // $12.5M
  const nonDeductibleMeals = 120000;
  const taxExemptInterest = 45000;
  const macrsExcessDeprec = 650000; // DTL
  const warrantyReserve = 180000;   // DTA

  const taxableIncome = preTaxBookIncome + nonDeductibleMeals - taxExemptInterest - macrsExcessDeprec + warrantyReserve;
  const statutoryRate = 0.25; // 25% combined
  const currentTaxExp = taxableIncome * statutoryRate;
  const deferredTaxExp = (macrsExcessDeprec - warrantyReserve) * statutoryRate;
  const totalTaxExp = currentTaxExp + deferredTaxExp;
  const etr = ((totalTaxExp / preTaxBookIncome) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Statutory Corporate Income Tax Provision & ASC 740</h2>
              <p className="text-sm text-slate-400">
                Book-to-tax reconciliation, permanent differences, MACRS vs straight-line DTL, and effective tax rate (ETR).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-emerald-400" />
            GAAP ASC 740 Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tax Provision</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalTaxExp / 1000000).toFixed(2)}M</div>
          <div className="text-xs text-slate-400 mt-1">Current + Deferred Tax</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Effective Tax Rate (ETR)</span>
            <PieChart className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">{etr}%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 25.15% GAAP ETR
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deferred Tax Liability</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">${((macrsExcessDeprec * statutoryRate) / 1000).toFixed(0)}k</div>
          <div className="text-xs text-slate-400 mt-1">MACRS accelerated timing</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deferred Tax Asset</span>
            <FileCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">${((warrantyReserve * statutoryRate) / 1000).toFixed(0)}k</div>
          <div className="text-xs text-slate-400 mt-1">Warranty accrual timing</div>
        </div>
      </div>

      {/* Book-to-Tax Reconciliation Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            IRS Form 1120 Schedule M-3 Statutory Reconciliation
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40 text-xs">
          <div className="p-4 flex items-center justify-between font-semibold text-slate-100">
            <span>Pre-Tax GAAP Financial Book Income</span>
            <span className="font-mono text-emerald-400">${preTaxBookIncome.toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center justify-between text-slate-300">
            <span className="pl-4">+ Permanent: Non-Deductible Executive Meals & Fines</span>
            <span className="font-mono text-amber-400">+${nonDeductibleMeals.toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center justify-between text-slate-300">
            <span className="pl-4">- Permanent: Tax-Exempt Municipal Bond Interest</span>
            <span className="font-mono text-cyan-400">-${taxExemptInterest.toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center justify-between text-slate-300">
            <span className="pl-4">- Temporary: Excess MACRS Tax vs Book Depreciation (DTL)</span>
            <span className="font-mono text-purple-400">-${macrsExcessDeprec.toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center justify-between text-slate-300">
            <span className="pl-4">+ Temporary: Book Warranty Reserve Accrual (DTA)</span>
            <span className="font-mono text-indigo-400">+${warrantyReserve.toLocaleString()}</span>
          </div>

          <div className="p-4 flex items-center justify-between font-bold bg-slate-950/60 text-slate-100">
            <span>Taxable Income per IRS Form 1120</span>
            <span className="font-mono text-emerald-400">${taxableIncome.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
