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
  Server,
  KeyRound
} from "lucide-react";

interface ISOControl {
  id: string;
  title: string;
  theme: "ORGANIZATIONAL" | "PEOPLE" | "PHYSICAL" | "TECHNOLOGICAL";
  inherentRisk: number;
  residualRisk: number;
  evidence: string;
  status: "VERIFIED" | "IN_PROGRESS";
}

const CONTROLS: ISOControl[] = [
  { id: "A.5.1", title: "Policies for Information Security", theme: "ORGANIZATIONAL", inherentRisk: 15, residualRisk: 3, evidence: "DOC-SEC-POL-01", status: "VERIFIED" },
  { id: "A.5.15", title: "Access Control Policy & RBAC", theme: "ORGANIZATIONAL", inherentRisk: 20, residualRisk: 4, evidence: "IAM-RBAC-AUDIT", status: "VERIFIED" },
  { id: "A.6.3", title: "InfoSec Awareness Training", theme: "PEOPLE", inherentRisk: 16, residualRisk: 4, evidence: "HR-TRAIN-CERT-100", status: "VERIFIED" },
  { id: "A.7.2", title: "Physical Entry Controls", theme: "PHYSICAL", inherentRisk: 12, residualRisk: 2, evidence: "EQUINIX-BADGE-LOGS", status: "VERIFIED" },
  { id: "A.8.20", title: "Network Security & VPC Isolation", theme: "TECHNOLOGICAL", inherentRisk: 25, residualRisk: 5, evidence: "AWS-VPC-FLOW-LOGS", status: "VERIFIED" },
  { id: "A.8.24", title: "Cryptography & Key Management", theme: "TECHNOLOGICAL", inherentRisk: 25, residualRisk: 4, evidence: "AWS-KMS-HSM-LOGS", status: "VERIFIED" },
];

export function ISO27001ISMSView() {
  const [controls, setControls] = useState<ISOControl[]>(CONTROLS);

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
              <h2 className="text-xl font-bold text-slate-100">ISO/IEC 27001:2022 ISMS Statement of Applicability (SoA)</h2>
              <p className="text-sm text-slate-400">
                Annex A 93 Security Controls matrix, inherent vs residual risk treatment & continuous evidence tags.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            100% SoA Implemented
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SoA Compliance Posture</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">100.0%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 93 / 93 Annex A controls
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Standard Edition</span>
            <FileCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">2022 Revision</div>
          <div className="text-xs text-slate-400 mt-1">4 control themes structured</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Residual Risk</span>
            <Lock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">3.6 / 25 Low</div>
          <div className="text-xs text-slate-400 mt-1">-81% risk reduction achieved</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Auditor Evidence</span>
            <KeyRound className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">All Tagged</div>
          <div className="text-xs text-slate-400 mt-1">Tamper-proof audit trails</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Statement of Applicability (SoA) Controls & Risk Treatment Plan
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Annex A Control</th>
                <th className="py-3 px-4 font-semibold">Theme</th>
                <th className="py-3 px-4 font-semibold text-right">Inherent Risk</th>
                <th className="py-3 px-4 font-semibold text-right">Residual Risk</th>
                <th className="py-3 px-4 font-semibold">Evidence Reference</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {controls.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">{c.title}</div>
                    <div className="text-[11px] font-mono text-emerald-400">{c.id}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{c.theme}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-rose-400">{c.inherentRisk} / 25</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {c.residualRisk} / 25
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{c.evidence}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      VERIFIED
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
