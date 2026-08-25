"use client";

import React, { useState } from "react";
import {
  Calculator,
  Scale,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  FileCheck
} from "lucide-react";

interface ContractAssessment {
  id: string;
  customer: string;
  fixedBase: number;
  variableEst: number;
  isConstrained: boolean;
  recognizedPrice: number;
  deferredReserve: number;
}

const CONTRACTS: ContractAssessment[] = [
  { id: "CNT-SaaS-901", customer: "Fortune 50 Enterprise Bank", fixedBase: 500000, variableEst: 150000, isConstrained: false, recognizedPrice: 650000, deferredReserve: 0 },
  { id: "CNT-GOV-802", customer: "Department of Transportation", fixedBase: 350000, variableEst: 120000, isConstrained: true, recognizedPrice: 410000, deferredReserve: 60000 },
  { id: "CNT-HLTH-703", customer: "United Health System", fixedBase: 420000, variableEst: 80000, isConstrained: false, recognizedPrice: 500000, deferredReserve: 0 },
];

export function VariableConsiderationView() {
  const [contracts, setContracts] = useState<ContractAssessment[]>(CONTRACTS);

  const totalRecognized = contracts.reduce((acc, c) => acc + c.recognizedPrice, 0);
  const totalDeferred = contracts.reduce((acc, c) => acc + c.deferredReserve, 0);

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
              <h2 className="text-xl font-bold text-slate-100">ASC 606 Variable Consideration & Constraint Evaluation</h2>
              <p className="text-sm text-slate-400">
                Expected Value & Most Likely Amount estimation with significant revenue reversal constraint protection.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-emerald-400" />
            ASC 606 Probable Rule Enforced
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Recognized Transaction Price</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalRecognized / 1000000).toFixed(2)}M USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Compliant with GAAP ASC 606
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deferred Reversal Reserve</span>
            <Scale className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${(totalDeferred / 1000).toFixed(0)}k USD</div>
          <div className="text-xs text-slate-400 mt-1">Constrained contingency buffer</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Contracts</span>
            <FileCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">3 Enterprise Deals</div>
          <div className="text-xs text-slate-400 mt-1">Milestone & performance tiered</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Constraint Rate</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">33.3%</div>
          <div className="text-xs text-slate-400 mt-1">1 of 3 contracts constrained</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Contract Variable Consideration Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Contract / Account</th>
                <th className="py-3 px-4 font-semibold text-right">Fixed Fee (USD)</th>
                <th className="py-3 px-4 font-semibold text-right">Variable Estimate</th>
                <th className="py-3 px-4 font-semibold text-center">Constraint Status</th>
                <th className="py-3 px-4 font-semibold text-right">Recognized Revenue</th>
                <th className="py-3 px-4 font-semibold text-right">Deferred Reserve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{c.customer}</div>
                    <div className="text-[11px] font-mono text-slate-400">{c.id}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${c.fixedBase.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">${c.variableEst.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-center">
                    {c.isConstrained ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        CONSTRAINED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        UNCONSTRAINED
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${c.recognizedPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-indigo-400">
                    ${c.deferredReserve.toLocaleString()}
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
