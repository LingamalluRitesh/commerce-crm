"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  UserCheck,
  Trash2,
  Download,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface DSARItemUI {
  id: string;
  email: string;
  type: "ACCESS_EXPORT_PII" | "RIGHT_TO_BE_FORGOTTEN_ERASURE" | "RECTIFY_DATA";
  status: "PENDING_VERIFICATION" | "IN_PROGRESS" | "COMPLETED";
  submittedAt: string;
  daysRemaining: number;
  certHash: string;
}

const SAMPLE_DSARS: DSARItemUI[] = [
  { id: "DSAR-2026-081", email: "elena.rostova@enterprise.eu", type: "RIGHT_TO_BE_FORGOTTEN_ERASURE", status: "COMPLETED", submittedAt: "2026-08-12", daysRemaining: 18, certHash: "SHA256:e8f9104b92c48102" },
  { id: "DSAR-2026-082", email: "marcus.vance@california-corp.com", type: "ACCESS_EXPORT_PII", status: "IN_PROGRESS", submittedAt: "2026-08-20", daysRemaining: 26, certHash: "PENDING_COMPILATION" },
  { id: "DSAR-2026-083", email: "sarah.connor@cyberdyne.org", type: "RIGHT_TO_BE_FORGOTTEN_ERASURE", status: "PENDING_VERIFICATION", submittedAt: "2026-08-24", daysRemaining: 30, certHash: "PENDING_VERIFICATION" },
];

export function GDPRDSARPrivacyView() {
  const [dsars, setDsars] = useState<DSARItemUI[]>(SAMPLE_DSARS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">GDPR & CCPA Privacy Governance & DSAR Automation</h2>
              <p className="text-sm text-slate-400">
                Automated Data Subject Access Requests, Right-to-be-Forgotten orchestration & cryptographic erasure certificates.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> 100% Statutory SLA Adherence
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Active DSAR Requests In Queue</span>
          <span className="text-xl font-bold text-slate-100">{dsars.length} Open Requests</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Average Fulfillment Speed</span>
          <span className="text-xl font-bold text-emerald-400">4.2 Days (30-Day SLA)</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Immutable Consent Ledger Records</span>
          <span className="text-xl font-bold text-cyan-400">1.48M Events</span>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-emerald-400" /> Data Subject Rights Queue & Verification Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Request ID / Subject Email</th>
                <th className="py-2 font-medium">Statutory Right Invoked</th>
                <th className="py-2 font-medium text-center">SLA Countdown</th>
                <th className="py-2 font-medium">Erasure Hash / Evidence</th>
                <th className="py-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dsars.map((d) => (
                <tr key={d.id} className="text-slate-300">
                  <td className="py-3">
                    <span className="font-semibold text-slate-200 block">{d.email}</span>
                    <span className="text-[10px] font-mono text-cyan-400">{d.id}</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        d.type === "RIGHT_TO_BE_FORGOTTEN_ERASURE"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {d.type}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
                      <Clock className="h-3 w-3" /> {d.daysRemaining} days left
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">{d.certHash}</td>
                  <td className="py-3 text-center">
                    {d.status === "COMPLETED" ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold rounded-full">
                        DELIVERED
                      </span>
                    ) : d.status === "IN_PROGRESS" ? (
                      <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-semibold rounded-full">
                        SCRUBBING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-full">
                        PENDING
                      </span>
                    )}
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
