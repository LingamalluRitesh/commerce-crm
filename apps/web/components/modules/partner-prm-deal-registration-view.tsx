"use client";

import React, { useState } from "react";
import {
  Handshake,
  ShieldCheck,
  Building2,
  Lock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  PlusCircle,
} from "lucide-react";

interface DealRegUI {
  id: string;
  partner: string;
  tier: "REGISTERED" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  customer: string;
  domain: string;
  dealSize: number;
  partnerMarginUSD: number;
  status: "APPROVED_PROTECTED" | "REJECTED_CONFLICT" | "WON_CLOSED";
  protectedDaysRemaining: number;
}

const SAMPLE_DEALS: DealRegUI[] = [
  { id: "DLR-2026-041", partner: "Optima Cloud Solutions", tier: "DIAMOND", customer: "FinTech Zenith Group", domain: "fintechzenith.com", dealSize: 450000.0, partnerMarginUSD: 171000.0, status: "APPROVED_PROTECTED", protectedDaysRemaining: 74 },
  { id: "DLR-2026-042", partner: "Strata IT Integrators", tier: "GOLD", customer: "Apex Global Logistics", domain: "apexlogistics.io", dealSize: 180000.0, partnerMarginUSD: 40500.0, status: "APPROVED_PROTECTED", protectedDaysRemaining: 61 },
  { id: "DLR-2026-043", partner: "CyberAlliance LLC", tier: "SILVER", customer: "Direct Account Collision", domain: "directmanagedcorp.com", dealSize: 220000.0, partnerMarginUSD: 0.0, status: "REJECTED_CONFLICT", protectedDaysRemaining: 0 },
];

export function PartnerPRMDealRegistrationView() {
  const [deals, setDeals] = useState<DealRegUI[]>(SAMPLE_DEALS);

  const totalPipeline = deals.filter((d) => d.status === "APPROVED_PROTECTED").reduce((sum, d) => sum + d.dealSize, 0);
  const totalPartnerMargins = deals.filter((d) => d.status === "APPROVED_PROTECTED").reduce((sum, d) => sum + d.partnerMarginUSD, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Handshake className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Partner Portal PRM & Deal Registration Engine</h2>
              <p className="text-sm text-slate-400">
                Channel conflict arbitration, 90-day domain exclusivity protection & Market Development Funds (MDF) ledger.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> 90-Day Exclusivity Lock Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Protected Partner Pipeline</span>
          <span className="text-xl font-bold text-slate-100">${totalPipeline.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Committed Partner Margin Pool</span>
          <span className="text-xl font-bold text-amber-400">${totalPartnerMargins.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Direct Sales Conflict Rate</span>
          <span className="text-xl font-bold text-emerald-400">&lt; 2.1% Collision</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-amber-400" /> Active Partner Deal Registrations & Exclusivity Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Deal ID / Domain</th>
                <th className="py-2 font-medium">Partner Organization</th>
                <th className="py-2 font-medium">Partner Tier</th>
                <th className="py-2 font-medium">End Customer</th>
                <th className="py-2 font-medium text-right">Est. Deal Size</th>
                <th className="py-2 font-medium text-right">Partner Margin</th>
                <th className="py-2 font-medium text-center">Exclusivity Window</th>
                <th className="py-2 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deals.map((d) => (
                <tr key={d.id} className="text-slate-300">
                  <td className="py-3 font-mono">
                    <span className="text-amber-400 font-semibold block">{d.id}</span>
                    <span className="text-[10px] text-slate-500">{d.domain}</span>
                  </td>
                  <td className="py-3 font-medium text-slate-200">{d.partner}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        d.tier === "DIAMOND"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : d.tier === "GOLD"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {d.tier}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-slate-200">{d.customer}</td>
                  <td className="py-3 text-right font-bold text-slate-100">${d.dealSize.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">${d.partnerMarginUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-center">
                    {d.protectedDaysRemaining > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                        <Clock className="h-3 w-3" /> {d.protectedDaysRemaining}d remaining
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Expired / N/A</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {d.status === "APPROVED_PROTECTED" ? (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold rounded-full">
                        PROTECTED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold rounded-full">
                        CONFLICT
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
