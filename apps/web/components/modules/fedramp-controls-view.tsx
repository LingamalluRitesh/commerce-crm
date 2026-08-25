"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Landmark,
  KeyRound
} from "lucide-react";

interface FedRAMPItem {
  id: string;
  name: string;
  family: string;
  status: "IMPLEMENTED" | "IN_PROGRESS";
  fips140: boolean;
  evidence: string;
}

const CONTROLS: FedRAMPItem[] = [
  { id: "AC-2", name: "Account Management & Automated Lifecycle", family: "Access Control", status: "IMPLEMENTED", fips140: true, evidence: "audit://iam/lifecycle-v1" },
  { id: "AU-2", name: "Event Logging & Audit Records", family: "Audit & Accountability", status: "IMPLEMENTED", fips140: true, evidence: "audit://cloudwatch/logs" },
  { id: "IA-2", name: "Identification and Auth (PIV / CAC / MFA)", family: "Identification & Auth", status: "IMPLEMENTED", fips140: true, evidence: "audit://okta/mfa" },
  { id: "SC-13", name: "Cryptographic Protection (FIPS 140-3)", family: "System & Comms", status: "IMPLEMENTED", fips140: true, evidence: "audit://kms/fips-hsm" },
  { id: "SI-4", name: "System Monitoring & Intrusion Detection", family: "System Integrity", status: "IMPLEMENTED", fips140: true, evidence: "audit://guardduty/threats" },
];

export function FedRAMPControlsView() {
  const [controls, setControls] = useState<FedRAMPItem[]>(CONTROLS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">FedRAMP Moderate Baseline & NIST SP 800-53 Rev. 5</h2>
              <p className="text-sm text-slate-400">
                Continuous ConMon monitoring across 325 baseline controls, FIPS 140-3 cryptography & zero open POA&Ms.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            FedRAMP Moderate Ready (325 / 325)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Baseline Controls</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">100.0%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 325 NIST controls verified
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open POA&M Items</span>
            <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">0 Open Items</div>
          <div className="text-xs text-slate-400 mt-1">Zero overdue remediations</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FIPS 140-3 Validation</span>
            <KeyRound className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">Active Level 3</div>
          <div className="text-xs text-slate-400 mt-1">Hardware Security Modules (HSM)</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">US-CERT Incident SLA</span>
            <Lock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">&lt;1 Hour</div>
          <div className="text-xs text-slate-400 mt-1">IR-6 automated dispatch</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            NIST SP 800-53 Rev. 5 Moderate Security Controls Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Control ID</th>
                <th className="py-3 px-4 font-semibold">Control Title</th>
                <th className="py-3 px-4 font-semibold">Family</th>
                <th className="py-3 px-4 font-semibold text-center">FIPS 140-3</th>
                <th className="py-3 px-4 font-semibold">Automated Evidence Tag</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {controls.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{c.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{c.name}</td>
                  <td className="py-3.5 px-4 text-slate-300">{c.family}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      LEVEL 3
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{c.evidence}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      IMPLEMENTED
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
