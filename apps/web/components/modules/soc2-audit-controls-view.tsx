"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Lock,
  Server,
  Key,
  Users,
  Eye,
  ArrowRight
} from "lucide-react";

interface SOC2Control {
  id: string;
  category: string;
  title: string;
  frequency: string;
  status: "EFFECTIVE_PASS" | "UNDER_REVIEW";
  evidence: string;
}

const CONTROLS: SOC2Control[] = [
  { id: "CC1.1", category: "Security", title: "Tone at the Top & Code of Conduct", frequency: "Continuous", status: "EFFECTIVE_PASS", evidence: "HR_LMS_RECORDS" },
  { id: "CC3.2", category: "Security", title: "Periodic Threat Modeling & SAST/DAST", frequency: "Hourly", status: "EFFECTIVE_PASS", evidence: "TRIVY_SCAN_LOGS" },
  { id: "CC5.1", category: "Security", title: "Segregation of Duties (SoD) in CI/CD", frequency: "Continuous", status: "EFFECTIVE_PASS", evidence: "BRANCH_PROTECTION_RULES" },
  { id: "CC6.1", category: "Security", title: "Mandatory FIDO2 / WebAuthn MFA", frequency: "Continuous", status: "EFFECTIVE_PASS", evidence: "OKTA_MFA_LOGS" },
  { id: "CC6.6", category: "Security", title: "AES-256 Envelope Encryption at Rest", frequency: "Continuous", status: "EFFECTIVE_PASS", evidence: "KMS_AUDIT_LOGS" },
  { id: "A1.2", category: "Availability", title: "Multi-Region Automated Failover", frequency: "Hourly", status: "EFFECTIVE_PASS", evidence: "POSTGRES_REPLICATION" },
  { id: "C1.1", category: "Confidentiality", title: "Tenant Row-Level Security (RLS)", frequency: "Continuous", status: "EFFECTIVE_PASS", evidence: "RLS_AUDIT_TRAIL" },
];

export function SOC2AuditControlsView() {
  const [controls, setControls] = useState<SOC2Control[]>(CONTROLS);

  const passedCount = controls.filter((c) => c.status === "EFFECTIVE_PASS").length;
  const scorePct = Math.round((passedCount / controls.length) * 100);

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
              <h2 className="text-xl font-bold text-slate-100">AICPA SOC 2 Type II Continuous Control Matrix</h2>
              <p className="text-sm text-slate-400">
                Common Criteria (CC1-CC9), Availability (A1), Confidentiality (C1) automated evidence collection & auditor portal.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Unqualified Opinion (100% Pass)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{scorePct}%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> All {controls.length} Controls Effective
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Audit Window</span>
            <FileCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">Type II (12 Mo)</div>
          <div className="text-xs text-slate-400 mt-1">Continuous observation</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">MFA & KMS Controls</span>
            <Key className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">100% Enforced</div>
          <div className="text-xs text-slate-400 mt-1">FIDO2 WebAuthn + AES-256</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">External Assessor</span>
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">Schellman LLC</div>
          <div className="text-xs text-slate-400 mt-1">Independent CPA auditor</div>
        </div>
      </div>

      {/* Controls Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Evaluated Control Activities & Cryptographic Artifacts
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Control ID</th>
                <th className="py-3 px-4 font-semibold">Criteria</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Frequency</th>
                <th className="py-3 px-4 font-semibold">Evidence Artifact</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {controls.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{c.id}</td>
                  <td className="py-3.5 px-4 text-slate-300">{c.category}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-100">{c.title}</td>
                  <td className="py-3.5 px-4 text-slate-400">{c.frequency}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{c.evidence}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> PASS
                    </span>
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
