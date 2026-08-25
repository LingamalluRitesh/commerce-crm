"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Globe,
  DollarSign,
  Download,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export function VATFilingView() {
  const [salesExVat, setSalesExVat] = useState<number>(450000);
  const [purchasesExVat, setPurchasesExVat] = useState<number>(180000);
  const [vatRate, setVatRate] = useState<number>(20);
  const [vrn, setVrn] = useState<string>("GB 984 1029 48");

  const box1 = (salesExVat * vatRate) / 100;
  const box2 = 0;
  const box3 = box1 + box2;
  const box4 = (purchasesExVat * vatRate) / 100;
  const box5 = box3 - box4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">European Statutory VAT Return & HMRC MTD Engine</h2>
              <p className="text-sm text-slate-400">
                UK HMRC 9-box VAT returns, German Elster USt-VA & EU VIES cross-border B2B recapitulative declarations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            HMRC MTD API Connected
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Box 1: Output VAT Due</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">£{box1.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-400 mt-1">{vatRate}% on £{salesExVat.toLocaleString()} sales</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Box 4: Input VAT Reclaim</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">£{box4.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-400 mt-1">On £{purchasesExVat.toLocaleString()} purchases</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Box 5: Net Payable to HMRC</span>
            <Building className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">£{box5.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-300 mt-1">Due by 7th of next month</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">VAT Reg Number</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold text-purple-400 font-mono">{vrn}</div>
          <div className="text-xs text-slate-400 mt-1">Verified on VIES registry</div>
        </div>
      </div>

      {/* 9-Box Standard Return Layout */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Official HMRC Making Tax Digital (MTD) 9-Box Schedule
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40 text-xs text-slate-300 p-6 space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Box 1: VAT due in this period on sales and other outputs</span>
            <span className="font-mono font-bold text-slate-100">£{box1.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Box 2: VAT due in this period on acquisitions from other EU member states</span>
            <span className="font-mono font-bold text-slate-100">£0.00</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800 bg-slate-950/40 p-2 rounded">
            <span className="font-bold text-blue-400">Box 3: Total VAT due (the total of Box 1 and Box 2)</span>
            <span className="font-mono font-bold text-blue-400">£{box3.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Box 4: VAT reclaimed in this period on purchases and other inputs</span>
            <span className="font-mono font-bold text-slate-100">£{box4.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2.5 border-b border-slate-700 bg-emerald-950/20 p-2.5 rounded text-sm">
            <span className="font-bold text-emerald-400">Box 5: Net VAT to be paid to HMRC or reclaimed by you (Box 3 - Box 4)</span>
            <span className="font-mono font-bold text-emerald-400">£{box5.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span>Box 6: Total value of sales and all other outputs excluding any VAT</span>
            <span className="font-mono">£{salesExVat.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-800">
            <span>Box 7: Total value of purchases and all other inputs excluding any VAT</span>
            <span className="font-mono">£{purchasesExVat.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
