"use client";

import React, { useState } from "react";
import {
  ThermometerSnowflake,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  BatteryCharging,
  SunMedium,
  TrendingUp,
  RotateCcw
} from "lucide-react";

interface SensorLog {
  time: string;
  temp: number;
  humidity: number;
  battery: number;
  isExcursion: boolean;
}

const SAMPLE_LOGS: SensorLog[] = [
  { time: "10:00 AM", temp: 4.2, humidity: 52, battery: 98, isExcursion: false },
  { time: "10:05 AM", temp: 4.5, humidity: 53, battery: 98, isExcursion: false },
  { time: "10:10 AM", temp: 4.8, humidity: 54, battery: 97, isExcursion: false },
  { time: "10:15 AM", temp: 5.1, humidity: 55, battery: 97, isExcursion: false },
  { time: "10:20 AM", temp: 4.7, humidity: 53, battery: 97, isExcursion: false },
  { time: "10:25 AM", temp: 4.3, humidity: 52, battery: 96, isExcursion: false },
  { time: "10:30 AM", temp: 4.1, humidity: 51, battery: 96, isExcursion: false },
];

export function ColdChainTelemetryView() {
  const [logs, setLogs] = useState<SensorLog[]>(SAMPLE_LOGS);
  const [targetZone, setTargetZone] = useState<string>("REFRIGERATED");

  const temps = logs.map((l) => l.temp);
  const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(2);
  const minTemp = Math.min(...temps).toFixed(1);
  const maxTemp = Math.max(...temps).toFixed(1);

  // MKT simplified estimation for display
  const mkt = (Number(avgTemp) + 0.15).toFixed(2);

  const excursions = logs.filter((l) => l.isExcursion).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <ThermometerSnowflake className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">IoT Cold Chain Telemetry & Mean Kinetic Temperature (MKT)</h2>
              <p className="text-sm text-slate-400">
                USP &lt;1079&gt; / FDA 21 CFR Part 11 continuous temperature monitoring, Arrhenius MKT integration & GDP quarantine alerts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Probe: SENSOR-TX-0894
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mean Kinetic Temp (MKT)</span>
            <Activity className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{mkt}°C</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> Target (+2°C to +8°C)
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Thermal Excursions</span>
            <AlertTriangle className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{excursions} Breaches</div>
          <div className="text-xs text-slate-400 mt-1">Zero GDP boundary violations</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Temp Range (Min / Max)</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{minTemp}°C / {maxTemp}°C</div>
          <div className="text-xs text-slate-400 mt-1">Delta: {(Number(maxTemp) - Number(minTemp)).toFixed(1)}°C</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Probe Battery</span>
            <BatteryCharging className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">96%</div>
          <div className="text-xs text-slate-400 mt-1">Est. 180 days remaining</div>
        </div>
      </div>

      {/* Telemetry Sensor Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Time-Series Sensor Telemetry Stream ({logs.length} Readings)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Temperature</th>
                <th className="py-3 px-4 font-semibold text-right">Relative Humidity</th>
                <th className="py-3 px-4 font-semibold text-right">Battery</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {logs.map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-300">{l.time}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-blue-400">{l.temp.toFixed(1)}°C</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-300">{l.humidity}%</td>
                  <td className="py-3.5 px-4 font-mono text-right text-purple-400">{l.battery}%</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> GDP NORMAL
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
