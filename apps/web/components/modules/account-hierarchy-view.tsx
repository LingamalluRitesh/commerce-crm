"use client";

import React, { useState } from "react";
import {
  Network,
  Building,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Globe,
  Layers,
  ArrowRight
} from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  duns: string;
  type: string;
  arr: number;
  credit: number;
  level: number;
}

const NODES: NodeItem[] = [
  { id: "ACC-ROOT-001", name: "Apex Global Conglomerate Inc", duns: "08-192-8491", type: "GLOBAL ULTIMATE PARENT", arr: 500000, credit: 2000000, level: 0 },
  { id: "ACC-REG-EU", name: "Apex EMEA Operations Ltd", duns: "21-849-1029", type: "REGIONAL HQ", arr: 350000, credit: 800000, level: 1 },
  { id: "ACC-SUB-UK", name: "Apex UK Systems Ltd", duns: "33-918-2049", type: "SUBSIDIARY", arr: 120000, credit: 300000, level: 2 },
  { id: "ACC-SUB-DE", name: "Apex Deutschland GmbH", duns: "44-102-9384", type: "SUBSIDIARY", arr: 180000, credit: 400000, level: 2 },
  { id: "ACC-REG-APAC", name: "Apex Asia-Pacific Pte Ltd", duns: "55-291-8472", type: "REGIONAL HQ", arr: 250000, credit: 600000, level: 1 },
];

export function AccountHierarchyView() {
  const [nodes, setNodes] = useState<NodeItem[]>(NODES);

  const totalArr = nodes.reduce((acc, n) => acc + n.arr, 0);
  const totalCredit = nodes.reduce((acc, n) => acc + n.credit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Enterprise Account Hierarchies & Credit Limit Rollup</h2>
              <p className="text-sm text-slate-400">
                Multi-tier parent-subsidiary corporate trees, D-U-N-S hierarchical linkage & consolidated credit risk exposure.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Globe className="h-4 w-4 text-indigo-400" />
            Global D-U-N-S Matched
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Consolidated ARR</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalArr.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Across 5 Global Entities
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Credit Risk Exposure</span>
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${totalCredit.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Global consolidated limit</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hierarchy Depth</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">3 Tiers Deep</div>
          <div className="text-xs text-slate-400 mt-1">Parent &gt; Regional &gt; Sub</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Corporate Structure</span>
            <Building className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Multinational</div>
          <div className="text-xs text-slate-400 mt-1">US, UK, DE, APAC</div>
        </div>
      </div>

      {/* Corporate Tree Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Corporate Entity Tree & Credit Allocations
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40">
          {nodes.map((n) => (
            <div
              key={n.id}
              className="p-4 flex items-center justify-between hover:bg-slate-800/20 transition-colors"
              style={{ paddingLeft: `${n.level * 24 + 16}px` }}
            >
              <div className="flex items-center gap-3">
                {n.level > 0 && <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0" />}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-100">{n.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {n.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    D-U-N-S: {n.duns} • Account ID: {n.id}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-100 text-sm font-mono">${n.arr.toLocaleString()} ARR</div>
                <div className="text-xs text-slate-400 font-mono">${n.credit.toLocaleString()} Credit Limit</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
