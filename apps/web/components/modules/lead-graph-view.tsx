"use client";

import React, { useState } from "react";
import {
  Network,
  Users,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  ArrowRight
} from "lucide-react";

interface Stakeholder {
  id: string;
  name: string;
  role: "ECONOMIC_BUYER" | "TECHNICAL_EVALUATOR" | "CHAMPION" | "PROCUREMENT";
  sentiment: string;
  influence: string;
}

const STAKEHOLDERS: Stakeholder[] = [
  { id: "ST-01", name: "David Henderson (CTO)", role: "ECONOMIC_BUYER", sentiment: "Strong Advocate (+0.9)", influence: "Final Decision Maker" },
  { id: "ST-02", name: "Rachel Chen (VP Eng)", role: "TECHNICAL_EVALUATOR", sentiment: "Positive (+0.7)", influence: "High Technical Weight" },
  { id: "ST-03", name: "Liam O'Connor (DevOps Lead)", role: "CHAMPION", sentiment: "Internal Sponsor (+1.0)", influence: "User Advocate" },
  { id: "ST-04", name: "Jessica Taylor (Legal Counsel)", role: "PROCUREMENT", sentiment: "Neutral (+0.2)", influence: "Contract MSA Signer" },
];

export function LeadGraphView() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(STAKEHOLDERS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">B2B Knowledge Graph Entity Resolution & Buying Committee</h2>
              <p className="text-sm text-slate-400">
                Corporate hierarchy mapping, multi-threaded stakeholder consensus, technographic signals & win probability scoring.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            High Win Probability (91%)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Account</span>
            <Building className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-slate-100">Apex Silicon Corp</div>
          <div className="text-xs text-slate-400 mt-1">Parent: Apex Global Holdings</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Multi-Threading Depth</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">4 Mapped</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Economic Buyer Confirmed
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Committee Sentiment</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">+0.82 High</div>
          <div className="text-xs text-slate-400 mt-1">Weighted positive alignment</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Technographic Match</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">100% Fit</div>
          <div className="text-xs text-slate-400 mt-1">PostgreSQL • K8s • AWS</div>
        </div>
      </div>

      {/* Stakeholder Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Buying Committee Stakeholders & Role Topology
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Stakeholder Contact</th>
                <th className="py-3 px-4 font-semibold">Committee Role</th>
                <th className="py-3 px-4 font-semibold">Sentiment</th>
                <th className="py-3 px-4 font-semibold">Influence Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {stakeholders.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{s.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {s.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-400">{s.sentiment}</td>
                  <td className="py-3.5 px-4 text-slate-300">{s.influence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
