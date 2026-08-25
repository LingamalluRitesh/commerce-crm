"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  DollarSign,
  TrendingUp,
  Scale,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowRight
} from "lucide-react";

export function FinancialStatementsView() {
  const [activeTab, setActiveTab] = useState<"BALANCE_SHEET" | "INCOME_STATEMENT" | "CASH_FLOW">("BALANCE_SHEET");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">GAAP Statutory Financial Statements</h2>
              <p className="text-sm text-slate-400">
                Consolidated Balance Sheet, Multi-Step Income Statement & Indirect Method Statement of Cash Flows.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            GAAP Audit Ready (Unqualified Opinion)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Consolidated Assets</span>
            <Scale className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">$1,200,000</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Balanced = Liab + Equity
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Revenue (TTM)</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">$3,450,000</div>
          <div className="text-xs text-indigo-300 mt-1">+34.2% YoY growth</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Profit Margin</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">74.2%</div>
          <div className="text-xs text-slate-400 mt-1">SaaS & Hardware blended</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Operating Cash Flow</span>
            <PieChart className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">+$680,000</div>
          <div className="text-xs text-purple-300 mt-1">Positive free cash flow</div>
        </div>
      </div>

      {/* Financial Statement Tabs */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex gap-2">
          <button
            onClick={() => setActiveTab("BALANCE_SHEET")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              activeTab === "BALANCE_SHEET"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            Classified Balance Sheet
          </button>
          <button
            onClick={() => setActiveTab("INCOME_STATEMENT")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              activeTab === "INCOME_STATEMENT"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            Multi-Step Income Statement
          </button>
          <button
            onClick={() => setActiveTab("CASH_FLOW")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
              activeTab === "CASH_FLOW"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            Statement of Cash Flows
          </button>
        </div>

        <div className="p-6">
          {activeTab === "BALANCE_SHEET" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Assets */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex justify-between">
                  <span>Assets</span>
                  <span>USD</span>
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="font-semibold text-emerald-400">Current Assets</div>
                  <div className="flex justify-between pl-3"><span>Cash & Cash Equivalents</span><span className="font-mono">$500,000</span></div>
                  <div className="flex justify-between pl-3"><span>Accounts Receivable (AR)</span><span className="font-mono">$150,000</span></div>
                  <div className="flex justify-between pl-3"><span>Finished Goods Inventory</span><span className="font-mono">$200,000</span></div>
                  <div className="flex justify-between pl-3"><span>Prepaid Software & Insurance</span><span className="font-mono">$25,000</span></div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800">
                    <span>Total Current Assets</span><span className="font-mono">$875,000</span>
                  </div>

                  <div className="font-semibold text-emerald-400 pt-3">Non-Current Assets</div>
                  <div className="flex justify-between pl-3"><span>Property, Plant & Equipment (Gross)</span><span className="font-mono">$400,000</span></div>
                  <div className="flex justify-between pl-3 text-rose-400"><span>Less: Accumulated Depreciation</span><span className="font-mono">($75,000)</span></div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800">
                    <span>Net PP&E</span><span className="font-mono">$325,000</span>
                  </div>

                  <div className="flex justify-between font-bold text-sm text-emerald-400 pt-3 border-t-2 border-slate-700">
                    <span>Total Assets</span><span className="font-mono">$1,200,000</span>
                  </div>
                </div>
              </div>

              {/* Liabilities & Equity */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 flex justify-between">
                  <span>Liabilities & Shareholders' Equity</span>
                  <span>USD</span>
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="font-semibold text-blue-400">Current Liabilities</div>
                  <div className="flex justify-between pl-3"><span>Accounts Payable (AP)</span><span className="font-mono">$120,000</span></div>
                  <div className="flex justify-between pl-3"><span>Accrued Payroll & Taxes</span><span className="font-mono">$30,000</span></div>
                  <div className="flex justify-between pl-3"><span>Deferred Subscription Revenue</span><span className="font-mono">$150,000</span></div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800">
                    <span>Total Current Liabilities</span><span className="font-mono">$300,000</span>
                  </div>

                  <div className="font-semibold text-blue-400 pt-3">Long-Term Liabilities</div>
                  <div className="flex justify-between pl-3"><span>Term Debt Note (5-Year)</span><span className="font-mono">$200,000</span></div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800">
                    <span>Total Liabilities</span><span className="font-mono">$500,000</span>
                  </div>

                  <div className="font-semibold text-purple-400 pt-3">Shareholders' Equity</div>
                  <div className="flex justify-between pl-3"><span>Common Stock & APIC</span><span className="font-mono">$500,000</span></div>
                  <div className="flex justify-between pl-3"><span>Retained Earnings</span><span className="font-mono">$200,000</span></div>
                  <div className="flex justify-between font-bold text-slate-100 pt-1 border-t border-slate-800">
                    <span>Total Equity</span><span className="font-mono">$700,000</span>
                  </div>

                  <div className="flex justify-between font-bold text-sm text-emerald-400 pt-3 border-t-2 border-slate-700">
                    <span>Total Liabilities & Equity</span><span className="font-mono">$1,200,000</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "INCOME_STATEMENT" && (
            <div className="max-w-2xl mx-auto space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 font-bold text-sm text-slate-100">
                <span>Gross Subscription & Hardware Revenue</span><span className="font-mono">$3,450,000</span>
              </div>
              <div className="flex justify-between py-1 text-rose-400 pl-3">
                <span>Cost of Goods Sold (COGS)</span><span className="font-mono">($890,000)</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold text-emerald-400 border-t border-b border-slate-800">
                <span>Gross Profit (74.2% Margin)</span><span className="font-mono">$2,560,000</span>
              </div>

              <div className="pt-2 font-semibold text-slate-200">Operating Expenses (OpEx)</div>
              <div className="flex justify-between py-1 pl-3"><span>Research & Development (R&D)</span><span className="font-mono">$780,000</span></div>
              <div className="flex justify-between py-1 pl-3"><span>Sales & Marketing (S&M)</span><span className="font-mono">$650,000</span></div>
              <div className="flex justify-between py-1 pl-3"><span>General & Administrative (G&A)</span><span className="font-mono">$340,000</span></div>
              <div className="flex justify-between py-1.5 font-bold text-slate-100 border-t border-slate-800">
                <span>Total Operating Expenses</span><span className="font-mono">$1,770,000</span>
              </div>

              <div className="flex justify-between py-2 font-bold text-sm text-cyan-400 border-t-2 border-slate-700">
                <span>Operating Income (EBITDA)</span><span className="font-mono">$790,000</span>
              </div>
            </div>
          )}

          {activeTab === "CASH_FLOW" && (
            <div className="max-w-2xl mx-auto space-y-2 text-xs text-slate-300">
              <div className="font-semibold text-emerald-400">Cash Flows from Operating Activities (Indirect)</div>
              <div className="flex justify-between py-1 pl-3 font-bold text-slate-100"><span>Net Income</span><span className="font-mono">$640,000</span></div>
              <div className="flex justify-between py-1 pl-3 text-slate-400"><span>Depreciation & Amortization Add-Back</span><span className="font-mono">+$75,000</span></div>
              <div className="flex justify-between py-1 pl-3 text-slate-400"><span>Change in Accounts Receivable</span><span className="font-mono">-$35,000</span></div>
              <div className="flex justify-between py-1 pl-3 text-slate-400"><span>Change in Deferred Revenue</span><span className="font-mono">+$45,000</span></div>
              <div className="flex justify-between py-1.5 font-bold text-emerald-400 border-t border-slate-800">
                <span>Net Cash Provided by Operating Activities</span><span className="font-mono">+$725,000</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
