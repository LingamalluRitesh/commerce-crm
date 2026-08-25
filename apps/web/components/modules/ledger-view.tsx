"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Scale,
  DollarSign,
  TrendingUp,
  Hash,
  ArrowUpRight,
  Plus
} from "lucide-react";

export function LedgerView() {
  const [activeTab, setActiveTab] = useState<"journal" | "trial_balance" | "asc606">("journal");

  const [entries, setEntries] = useState([
    {
      id: "JE-2026-0001",
      date: "2026-08-01",
      source: "MEMORANDUM-OPENING",
      desc: "Initial corporate ledger capitalization and cloud reserve",
      hash: "0x8fa91283eac901823df9012384a1239bca01923841029384",
      lines: [
        { acc: "10100", name: "Operating Cash - USD Checking", dr: 250000.0, cr: 0.0 },
        { acc: "12000", name: "Finished Goods Inventory Asset", dr: 85000.0, cr: 0.0 },
        { acc: "30100", name: "Common Stock - Par Value", dr: 0.0, cr: 100000.0 },
        { acc: "30200", name: "Additional Paid-In Capital (APIC)", dr: 0.0, cr: 235000.0 },
      ]
    },
    {
      id: "JE-2026-0002",
      date: "2026-08-15",
      source: "INV-2026-0042",
      desc: "Enterprise SaaS Annual Subscription Invoice & Deferred Revenue Recognition",
      hash: "0x7ba019238bfe9012384a0129384cda019238410293841209",
      lines: [
        { acc: "11000", name: "Accounts Receivable - Trade", dr: 120000.0, cr: 0.0 },
        { acc: "23000", name: "Deferred SaaS Revenue (ASC 606)", dr: 0.0, cr: 120000.0 },
      ]
    }
  ]);

  const trialBalanceRows = [
    { acc: "10100", name: "Operating Cash - USD Checking", dr: 250000.0, cr: 0.0 },
    { acc: "11000", name: "Accounts Receivable - Trade", dr: 120000.0, cr: 0.0 },
    { acc: "12000", name: "Finished Goods Inventory Asset", dr: 85000.0, cr: 0.0 },
    { acc: "23000", name: "Deferred SaaS Revenue (ASC 606)", dr: 0.0, cr: 120000.0 },
    { acc: "30100", name: "Common Stock - Par Value", dr: 0.0, cr: 100000.0 },
    { acc: "30200", name: "Additional Paid-In Capital (APIC)", dr: 0.0, cr: 235000.0 },
  ];

  const totalDr = trialBalanceRows.reduce((s, r) => s + r.dr, 0);
  const totalCr = trialBalanceRows.reduce((s, r) => s + r.cr, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              General Ledger & Audit
            </span>
            <span className="text-xs text-slate-400">GAAP / IFRS Double-Entry Accounting</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">General Ledger & Trial Balance</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Balanced double-entry journal postings, cryptographic SHA-256 hash chains, and ASC 606 revenue amortization schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "journal" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Journal Postings
          </button>
          <button
            onClick={() => setActiveTab("trial_balance")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "trial_balance" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Trial Balance
          </button>
          <button
            onClick={() => setActiveTab("asc606")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "asc606" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            ASC 606 SaaS RevRec
          </button>
        </div>
      </div>

      {/* TAB 1: JOURNAL POSTINGS */}
      {activeTab === "journal" && (
        <div className="space-y-4">
          {entries.map((je, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-indigo-300">{je.id}</span>
                  <span className="text-xs text-slate-400">{je.date}</span>
                  <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">{je.source}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <Hash className="w-3 h-3 text-indigo-400" />
                  <span>{je.hash.slice(0, 18)}...{je.hash.slice(-8)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">{je.desc}</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-400">
                      <th className="py-2 px-3">Account Code</th>
                      <th className="py-2 px-3">Account Name</th>
                      <th className="py-2 px-3 text-right">Debit ($)</th>
                      <th className="py-2 px-3 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50 font-mono">
                    {je.lines.map((line, lIdx) => (
                      <tr key={lIdx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-indigo-400">{line.acc}</td>
                        <td className="py-2 px-3 font-sans text-slate-300">{line.name}</td>
                        <td className="py-2 px-3 text-right text-emerald-400">{line.dr > 0 ? line.dr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}</td>
                        <td className="py-2 px-3 text-right text-amber-400">{line.cr > 0 ? line.cr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TRIAL BALANCE */}
      {activeTab === "trial_balance" && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Consolidated Trial Balance Sheet (Zero-Sum Verified)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Balanced: Debits = Credits
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Account Number</th>
                  <th className="py-2.5 px-3">General Ledger Account Name</th>
                  <th className="py-2.5 px-3 text-right">Debit Balance ($)</th>
                  <th className="py-2.5 px-3 text-right">Credit Balance ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {trialBalanceRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-indigo-400 font-bold">{r.acc}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-200">{r.name}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{r.dr > 0 ? r.dr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">{r.cr > 0 ? r.cr.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "-"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700 font-bold text-xs bg-slate-950 font-mono">
                  <td colSpan={2} className="py-3 px-3 text-white font-sans">TOTAL PERIOD SUM:</td>
                  <td className="py-3 px-3 text-right text-emerald-400">${totalDr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 px-3 text-right text-amber-400">${totalCr.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ASC 606 REVENUE AMORTIZATION */}
      {activeTab === "asc606" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              5-Step ASC 606 Contract Revenue Amortization
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-800/60 flex justify-between">
                <div>
                  <span className="font-semibold text-white">Contract #CON-2026-9041 (Global Logistics Enterprise)</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Annual SaaS Platform + 24/7 Mission Critical SLA</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-400 font-bold text-sm">$120,000.00</span>
                  <p className="text-[11px] text-slate-400">Total Contract Value</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Recognized Revenue to Date:</span>
                  <span className="font-bold text-emerald-400">$32,876.71</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Remaining Deferred Revenue Liability (Account 23000):</span>
                  <span className="font-bold text-amber-400">$87,123.29</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Daily Straight-Line Amortization Run Rate:</span>
                  <span className="font-bold text-white">$328.77 / day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
