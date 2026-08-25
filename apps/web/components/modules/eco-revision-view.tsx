"use client";

import React, { useState } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock
} from "lucide-react";

interface ECOItem {
  id: string;
  title: string;
  assemblySku: string;
  rev: string;
  status: "DRAFT" | "REVIEW" | "CCB_APPROVED" | "RELEASED";
  disposition: string;
  primarySku: string;
  alternateSku: string;
}

const ECOS: ECOItem[] = [
  {
    id: "ECO-2026-0042",
    title: "DDR5 Second-Source Memory Vendor Qualification",
    assemblySku: "SRV-NODE-X9",
    rev: "Rev C",
    status: "RELEASED",
    disposition: "USE_AS_IS_UNTIL_EXHAUSTED",
    primarySku: "RAM-64GB-ECC (Micron)",
    alternateSku: "RAM-64GB-ECC-SAMSUNG"
  },
  {
    id: "ECO-2026-0043",
    title: "High-Efficiency 2400W Titanium Redundant PSU Upgrade",
    assemblySku: "SRV-NODE-X9",
    rev: "Rev D",
    status: "CCB_APPROVED",
    disposition: "REWORK_INVENTORY",
    primarySku: "PSU-2000W-RED",
    alternateSku: "PSU-2400W-TITANIUM"
  },
  {
    id: "ECO-2026-0044",
    title: "RoHS 3 Compliant Lead-Free Solder Paste Transition",
    assemblySku: "SRV-MB-2026",
    rev: "Rev B",
    status: "REVIEW",
    disposition: "SCRAP_EXISTING_INVENTORY",
    primarySku: "SLD-PASTE-SN63",
    alternateSku: "SLD-PASTE-SAC305-ROHS"
  }
];

export function ECORevisionView() {
  const [ecoList, setEcoList] = useState<ECOItem[]>(ECOS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <GitPullRequest className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Engineering Change Order (ECO) & Revision Control</h2>
              <p className="text-sm text-slate-400">
                Product assembly revision lifecycles, Configuration Control Board (CCB) approvals & Form-Fit-Function component substitutions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            CCB Governance Enforced
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active ECOs</span>
            <GitPullRequest className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{ecoList.length} ECOs</div>
          <div className="text-xs text-slate-400 mt-1">Across 3 assembly revisions</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Released Revisions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">Rev C Active</div>
          <div className="text-xs text-emerald-300 mt-1">Effective on factory lines</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Qualified Alternates</span>
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">100% Compatible</div>
          <div className="text-xs text-slate-400 mt-1">Form-Fit-Function validated</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending CCB Sign-off</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">1 Review</div>
          <div className="text-xs text-amber-300 mt-1">RoHS 3 solder paste check</div>
        </div>
      </div>

      {/* ECO Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Engineering Change Orders
          </h3>
        </div>

        <div className="divide-y divide-slate-800/40">
          {ecoList.map((e) => (
            <div key={e.id} className="p-5 hover:bg-slate-800/20 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
                    {e.id}
                  </span>
                  <h4 className="font-semibold text-sm text-slate-100">{e.title}</h4>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {e.rev}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    e.status === "RELEASED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : e.status === "CCB_APPROVED"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}
                >
                  {e.status}
                </span>
              </div>

              <div className="text-xs text-slate-300 mt-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-slate-400">Target Assembly:</span>{" "}
                  <span className="font-mono text-slate-200 font-semibold">{e.assemblySku}</span>
                  <span className="mx-2 text-slate-600">•</span>
                  <span className="text-slate-400">Disposition:</span>{" "}
                  <span className="font-mono text-indigo-300">{e.disposition}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{e.primarySku}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-emerald-400 font-semibold">{e.alternateSku}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
