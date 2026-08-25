"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Server,
  Cloud,
  FileCheck,
  RefreshCw,
  ArrowRight
} from "lucide-react";

interface Finding {
  id: string;
  rule: string;
  resource: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  status: "REMEDIATED" | "SCANNING";
  remediationTime: string;
}

const FINDINGS: Finding[] = [
  { id: "F-101", rule: "CIS-AWS-S3-PUBLIC-BLOCK", resource: "s3:::commerce-crm-backups", severity: "HIGH", status: "REMEDIATED", remediationTime: "12 mins" },
  { id: "F-102", rule: "CIS-AWS-IAM-MFA-ENFORCED", resource: "iam::user/admin", severity: "CRITICAL", status: "REMEDIATED", remediationTime: "5 mins" },
  { id: "F-103", rule: "CIS-K8S-POD-SECURITY-STANDARDS", resource: "k8s:deploy/api", severity: "MEDIUM", status: "REMEDIATED", remediationTime: "30 mins" },
];

export function SOC2ContinuousMonitoringView() {
  const [findings, setFindings] = useState<Finding[]>(FINDINGS);

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
              <h2 className="text-xl font-bold text-slate-100">SOC 2 Type II Real-Time Observability & Evidence Collector</h2>
              <p className="text-sm text-slate-400">
                Continuous cloud posture evaluation, automated drift remediation, and cryptographic SHA-256 evidence sealing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            100% Compliant (480 Scanned)
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance Posture</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">100.0%</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Zero Unresolved Drifts
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resources Monitored</span>
            <Cloud className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">480 Cloud Nodes</div>
          <div className="text-xs text-slate-400 mt-1">AWS & K8s clusters</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Remediation SLA</span>
            <RefreshCw className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">15.6 Minutes</div>
          <div className="text-xs text-slate-400 mt-1">Automated event triggers</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cryptographic Seal</span>
            <FileCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">SHA-256 Valid</div>
          <div className="text-xs text-slate-400 mt-1">Auditor tamper-proof log</div>
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Continuous Security Event & Remediation Stream
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Event ID</th>
                <th className="py-3 px-4 font-semibold">CIS / SOC 2 Rule</th>
                <th className="py-3 px-4 font-semibold">Resource ARN</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 font-semibold">Time to Fix</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{f.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{f.rule}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{f.resource}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        f.severity === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-400">{f.remediationTime}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> RESOLVED
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
