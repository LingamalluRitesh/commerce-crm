"use client";

import React, { useState } from "react";
import {
  Building2,
  GitMerge,
  DollarSign,
  ArrowRightLeft,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Globe,
  PieChart,
  ShieldCheck
} from "lucide-react";

interface EliminationRow {
  id: string;
  description: string;
  debitAcc: string;
  debitName: string;
  creditAcc: string;
  creditName: string;
  amount: number;
  status: "POSTED" | "PENDING_RECONCILIATION";
}

const ELIMINATION_DATA: EliminationRow[] = [
  {
    id: "ELIM-0001",
    description: "Eliminate intercompany inventory sales between US Parent & UK Operations",
    debitAcc: "40100",
    debitName: "Intercompany Revenue Elimination",
    creditAcc: "50200",
    creditName: "Intercompany COGS Elimination",
    amount: 250000.0,
    status: "POSTED"
  },
  {
    id: "ELIM-0002",
    description: "Eliminate intercompany trade receivable/payable accounts balance",
    debitAcc: "20100",
    debitName: "Intercompany Accounts Payable (AP)",
    creditAcc: "11000",
    creditName: "Intercompany Accounts Receivable (AR)",
    amount: 250000.0,
    status: "POSTED"
  },
  {
    id: "ELIM-0003",
    description: "Eliminate unrealized intercompany markup in ending subsidiary inventory",
    debitAcc: "50200",
    debitName: "Consolidated COGS - Unrealized Margin",
    creditAcc: "12000",
    creditName: "Finished Goods Inventory Asset",
    amount: 25000.0,
    status: "POSTED"
  },
  {
    id: "ELIM-0004",
    description: "Eliminate corporate management fee and shared IT infrastructure overhead",
    debitAcc: "40200",
    debitName: "Intercompany Management Fee Income",
    creditAcc: "60300",
    creditName: "Management Fee General & Admin Expense",
    amount: 45000.0,
    status: "POSTED"
  },
  {
    id: "ELIM-0005",
    description: "Eliminate intercompany subordinated loan interest income and financing cost",
    debitAcc: "70100",
    debitName: "Intercompany Interest Revenue",
    creditAcc: "70200",
    creditName: "Intercompany Interest Expense",
    amount: 12500.0,
    status: "POSTED"
  }
];

export function IntercompanyLedgerView() {
  const [rows, setRows] = useState<EliminationRow[]>(ELIMINATION_DATA);
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");

  const totalEliminated = rows.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Multi-Entity Corporate Consolidation & Eliminations</h2>
              <p className="text-sm text-slate-400">
                GAAP ASC 810 / IFRS 10 automated intercompany wash entries, unrealized inventory profit eliminations & CTA balancing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Consolidation Balanced (Debits = Credits)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Eliminated Volume</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalEliminated.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Reconciled
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Legal Entities</span>
            <Globe className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">3 Subsidiaries</div>
          <div className="text-xs text-slate-400 mt-1">US, UK, and Germany (GmbH)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Unrealized Profit Washed</span>
            <PieChart className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">$25,000</div>
          <div className="text-xs text-slate-400 mt-1">Inventory asset reduced to cost</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Journal Entries</span>
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{rows.length} Automated Entries</div>
          <div className="text-xs text-slate-400 mt-1">Posted to general ledger</div>
        </div>
      </div>

      {/* Corporate Structure Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              PARENT HOLDING (100%)
            </span>
            <span className="text-xs font-mono text-slate-400">USD</span>
          </div>
          <h4 className="font-semibold text-slate-100">CommerceCRM Global Holdings Inc.</h4>
          <p className="text-xs text-slate-400 mt-1">Jurisdiction: Delaware, United States</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              OPERATING SUB (100%)
            </span>
            <span className="text-xs font-mono text-slate-400">GBP</span>
          </div>
          <h4 className="font-semibold text-slate-100">CommerceCRM UK Operations Ltd.</h4>
          <p className="text-xs text-slate-400 mt-1">Jurisdiction: England & Wales, UK</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              OPERATING SUB (100%)
            </span>
            <span className="text-xs font-mono text-slate-400">EUR</span>
          </div>
          <h4 className="font-semibold text-slate-100">CommerceCRM Deutschland GmbH</h4>
          <p className="text-xs text-slate-400 mt-1">Jurisdiction: Frankfurt am Main, Germany</p>
        </div>
      </div>

      {/* Elimination Journals Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <GitMerge className="h-4 w-4 text-cyan-400" /> Automated Elimination Journals
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Entry ID</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Debit Account</th>
                <th className="py-3 px-4 font-semibold">Credit Account</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (USD)</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-cyan-400">{r.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-200 max-w-xs">{r.description}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-emerald-400 font-semibold">{r.debitAcc}</span>
                    <div className="text-[11px] text-slate-400">{r.debitName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-blue-400 font-semibold">{r.creditAcc}</span>
                    <div className="text-[11px] text-slate-400">{r.creditName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    ${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> {r.status}
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
