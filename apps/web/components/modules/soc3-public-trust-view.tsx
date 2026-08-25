"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  Download,
  CheckCircle2,
  Lock,
  Globe,
  FileCheck,
  Building,
  ArrowRight
} from "lucide-react";

export function SOC3PublicTrustView() {
  const [downloaded, setDownloaded] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">AICPA SOC 3 Public Trust & Security Assertion</h2>
              <p className="text-sm text-slate-400">
                General use public security, availability & confidentiality assertion audited by independent CPA firm.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDownloaded(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Download className="h-4 w-4" /> Download Public SOC 3 Report (.pdf)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Auditor Opinion</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">Clean / Unqualified</div>
          <div className="text-xs text-emerald-300 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Zero Material Deficiencies
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Auditing CPA Firm</span>
            <Building className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-indigo-400">Schellman LLC</div>
          <div className="text-xs text-slate-400 mt-1">Licensed CPA practitioners</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Observation Period</span>
            <FileCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">12 Months</div>
          <div className="text-xs text-slate-400 mt-1">Sept 1, 2025 – Aug 31, 2026</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Public Distribution</span>
            <Globe className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">Unrestricted</div>
          <div className="text-xs text-slate-400 mt-1">General public distribution</div>
        </div>
      </div>

      {downloaded && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-300">Public SOC 3 Report Downloaded</span>
              <p className="text-slate-400 mt-0.5 font-mono">
                AICPA_SOC3_PUBLIC_REPORT_COMMERCECRM_2026.PDF (Signed by Schellman CPA)
              </p>
            </div>
          </div>
          <span className="font-mono text-emerald-400 font-bold">VERIFIED SIGNATURE</span>
        </div>
      )}
    </div>
  );
}
