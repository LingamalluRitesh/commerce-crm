"use client";

import React, { useState } from "react";
import {
  Flame,
  Target,
  TrendingUp,
  UserCheck,
  Building2,
  Sparkles,
  PhoneCall,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface LeadScoringUI {
  id: string;
  name: string;
  title: string;
  company: string;
  size: string;
  industry: string;
  fitScore: number;
  intentScore: number;
  composite: number;
  grade: "GRADE_A_HOT" | "GRADE_B_WARM" | "GRADE_C_NURTURE";
  recommendedAction: string;
}

const SAMPLE_LEADS: LeadScoringUI[] = [
  { id: "LEAD-901", name: "David Chen", title: "Chief Technology Officer", company: "Aura FinTech Global", size: ">1,000 employees", industry: "FINTECH", fitScore: 48, intentScore: 46, composite: 94, grade: "GRADE_A_HOT", recommendedAction: "Immediate SDR Outbound Call & Live Demo Scheduling" },
  { id: "LEAD-902", name: "Sarah Jenkins", title: "VP of Supply Chain Systems", company: "Nordic Freight Logistics", size: "250-999 employees", industry: "LOGISTICS", fitScore: 42, intentScore: 38, composite: 80, grade: "GRADE_A_HOT", recommendedAction: "Personalized Enterprise Executive Sequence" },
  { id: "LEAD-903", name: "Alexei Volkov", title: "Lead DevOps Architect", company: "CyberShield Security", size: "50-249 employees", industry: "SAAS", fitScore: 35, intentScore: 32, composite: 67, grade: "GRADE_B_WARM", recommendedAction: "Send Security & SOC2 Compliance Whitepaper" },
  { id: "LEAD-904", name: "Emily Watson", title: "Procurement Specialist", company: "Beacon Retailers", size: "1-49 employees", industry: "ECOMMERCE", fitScore: 22, intentScore: 18, composite: 40, grade: "GRADE_C_NURTURE", recommendedAction: "Add to Bi-Weekly Product Newsletter" },
];

export function PredictiveLeadScoringView() {
  const [leads, setLeads] = useState<LeadScoringUI[]>(SAMPLE_LEADS);

  const hotCount = leads.filter((l) => l.grade === "GRADE_A_HOT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Predictive Lead Scoring & ICP Propensity Engine</h2>
              <p className="text-sm text-slate-400">
                Multi-dimensional ICP fit scoring, behavioral intent signals & automated Next-Best-Action SDR routing.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> AI Propensity Scoring Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Hot MQL Leads Ready for Outbound</span>
          <span className="text-xl font-bold text-rose-400">{hotCount} Priority Leads</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Average Lead Conversion Velocity</span>
          <span className="text-xl font-bold text-emerald-400">3.8 Days to Demo</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">ICP Win-Rate Lift</span>
          <span className="text-xl font-bold text-cyan-400">+42.6% vs Non-Scored</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Target className="h-4 w-4 text-rose-400" /> Enterprise Leads & Propensity Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Contact / Company</th>
                <th className="py-2 font-medium">ICP Fit / Industry</th>
                <th className="py-2 font-medium text-center">Fit Score</th>
                <th className="py-2 font-medium text-center">Intent Score</th>
                <th className="py-2 font-medium text-center">Propensity</th>
                <th className="py-2 font-medium">Recommended Next-Best-Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leads.map((l) => (
                <tr key={l.id} className="text-slate-300">
                  <td className="py-3">
                    <span className="font-semibold text-slate-200 block">{l.name}</span>
                    <span className="text-slate-400 text-[11px]">{l.title} • <strong className="text-slate-300">{l.company}</strong></span>
                  </td>
                  <td className="py-3">
                    <span className="text-slate-200 font-medium block">{l.industry}</span>
                    <span className="text-[10px] text-slate-500">{l.size}</span>
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-cyan-400">{l.fitScore}/50</td>
                  <td className="py-3 text-center font-mono font-bold text-amber-400">{l.intentScore}/50</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        l.composite >= 80
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : l.composite >= 60
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {l.composite}/100
                    </span>
                  </td>
                  <td className="py-3 text-slate-300 font-medium">{l.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
