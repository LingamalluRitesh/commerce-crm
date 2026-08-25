"use client";

import React, { useState } from "react";
import {
  RotateCcw,
  PackageCheck,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Search,
  Filter,
} from "lucide-react";

interface RMARecordUI {
  rmaNumber: string;
  orderId: string;
  customer: string;
  item: string;
  reason: string;
  grade: "GRADE_A_NEW" | "GRADE_B_COSMETIC" | "GRADE_C_REFURB" | "GRADE_F_SCRAP";
  disposition: string;
  recoveryValue: number;
  refundDue: number;
  fraudFlag: boolean;
  status: "INSPECTED" | "APPROVED" | "SETTLED";
}

const SAMPLE_RMAS: RMARecordUI[] = [
  {
    rmaNumber: "RMA-202608-0104",
    orderId: "ORD-94821",
    customer: "CyberMatrix Corp",
    item: "Dual 100G NIC PCIe Card",
    reason: "DEFECTIVE_ON_ARRIVAL",
    grade: "GRADE_C_REFURB",
    disposition: "OEM_FACTORY_REPAIR",
    recoveryValue: 420.0,
    refundDue: 650.0,
    fraudFlag: false,
    status: "INSPECTED",
  },
  {
    rmaNumber: "RMA-202608-0105",
    orderId: "ORD-94910",
    customer: "Vanguard Tech Inc",
    item: "Managed Layer 3 Core Switch",
    reason: "BUYER_REMORSE",
    grade: "GRADE_A_NEW",
    disposition: "RETURN_TO_PRIMARY_INVENTORY",
    recoveryValue: 2400.0,
    refundDue: 2400.0,
    fraudFlag: false,
    status: "SETTLED",
  },
  {
    rmaNumber: "RMA-202608-0106",
    orderId: "ORD-95022",
    customer: "Suspicious Alpha Buyer",
    item: "High-Density GPU Accelerator",
    reason: "NOT_AS_DESCRIBED",
    grade: "GRADE_F_SCRAP",
    disposition: "HOLD_FOR_FRAUD_INVESTIGATION",
    recoveryValue: 0.0,
    refundDue: 0.0,
    fraudFlag: true,
    status: "INSPECTED",
  },
];

export function ReverseLogisticsRMAView() {
  const [rmas, setRmas] = useState<RMARecordUI[]>(SAMPLE_RMAS);
  const [filterQuery, setFilterQuery] = useState("");

  const totalRecovery = rmas.reduce((sum, r) => sum + r.recoveryValue, 0);
  const totalRefunded = rmas.reduce((sum, r) => sum + r.refundDue, 0);

  const filtered = rmas.filter(
    (r) =>
      r.rmaNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.customer.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.item.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Reverse Logistics, RMA & Disposition Matrix</h2>
              <p className="text-sm text-slate-400">
                Automated returns grading (Grades A–F), fraud velocity triggers & secondary liquidation routing.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs">
            <span className="text-slate-400">Total Recovery: </span>
            <span className="text-emerald-400 font-bold">${totalRecovery.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total RMAs In Queue</span>
          <span className="text-xl font-bold text-slate-100">{rmas.length} Active</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Settled Customer Refunds</span>
          <span className="text-xl font-bold text-rose-400">${totalRefunded.toFixed(2)}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Refurbishment Recovery Ratio</span>
          <span className="text-xl font-bold text-emerald-400">
            {totalRefunded > 0 ? ((totalRecovery / totalRefunded) * 100).toFixed(1) : "0"}%
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search RMA, Order, Customer..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">RMA # / Order</th>
                <th className="py-2 font-medium">Customer & Item</th>
                <th className="py-2 font-medium text-center">Quality Grade</th>
                <th className="py-2 font-medium">Disposition Routing</th>
                <th className="py-2 font-medium text-right">Recovery Est.</th>
                <th className="py-2 font-medium text-right">Refund Amount</th>
                <th className="py-2 font-medium text-center">Fraud Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((rma) => (
                <tr key={rma.rmaNumber} className="text-slate-300">
                  <td className="py-3 font-mono">
                    <span className="text-rose-400 block font-semibold">{rma.rmaNumber}</span>
                    <span className="text-[10px] text-slate-500">{rma.orderId}</span>
                  </td>
                  <td className="py-3">
                    <span className="font-semibold text-slate-200 block">{rma.customer}</span>
                    <span className="text-slate-400 text-[11px]">{rma.item}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                        rma.grade === "GRADE_A_NEW"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : rma.grade === "GRADE_C_REFURB"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {rma.grade}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-[11px] text-cyan-400">{rma.disposition}</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">${rma.recoveryValue.toFixed(2)}</td>
                  <td className="py-3 text-right text-slate-200 font-semibold">${rma.refundDue.toFixed(2)}</td>
                  <td className="py-3 text-center">
                    {rma.fraudFlag ? (
                      <span className="p-1 bg-rose-500/20 text-rose-400 rounded-lg inline-flex" title="High Risk Fraud Flag">
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg inline-flex" title="Clean History">
                        <CheckCircle2 className="h-4 w-4" />
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
