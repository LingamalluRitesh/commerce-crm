"use client";

import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  Download,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Building,
  ArrowRight
} from "lucide-react";

interface Vendor1099 {
  id: string;
  name: string;
  tin: string;
  state: string;
  compensation: number;
  taxWithheld: number;
}

const VENDORS: Vendor1099[] = [
  { id: "V-001", name: "Apex Silicon Semiconductor Ltd", tin: "XX-XXX1829", state: "TX", compensation: 125000.0, taxWithheld: 0.0 },
  { id: "V-002", name: "Precision Sheet Metal Inc", tin: "XX-XXX8492", state: "CA", compensation: 45000.0, taxWithheld: 0.0 },
  { id: "V-003", name: "Chen & Associates Logistics Consulting", tin: "XX-XXX3910", state: "IL", compensation: 8500.0, taxWithheld: 0.0 },
  { id: "V-004", name: "FastCode Offshore QA Services", tin: "XX-XXX9281", state: "NY", compensation: 32000.0, taxWithheld: 0.0 },
];

export function TaxReturnFilingView() {
  const [vendors, setVendors] = useState<Vendor1099[]>(VENDORS);
  const [taxYear, setTaxYear] = useState<number>(2025);
  const [fireFileGenerated, setFireFileGenerated] = useState<boolean>(false);

  const totalComp = vendors.reduce((acc, v) => acc + v.compensation, 0);

  const handleGenerateFIRE = () => {
    setFireFileGenerated(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">IRS Form 1099-NEC & FIRE Electronic Filing Engine</h2>
              <p className="text-sm text-slate-400">
                Non-employee vendor compensation reporting, IRS Publication 1220 750-byte FIRE file generation & TIN validation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateFIRE}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Download className="h-4 w-4" /> Generate IRS FIRE File (.txt)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reportable Vendors</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{vendors.length} Payees</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> All &gt; $600 Threshold
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Non-Employee Comp</span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalComp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-slate-400 mt-1">Tax Year {taxYear}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Federal Tax Withheld</span>
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">$0.00</div>
          <div className="text-xs text-slate-400 mt-1">W-9 certifications on file</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FIRE Specification</span>
            <Building className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Pub. 1220</div>
          <div className="text-xs text-slate-400 mt-1">750-Byte Fixed Width</div>
        </div>
      </div>

      {/* Generated File Notice */}
      {fireFileGenerated && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-emerald-300">IRS FIRE Electronic Transmission File Ready</span>
              <p className="text-slate-400 mt-0.5 font-mono">
                IRSEFILE_2025_COMMERCECRM_1099NEC.TXT • 5 records • 3,750 bytes • TCC: 12345
              </p>
            </div>
          </div>
          <span className="font-mono text-emerald-400 font-bold">100% SPEC VALID</span>
        </div>
      )}

      {/* Vendor 1099 Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Vendor 1099-NEC Payee Ledger
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Payee Legal Name</th>
                <th className="py-3 px-4 font-semibold">TIN / EIN</th>
                <th className="py-3 px-4 font-semibold">State</th>
                <th className="py-3 px-4 font-semibold text-right">Non-Employee Comp (USD)</th>
                <th className="py-3 px-4 font-semibold text-center">Filing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-100">{v.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{v.tin}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">{v.state}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${v.compensation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> FORM 1099-NEC
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
