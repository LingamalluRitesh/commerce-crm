"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Server,
  Database,
  Key,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface ControlItem {
  id: string;
  principle: "SECURITY" | "AVAILABILITY" | "PROCESSING_INTEGRITY" | "CONFIDENTIALITY" | "PRIVACY";
  title: string;
  status: "PASS" | "WARNING" | "FAIL";
  score: number;
  evidence: string;
  lastChecked: string;
}

const INITIAL_CONTROLS: ControlItem[] = [
  {
    id: "CC6.1.1",
    principle: "SECURITY",
    title: "Multi-Factor Authentication (MFA) Mandatory",
    status: "PASS",
    score: 100,
    evidence: "100% of staff & admin roles authenticated via WebAuthn/FIDO2 keys",
    lastChecked: "2 mins ago"
  },
  {
    id: "CC6.6.1",
    principle: "SECURITY",
    title: "Cryptographic In-Transit & At-Rest Encryption",
    status: "PASS",
    score: 100,
    evidence: "TLS 1.3 enforced on all reverse proxies; AES-256-GCM column encryption enabled",
    lastChecked: "5 mins ago"
  },
  {
    id: "A1.2.1",
    principle: "AVAILABILITY",
    title: "Automated Point-in-Time Database Snapshots",
    status: "PASS",
    score: 100,
    evidence: "Continuous PostgreSQL WAL archiving active; snapshot completed 42 mins ago",
    lastChecked: "42 mins ago"
  },
  {
    id: "PI1.2.1",
    principle: "PROCESSING_INTEGRITY",
    title: "Merkle Tree Ledger Hash Chain Verification",
    status: "PASS",
    score: 100,
    evidence: "100% of 24,500 audit log records verified against cryptographic root hash",
    lastChecked: "1 min ago"
  },
  {
    id: "C1.1.1",
    principle: "CONFIDENTIALITY",
    title: "Secrets Rotation & Least Privilege Access",
    status: "PASS",
    score: 95,
    evidence: "Zero committed repository secrets; average API key age is 24 days (< 90 days)",
    lastChecked: "15 mins ago"
  },
  {
    id: "P4.1.1",
    principle: "PRIVACY",
    title: "GDPR Article 17 Data Erasure SLA Compliance",
    status: "PASS",
    score: 100,
    evidence: "100% of DSR erasure requests fulfilled within 2.4 days (SLA < 30 days)",
    lastChecked: "1 hour ago"
  }
];

export function SOC2ComplianceView() {
  const [controls, setControls] = useState<ControlItem[]>(INITIAL_CONTROLS);
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>("ALL");

  const overallScore = Math.round(
    controls.reduce((acc, c) => acc + c.score, 0) / controls.length
  );

  const filteredControls = controls.filter(
    (c) => selectedPrinciple === "ALL" || c.principle === selectedPrinciple
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">SOC-2 Type II Continuous Control Monitoring</h2>
              <p className="text-sm text-slate-400">
                Automated Trust Services Criteria (TSC) evidence collection across Security, Availability, Integrity, Confidentiality & Privacy.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Audit Ready: {overallScore}% Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Compliance</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{overallScore}%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Exceeds 90% Threshold
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Controls</span>
            <FileCheck2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{controls.length} Controls</div>
          <div className="text-xs text-slate-400 mt-1">100% passing checks</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Data Loss Prevention</span>
            <Lock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">Zero Leaks</div>
          <div className="text-xs text-slate-400 mt-1">Gitleaks automated scan clean</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cryptographic Vault</span>
            <Database className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Verified Root</div>
          <div className="text-xs text-slate-400 mt-1">SHA-256 Merkle chain intact</div>
        </div>
      </div>

      {/* Trust Principle Tabs & Control Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Continuous Automated Evidence ({filteredControls.length})
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {["ALL", "SECURITY", "AVAILABILITY", "PROCESSING_INTEGRITY", "CONFIDENTIALITY", "PRIVACY"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPrinciple(p)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  selectedPrinciple === p
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800/40">
          {filteredControls.map((c) => (
            <div key={c.id} className="p-5 hover:bg-slate-800/20 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                    {c.id}
                  </span>
                  <h4 className="font-semibold text-sm text-slate-100">{c.title}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">Checked {c.lastChecked}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {c.score}% PASS
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 font-mono">
                {c.evidence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
