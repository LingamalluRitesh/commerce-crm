"use client";

import React, { useState } from "react";
import {
  Globe2,
  FileCheck,
  Percent,
  DollarSign,
  Truck,
  ArrowRight,
  ShieldCheck,
  Search,
  Scale
} from "lucide-react";

interface HTSItem {
  code: string;
  desc: string;
  mfnRate: number;
  usmcaRate: number;
  section301: number;
}

const HTS_DATA: HTSItem[] = [
  { code: "8471.50.0150", desc: "Processing units for digital automatic data processing (Servers / Edge Nodes)", mfnRate: 0.0, usmcaRate: 0.0, section301: 25.0 },
  { code: "8542.31.0000", desc: "Electronic integrated circuits: Processors and controllers (CPUs / SOCs)", mfnRate: 0.0, usmcaRate: 0.0, section301: 0.0 },
  { code: "8542.32.0015", desc: "Dynamic read-write random-access memory (DRAM / DDR5 modules)", mfnRate: 0.0, usmcaRate: 0.0, section301: 0.0 },
  { code: "8523.51.0000", desc: "Solid-state non-volatile storage devices (Enterprise NVMe SSDs)", mfnRate: 0.0, usmcaRate: 0.0, section301: 25.0 },
  { code: "8473.30.5100", desc: "Parts and accessories for server machines: Printed circuit assemblies", mfnRate: 0.0, usmcaRate: 0.0, section301: 25.0 },
  { code: "8504.40.6018", desc: "Power supplies for data processing machines (Server Redundant PSUs)", mfnRate: 3.0, usmcaRate: 0.0, section301: 25.0 },
];

export function CustomsHTSView() {
  const [selectedHTS, setSelectedHTS] = useState<HTSItem>(HTS_DATA[0]);
  const [customsValue, setCustomsValue] = useState<number>(50000);
  const [originCountry, setOriginCountry] = useState<string>("CN");
  const [tradeProgram, setTradeProgram] = useState<string>("USMCA");

  // Duty Calculation
  const baseRate = tradeProgram === "USMCA" ? selectedHTS.usmcaRate : selectedHTS.mfnRate;
  const baseDuty = (customsValue * baseRate) / 100;
  const sec301Rate = originCountry === "CN" ? selectedHTS.section301 : 0.0;
  const sec301Duty = (customsValue * sec301Rate) / 100;
  const rawMpf = customsValue * 0.003464;
  const mpf = Math.max(31.67, Math.min(614.35, rawMpf));
  const totalDuty = baseDuty + sec301Duty + mpf;
  const effectivePct = ((totalDuty / customsValue) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Harmonized Tariff Schedule (HTS) Customs Engine</h2>
              <p className="text-sm text-slate-400">
                WCO 10-digit tariff code valuation, Section 301 trade remedies, USMCA regional value content & MPF fees.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <Scale className="h-4 w-4 text-amber-400" />
            CBP Form 7501 Compliant
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Customs Value</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${customsValue.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Declared entered value</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Base Statutory Duty</span>
            <Percent className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${baseDuty.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-1">{baseRate}% {tradeProgram} preferential rate</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Section 301 Remedy</span>
            <ShieldCheck className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${sec301Duty.toFixed(2)}</div>
          <div className="text-xs text-rose-300 mt-1">{sec301Rate}% China origin tariff</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customs Duties</span>
            <Truck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">${totalDuty.toFixed(2)}</div>
          <div className="text-xs text-emerald-300 mt-1">Effective Rate: {effectivePct}%</div>
        </div>
      </div>

      {/* Interactive Tariff Calculator */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Customs Entry Parameter Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Target 10-Digit HTS Code</label>
            <select
              value={selectedHTS.code}
              onChange={(e) => {
                const found = HTS_DATA.find((h) => h.code === e.target.value);
                if (found) setSelectedHTS(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {HTS_DATA.map((h) => (
                <option key={h.code} value={h.code}>
                  {h.code} - {h.desc.substring(0, 35)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Declared Customs Value (USD)</label>
            <input
              type="number"
              value={customsValue}
              onChange={(e) => setCustomsValue(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Country of Origin</label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="CN">China (Subject to Sec 301)</option>
              <option value="MX">Mexico (USMCA Qualified)</option>
              <option value="CA">Canada (USMCA Qualified)</option>
              <option value="TW">Taiwan (MFN Column 1)</option>
              <option value="DE">Germany (EU MFN)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Trade Preference Program</label>
            <select
              value={tradeProgram}
              onChange={(e) => setTradeProgram(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="USMCA">USMCA Preferential (0%)</option>
              <option value="MFN">General Most Favored Nation (MFN)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 bg-slate-950/40 p-4 rounded-xl">
          <div className="text-xs font-semibold text-slate-200 mb-1">
            Selected Classification: <span className="font-mono text-amber-400">{selectedHTS.code}</span>
          </div>
          <div className="text-xs text-slate-400">{selectedHTS.desc}</div>
        </div>
      </div>
    </div>
  );
}
