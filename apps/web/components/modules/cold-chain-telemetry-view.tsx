"use client";

import React, { useState } from "react";
import {
  Thermometer,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Radio,
  Clock
} from "lucide-react";

interface ColdChainShipment {
  id: string;
  drugName: string;
  zone: string;
  currentTemp: number;
  mkt: number;
  targetRange: string;
  readingsCount: number;
  status: "NORMAL" | "EXCURSION_ALERT";
}

const SHIPMENTS: ColdChainShipment[] = [
  { id: "LOT-BIO-901", drugName: "mRNA Oncology Vaccine", zone: "Ultra-Low (-80°C)", currentTemp: -72.4, mkt: -71.8, targetRange: "-80°C to -60°C", readingsCount: 720, status: "NORMAL" },
  { id: "LOT-INS-402", drugName: "Biosimilar Insulin Glargine", zone: "Chilled (+2°C to +8°C)", currentTemp: 4.8, mkt: 5.1, targetRange: "+2.0°C to +8.0°C", readingsCount: 1440, status: "NORMAL" },
  { id: "LOT-MONO-112", drugName: "Monoclonal Antibodies mAb-X", zone: "Chilled (+2°C to +8°C)", currentTemp: 5.2, mkt: 5.4, targetRange: "+2.0°C to +8.0°C", readingsCount: 480, status: "NORMAL" },
];

export function ColdChainTelemetryView() {
  const [shipments, setShipments] = useState<ColdChainShipment[]>(SHIPMENTS);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
              <Thermometer className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Real-Time Cold Chain IoT Telemetry & MKT Arrhenius Monitor</h2>
              <p className="text-sm text-slate-400">
                Mean Kinetic Temperature (MKT) excursion calculations & FDA 21 CFR Part 11 electronic records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            100% Thermal Potency Intact
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active IoT Sensors</span>
            <Radio className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">3 Active Loggers</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> BLE & Cellular 5G Connected
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Telemetry Samples</span>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">2,640 Data Points</div>
          <div className="text-xs text-slate-400 mt-1">1-minute interval sampling</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Thermal Excursions</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">0 Excursions</div>
          <div className="text-xs text-slate-400 mt-1">Zero temperature breaches</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FDA 21 CFR Part 11</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">Audit Sealed</div>
          <div className="text-xs text-slate-400 mt-1">Cryptographic tamper proof</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            In-Transit Biopharmaceutical Temperature Telemetry
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Shipment Batch #</th>
                <th className="py-3 px-4 font-semibold">Biologics Commodity</th>
                <th className="py-3 px-4 font-semibold">Temperature Zone</th>
                <th className="py-3 px-4 font-semibold text-right">Live Reading</th>
                <th className="py-3 px-4 font-semibold text-right">MKT Arrhenius</th>
                <th className="py-3 px-4 font-semibold text-right">Target Range</th>
                <th className="py-3 px-4 font-semibold text-center">Quality Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {shipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">{s.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-100">{s.drugName}</td>
                  <td className="py-3.5 px-4 text-slate-300">{s.zone}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    {s.currentTemp > 0 ? `+${s.currentTemp.toFixed(1)}°C` : `${s.currentTemp.toFixed(1)}°C`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-indigo-400">
                    {s.mkt > 0 ? `+${s.mkt.toFixed(1)}°C` : `${s.mkt.toFixed(1)}°C`}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400">{s.targetRange}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      INTACT
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
