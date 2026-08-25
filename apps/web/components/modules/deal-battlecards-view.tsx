"use client";

import React, { useState } from "react";
import {
  Swords,
  ShieldAlert,
  Target,
  Zap,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

interface Battlecard {
  id: string;
  name: string;
  tier: string;
  strengths: string[];
  vulnerabilities: string[];
  killShots: string[];
  pricingComparison: string;
}

const BATTLECARDS: Battlecard[] = [
  {
    id: "SALESFORCE",
    name: "Salesforce Sales Cloud",
    tier: "Legacy Enterprise",
    strengths: ["Massive app ecosystem", "Global brand recognition", "Extensive SI consulting partner network"],
    vulnerabilities: ["Astronomical total cost of ownership (TCO)", "Fragmented acquisitions", "Slow 6-18 month deployments"],
    killShots: [
      "Highlight CommerceCRM unified domain model (zero sync delay)",
      "Demonstrate instant 2-week time-to-value",
      "Show transparent flat pricing with zero hidden add-on API fees"
    ],
    pricingComparison: "Per-user per-month with steep add-on charges for storage and API quotas"
  },
  {
    id: "HUBSPOT",
    name: "HubSpot CRM",
    tier: "Mid-Market SaaS",
    strengths: ["Clean consumer UX", "Strong inbound marketing tools", "Rapid initial onboarding"],
    vulnerabilities: ["Weak complex B2B CPQ pricing", "No double-entry general ledger", "Steep contact tier scaling penalties"],
    killShots: [
      "Demo CommerceCRM native ASC 606 revenue engine and multi-level BOM explosion",
      "Emphasize unlimited contacts with zero scaling penalties"
    ],
    pricingComparison: "Freemium scaling into heavy tiered contact charges"
  },
  {
    id: "NETSUITE",
    name: "Oracle NetSuite ERP",
    tier: "Legacy ERP",
    strengths: ["Mature general ledger", "Multi-subsidiary financial rollup"],
    vulnerabilities: ["Antiquated SuiteScript UI", "High annual maintenance fees", "Rigid customization architecture"],
    killShots: [
      "Show Next.js 14 real-time reactive UX vs SuiteScript page reloads",
      "Demonstrate native pgvector AI copilot"
    ],
    pricingComparison: "Annual modular subscriptions with high named user minimums"
  }
];

export function DealBattlecardsView() {
  const [selectedCompetitor, setSelectedCompetitor] = useState<Battlecard>(BATTLECARDS[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Swords className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Competitive Deal Intelligence & Sales Battlecards</h2>
              <p className="text-sm text-slate-400">
                Direct head-to-head competitor kill-shots, vulnerability exploitation & margin leakage diagnostics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Target className="h-4 w-4 text-rose-400" />
            Win Rate: 71.4% vs Competitors
          </div>
        </div>
      </div>

      {/* Competitor Selector Tabs */}
      <div className="flex gap-2">
        {BATTLECARDS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompetitor(c)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedCompetitor.id === c.id
                ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30"
                : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Battlecard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Competitor Strengths */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-400" /> Competitor Strengths
          </h4>
          <div className="space-y-2">
            {selectedCompetitor.strengths.map((s, idx) => (
              <div key={idx} className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" /> Critical Vulnerabilities
          </h4>
          <div className="space-y-2">
            {selectedCompetitor.vulnerabilities.map((v, idx) => (
              <div key={idx} className="text-xs text-amber-200 bg-amber-950/20 p-3 rounded-xl border border-amber-500/30">
                {v}
              </div>
            ))}
          </div>
        </div>

        {/* Winning Kill Shots */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" /> Winning Kill Shots
          </h4>
          <div className="space-y-2">
            {selectedCompetitor.killShots.map((k, idx) => (
              <div key={idx} className="text-xs text-emerald-200 bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 font-medium">
                🎯 {k}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
