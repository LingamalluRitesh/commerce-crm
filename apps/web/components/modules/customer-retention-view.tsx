"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  TrendingDown,
  ShieldAlert,
  Users,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Flame,
  FileText
} from "lucide-react";

interface PlaybookCard {
  id: string;
  customerName: string;
  healthScore: number;
  mrr: number;
  severity: "CRITICAL" | "MODERATE" | "PROACTIVE";
  title: string;
  tasksCount: number;
  assignedRole: string;
}

const SAMPLE_PLAYBOOKS: PlaybookCard[] = [
  { id: "PB-001", customerName: "Acme Health Systems", healthScore: 22, mrr: 15000, severity: "CRITICAL", title: "Executive Sponsor Alignment & Engineering Intervention", tasksCount: 3, assignedRole: "VP_CUSTOMER_SUCCESS" },
  { id: "PB-002", customerName: "Global Fintech Corp", healthScore: 45, mrr: 28000, severity: "MODERATE", title: "Targeted Product Feature Adoption Workshop", tasksCount: 2, assignedRole: "SOLUTIONS_ARCHITECT" },
  { id: "PB-003", customerName: "Apex Aerospace Ltd", healthScore: 52, mrr: 45000, severity: "MODERATE", title: "Quarterly Executive Business Review (QBR)", tasksCount: 2, assignedRole: "CSM" },
  { id: "PB-004", customerName: "Champion Enterprise", healthScore: 94, mrr: 60000, severity: "PROACTIVE", title: "Advocacy & Multi-Year Expansion Playbook", tasksCount: 1, assignedRole: "CSM" },
];

export function CustomerRetentionView() {
  const [playbooks, setPlaybooks] = useState<PlaybookCard[]>(SAMPLE_PLAYBOOKS);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const atRiskMrr = playbooks
    .filter((p) => p.severity === "CRITICAL" || p.severity === "MODERATE")
    .reduce((acc, p) => acc + p.mrr, 0);

  const filteredPlaybooks = playbooks.filter(
    (p) => selectedFilter === "ALL" || p.severity === selectedFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Customer Churn Retention & Survival Playbooks</h2>
              <p className="text-sm text-slate-400">
                Kaplan-Meier product-limit survival estimators, automated churn risk detection & executive recovery playbooks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Flame className="h-4 w-4 text-rose-400" />
            Active Churn Sentinel
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">At-Risk Pipeline MRR</span>
            <TrendingDown className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${atRiskMrr.toLocaleString()}</div>
          <div className="text-xs text-rose-300 mt-1">Targeted by recovery playbooks</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">12-Month Retention Rate</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">92.4%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Exceeds 90% Benchmark
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Playbooks</span>
            <FileText className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{playbooks.length} Active</div>
          <div className="text-xs text-slate-400 mt-1">Assigned to CSM & Solutions</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Median Survival Tenure</span>
            <Award className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">48 Months</div>
          <div className="text-xs text-slate-400 mt-1">Kaplan-Meier median lifetime</div>
        </div>
      </div>

      {/* Playbook Trigger List */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Active Retention Playbooks ({filteredPlaybooks.length})
          </h3>
          <div className="flex gap-2 text-xs">
            {["ALL", "CRITICAL", "MODERATE", "PROACTIVE"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedFilter(st)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  selectedFilter === st
                    ? "bg-rose-600 border-rose-500 text-white"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800/40">
          {filteredPlaybooks.map((p) => (
            <div key={p.id} className="p-5 hover:bg-slate-800/20 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      p.severity === "CRITICAL"
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse"
                        : p.severity === "MODERATE"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    }`}
                  >
                    {p.severity}
                  </span>
                  <h4 className="font-semibold text-sm text-slate-100">{p.customerName}</h4>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400">
                    Health Score:{" "}
                    <span
                      className={`font-bold font-mono ${
                        p.healthScore < 50 ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {p.healthScore}/100
                    </span>
                  </span>
                  <span className="text-slate-400">
                    MRR: <span className="font-bold font-mono text-slate-200">${p.mrr.toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 mt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">{p.title}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">Assigned Owner: {p.assignedRole}</div>
                </div>
                <span className="text-xs text-indigo-400 font-semibold">{p.tasksCount} Action Tasks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
