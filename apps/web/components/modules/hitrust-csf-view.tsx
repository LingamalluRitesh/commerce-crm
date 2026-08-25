"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  HeartPulse,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Database
} from "lucide-react";

interface HITRUSTReq {
  id: string;
  domain: string;
  desc: string;
  level: string;
  score: number;
  evidence: string;
  status: "COMPLIANT" | "IN_PROGRESS";
}

const REQS: HITRUSTReq[] = [
  { id: "01.a", domain: "Access Control", desc: "Role-Based Access Control (RBAC) for ePHI", level: "Level 3 (r2)", score: 98.0, evidence: "EVID-IAM-RBAC-01", status: "COMPLIANT" },
  { id: "03.b", domain: "Endpoint Protection", desc: "AES-256 Endpoint Encryption on all Laptops", level: "Level 3 (r2)", score: 96.0, evidence: "EVID-MDM-ENCRYPT-02", status: "COMPLIANT" },
  { id: "09.a", domain: "Transmission Protection", desc: "TLS 1.3 Encryption in-transit for all APIs", level: "Level 3 (r2)", score: 100.0, evidence: "EVID-TLS-KMS-03", status: "COMPLIANT" },
  { id: "10.c", domain: "Audit Logging", desc: "Immutable SIEM Log Archiving with WORM Storage", level: "Level 3 (r2)", score: 95.0, evidence: "EVID-S3-LOCK-WORM-04", status: "COMPLIANT" },
  { id: "12.e", domain: "Business Continuity", desc: "Cross-Region Disaster Recovery (RPO <15m)", level: "Level 3 (r2)", score: 94.0, evidence: "EVID-DR-TEST-2026", status: "COMPLIANT" },
];

export function HITRUSTCSFView() {
  const [reqs, setReqs] = useState<HITRUSTReq[]>(REQS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">HITRUST CSF v11.3 Enterprise Healthcare Security Matrix</h2>
              <p className="text-sm text-slate-400">
                HIPAA & HITECH harmonized 19-domain controls framework with r2 Comprehensive Assessment certification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            HITRUST r2 Certified (96.6% PRISMA)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Maturity Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">96.6%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> High PRISMA Maturity
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assessment Type</span>
            <FileCheck className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">r2 Comprehensive</div>
          <div className="text-xs text-slate-400 mt-1">2-year valid certification</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ePHI Data Protection</span>
            <Lock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">100% Encrypted</div>
          <div className="text-xs text-slate-400 mt-1">At-rest (AES-256) & in-transit</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Harmonized Baselines</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">HIPAA • NIST • ISO</div>
          <div className="text-xs text-slate-400 mt-1">Unified security controls</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            HITRUST CSF Control Domain Audit Requirements
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Req #</th>
                <th className="py-3 px-4 font-semibold">Control Domain</th>
                <th className="py-3 px-4 font-semibold">Requirement Description</th>
                <th className="py-3 px-4 font-semibold">Implementation Level</th>
                <th className="py-3 px-4 font-semibold text-right">Maturity %</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {reqs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{r.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{r.domain}</td>
                  <td className="py-3.5 px-4 text-slate-200">{r.desc}</td>
                  <td className="py-3.5 px-4 font-mono text-purple-400">{r.level}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">{r.score}%</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      CERTIFIED
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
