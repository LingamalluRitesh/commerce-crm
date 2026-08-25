"use client";

import React, { useState } from "react";
import {
  Users,
  Award,
  DollarSign,
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

interface CoSellMember {
  name: string;
  role: string;
  shapleyPct: number;
  attributedACV: number;
  payout: number;
}

const MEMBERS: CoSellMember[] = [
  { name: "Marcus Vance", role: "Account Executive (Lead)", shapleyPct: 41.5, attributedACV: 124500, payout: 12450 },
  { name: "Sarah Chen", role: "Principal Solutions Architect", shapleyPct: 26.0, attributedACV: 78000, payout: 7800 },
  { name: "David Kim", role: "Inbound BDR Sourcing", shapleyPct: 15.5, attributedACV: 46500, payout: 4650 },
  { name: "Elena Rostova", role: "Strategic Customer Success", shapleyPct: 10.5, attributedACV: 31500, payout: 3150 },
  { name: "Robert Taylor", role: "Industry FinTech Specialist", shapleyPct: 6.5, attributedACV: 19500, payout: 1950 },
];

export function ShapleyCoSellingView() {
  const [members, setMembers] = useState<CoSellMember[]>(MEMBERS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Game-Theoretic Shapley Value Co-Selling Attribution</h2>
              <p className="text-sm text-slate-400">
                Axiomatically fair commission splits across 2^n marginal coalitions of AEs, Solutions Architects, and BDRs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-violet-400" />
            Shapley Fairness Axioms Met
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Closed ACV</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">$300,000 USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Enterprise Multi-Year Deal
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Commission Pool (10%)</span>
            <Award className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">$30,000 USD</div>
          <div className="text-xs text-slate-400 mt-1">100% Attributed across 5 reps</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Marginal Coalitions</span>
            <Layers className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">32 Subsets</div>
          <div className="text-xs text-slate-400 mt-1">2^5 Permutations evaluated</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dispute Reduction</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Zero Disputes</div>
          <div className="text-xs text-slate-400 mt-1">Mathematical consensus</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Deal Commission Allocation Table (Deal: Global Enterprise Cloud Migration)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Team Participant</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold text-right">Shapley Attribution %</th>
                <th className="py-3 px-4 font-semibold text-right">Attributed ACV</th>
                <th className="py-3 px-4 font-semibold text-right">Commission Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {members.map((m) => (
                <tr key={m.name} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100">{m.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{m.role}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-purple-400">{m.shapleyPct}%</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">${m.attributedACV.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${m.payout.toLocaleString()}
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
