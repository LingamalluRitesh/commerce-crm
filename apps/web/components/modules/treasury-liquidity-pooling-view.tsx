"use client";

import React, { useState } from "react";
import {
  Landmark,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle2,
  PieChart,
} from "lucide-react";

interface TreasuryAccountUI {
  id: string;
  entityName: string;
  bank: string;
  currency: string;
  balance: number;
  targetFloat: number;
  sweepAmount: number;
  isMaster: boolean;
}

const SAMPLE_ACCOUNTS: TreasuryAccountUI[] = [
  { id: "ACC-MASTER-US", entityName: "CommerceCRM Holdings Inc (US Master)", bank: "JPMorgan Chase NYC", currency: "USD", balance: 4850000.0, targetFloat: 1000000.0, sweepAmount: 0.0, isMaster: true },
  { id: "ACC-SUB-UK", entityName: "CommerceCRM Ltd (UK Subsidiary)", bank: "Barclays London", currency: "GBP", balance: 340000.0, targetFloat: 50000.0, sweepAmount: 290000.0, isMaster: false },
  { id: "ACC-SUB-EU", entityName: "CommerceCRM GmbH (EU Subsidiary)", bank: "Deutsche Bank Frankfurt", currency: "EUR", balance: 620000.0, targetFloat: 75000.0, sweepAmount: 545000.0, isMaster: false },
  { id: "ACC-SUB-SG", entityName: "CommerceCRM Pte Ltd (APAC Subsidiary)", bank: "DBS Singapore", currency: "USD", balance: 25000.0, targetFloat: 50000.0, sweepAmount: -25000.0, isMaster: false },
];

export function TreasuryLiquidityPoolingView() {
  const [accounts, setAccounts] = useState<TreasuryAccountUI[]>(SAMPLE_ACCOUNTS);
  const [sweepsExecuted, setSweepsExecuted] = useState(false);

  const totalCashUSD = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalSweeps = accounts.filter((a) => !a.isMaster && a.sweepAmount !== 0).length;

  const handleExecuteEODSweeps = () => {
    setSweepsExecuted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Enterprise Treasury Liquidity Pooling & ZBA Sweeps</h2>
              <p className="text-sm text-slate-400">
                Multi-entity cash concentration, automated zero-balance target float & intercompany interest ledger.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> SOFR + 125bps Arm's Length
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Consolidated Cash Pool</span>
          <span className="text-xl font-bold text-slate-100">${totalCashUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">End-of-Day Sweeps Pending</span>
          <span className="text-xl font-bold text-cyan-400">{totalSweeps} Physical Transfers</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Estimated Annualized Interest Gain</span>
          <span className="text-xl font-bold text-emerald-400">+$142,500.00</span>
        </div>
      </div>

      {/* Accounts & Sweep Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-emerald-400" /> Multi-Entity Bank Account Concentration Matrix
          </h3>
          <button
            onClick={handleExecuteEODSweeps}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" /> Execute EOD Sweep & Reconcile
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Entity / Bank</th>
                <th className="py-2 font-medium">Account Role</th>
                <th className="py-2 font-medium text-right">Current Ledger Balance</th>
                <th className="py-2 font-medium text-right">Target Residual Float</th>
                <th className="py-2 font-medium text-right">EOD Sweep Movement</th>
                <th className="py-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accounts.map((a) => (
                <tr key={a.id} className="text-slate-300">
                  <td className="py-3">
                    <span className="font-semibold text-slate-200 block">{a.entityName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{a.bank} • {a.currency}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        a.isMaster
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {a.isMaster ? "MASTER HEADER POOL" : "ZBA PARTICIPANT"}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-slate-100">
                    ${a.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right text-slate-400">
                    ${a.targetFloat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-right font-bold">
                    {a.sweepAmount > 0 ? (
                      <span className="text-emerald-400">↑ Sweep Up +${a.sweepAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : a.sweepAmount < 0 ? (
                      <span className="text-rose-400">↓ Fund Down -${Math.abs(a.sweepAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-slate-500">Header Receiver</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {sweepsExecuted ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold rounded-full">
                        SETTLED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold rounded-full">
                        PENDING EOD
                      </span>
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
