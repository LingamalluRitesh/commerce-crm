"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { StatCard } from "../ui/stat-card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

interface CohortData {
  cohort: string;
  users: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
}

const cohortMatrix: CohortData[] = [
  { cohort: "2026 Q1 Jan", users: 142, m1: 100, m2: 94, m3: 88, m4: 85, m5: 82, m6: 80 },
  { cohort: "2026 Q1 Feb", users: 189, m1: 100, m2: 96, m3: 91, m4: 89, m5: 86, m6: 84 },
  { cohort: "2026 Q1 Mar", users: 215, m1: 100, m2: 95, m3: 92, m4: 88, m5: 85, m6: 83 },
  { cohort: "2026 Q2 Apr", users: 260, m1: 100, m2: 97, m3: 94, m4: 91, m5: 89, m6: 87 },
  { cohort: "2026 Q2 May", users: 310, m1: 100, m2: 98, m3: 95, m4: 93, m5: 90, m6: 88 },
  { cohort: "2026 Q2 Jun", users: 385, m1: 100, m2: 99, m3: 96, m4: 94, m5: 92, m6: 90 },
];

export function AnalyticsView() {
  const [timePeriod, setTimePeriod] = useState<"7D" | "30D" | "90D" | "1Y">("30D");
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null);
  const [isDrilldownOpen, setIsDrilldownOpen] = useState(false);
  const [drilldownTitle, setDrilldownTitle] = useState("");
  const [drilldownData, setDrilldownData] = useState<{ metric: string; val: string; change: string }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const funnelStages = [
    { name: "Top of Funnel (Website & Ads)", count: 24500, dropoff: "100%", conv: "100%", color: "bg-indigo-500" },
    { name: "Qualified Leads (MQL)", count: 8200, dropoff: "-66.5%", conv: "33.5%", color: "bg-purple-500" },
    { name: "Sales Opportunities (SQL)", count: 2450, dropoff: "-70.1%", conv: "10.0%", color: "bg-pink-500" },
    { name: "Formal Quotations / Demos", count: 890, dropoff: "-63.7%", conv: "3.6%", color: "bg-amber-500" },
    { name: "Closed Won Contracts", count: 480, dropoff: "-46.1%", conv: "1.96%", color: "bg-emerald-500" },
  ];

  const handleExportAnalytics = () => {
    const headers = "Cohort,Users,Month1,Month2,Month3,Month4,Month5,Month6\n";
    const rows = cohortMatrix
      .map(
        (c) =>
          `"${c.cohort}",${c.users},${c.m1}%,${c.m2}%,${c.m3}%,${c.m4}%,${c.m5}%,${c.m6}%`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Cohort_Analytics_${timePeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback(`Analytics report exported for period: ${timePeriod}!`);
  };

  const handleDrilldown = (title: string, data: { metric: string; val: string; change: string }[]) => {
    setDrilldownTitle(title);
    setDrilldownData(data);
    setIsDrilldownOpen(true);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#161b2e] to-[#0c111d] border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Business Intelligence & Advanced Analytics
            </h1>
            <Badge variant="purple" size="sm">Real-time OLAP Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Cohort retention heuristics, multi-touch attribution, conversion funnels, and LTV:CAC optimization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {(["7D", "30D", "90D", "1Y"] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  setTimePeriod(period);
                  showFeedback(`Analytics updated to ${period} aggregation window`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timePeriod === period
                    ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleExportAnalytics}>
            📥 Export BI Report
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* 4 Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() =>
            handleDrilldown("Customer Lifetime Value (LTV) vs CAC", [
              { metric: "Average Customer Lifetime Value (LTV)", val: "$284,500.00", change: "+14.2%" },
              { metric: "Blended Customer Acquisition Cost (CAC)", val: "$34,200.00", change: "-8.4%" },
              { metric: "LTV to CAC Efficiency Ratio", val: "8.32x (Target: >3x)", change: "+1.2x" },
              { metric: "Months to CAC Payback", val: "4.8 Months", change: "-0.6 mo" },
            ])
          }
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="LTV : CAC Ratio"
            value="8.32x"
            change="+18.5%"
            isPositive={true}
            icon="📈"
            color="indigo"
            description="Optimal efficiency benchmark"
          />
        </div>

        <div
          onClick={() =>
            handleDrilldown("Net Revenue Retention (NRR) Breakdown", [
              { metric: "Gross Revenue Retention (GRR)", val: "96.4%", change: "+1.2%" },
              { metric: "Expansion ARR (Upsells & Nodes)", val: "$480,000", change: "+28.4%" },
              { metric: "Contraction ARR", val: "$18,500", change: "-4.1%" },
              { metric: "Net Churn Rate", val: "-0.8% (Net Negative)", change: "-0.3%" },
            ])
          }
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Net Revenue Retention (NRR)"
            value="134.8%"
            change="+4.2%"
            isPositive={true}
            icon="💎"
            color="violet"
            description="Expansion outpaces churn"
          />
        </div>

        <div
          onClick={() =>
            handleDrilldown("Average Deal Cycle & Velocity", [
              { metric: "Average Sales Velocity", val: "32 Days", change: "-6 days" },
              { metric: "Average Contract Value (ACV)", val: "$145,000", change: "+22.0%" },
              { metric: "Win Rate at Proposal Stage", val: "77.4%", change: "+5.1%" },
              { metric: "Sales Pipeline Coverage Multiple", val: "4.2x", change: "+0.4x" },
            ])
          }
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Avg Deal Velocity"
            value="32 Days"
            change="-6.4 days"
            isPositive={true}
            icon="⚡"
            color="emerald"
            description="From discovery to signature"
          />
        </div>

        <div
          onClick={() =>
            handleDrilldown("Gross Margin & Unit Economics", [
              { metric: "Gross Software Subscription Margin", val: "88.2%", change: "+1.4%" },
              { metric: "Hardware & Edge Deployment Margin", val: "42.5%", change: "+3.8%" },
              { metric: "Professional Services Margin", val: "54.0%", change: "+0.5%" },
              { metric: "Blended Corporate Gross Margin", val: "74.8%", change: "+2.6%" },
            ])
          }
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard
            title="Blended Gross Margin"
            value="74.8%"
            change="+2.6%"
            isPositive={true}
            icon="💵"
            color="cyan"
            description="High unit-economic margin"
          />
        </div>
      </div>

      {/* Main Sections: Conversion Funnel & Cohort Retention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full Funnel Analytics */}
        <Card variant="bordered" className="lg:col-span-5 p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Multi-Stage Conversion Funnel</CardTitle>
              <CardDescription>
                Audience progression from inbound touchpoints to closed enterprise revenue
              </CardDescription>
            </div>
            <Badge variant="purple" size="sm">1.96% End-to-End</Badge>
          </div>

          <div className="space-y-3 pt-2">
            {funnelStages.map((stage, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedFunnelStage(stage.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedFunnelStage === stage.name
                    ? "bg-indigo-950/40 border-indigo-500 shadow-glow-primary"
                    : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{stage.name}</span>
                  <span className="font-mono font-black text-slate-200">
                    {stage.count.toLocaleString()}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stage.color}`}
                    style={{ width: `${Math.max(6, 100 - idx * 22)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Dropoff: <strong className="text-rose-400">{stage.dropoff}</strong></span>
                  <span>Cumulative Conv: <strong className="text-emerald-400">{stage.conv}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Cohort Retention Heatmap Matrix */}
        <Card variant="bordered" className="lg:col-span-7 p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Enterprise Cohort Retention Heatmap (%)</CardTitle>
              <CardDescription>
                Monthly logo & revenue retention rates tracked across quarterly customer signups
              </CardDescription>
            </div>
            <Badge variant="success" size="sm">90% Month-6 Baseline</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-2.5 px-3">Cohort</th>
                  <th className="py-2.5 px-2 text-center">Accounts</th>
                  <th className="py-2.5 px-2 text-center">M1</th>
                  <th className="py-2.5 px-2 text-center">M2</th>
                  <th className="py-2.5 px-2 text-center">M3</th>
                  <th className="py-2.5 px-2 text-center">M4</th>
                  <th className="py-2.5 px-2 text-center">M5</th>
                  <th className="py-2.5 px-2 text-center">M6</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {cohortMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-sans font-semibold text-white text-xs">{row.cohort}</td>
                    <td className="py-3 px-2 text-center text-slate-300">{row.users}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/30">
                        {row.m1}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded bg-indigo-600/25 text-indigo-300 font-bold">
                        {row.m2}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-400 font-bold">
                        {row.m3}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-400">
                        {row.m4}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded bg-purple-600/20 text-purple-300 font-bold">
                        {row.m5}%
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {row.m6}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center text-xs text-slate-300">
            <span className="font-semibold">Industry Benchmark:</span>
            <span className="text-emerald-400 font-bold">Top 5% Quartile Retention for Enterprise Infrastructure SaaS</span>
          </div>
        </Card>
      </div>

      {/* Drilldown Modal */}
      {isDrilldownOpen && (
        <Dialog
          open={isDrilldownOpen}
          onClose={() => setIsDrilldownOpen(false)}
          title={drilldownTitle}
          description="Detailed dimensional telemetry and period-over-period delta."
          footer={
            <Button variant="default" size="sm" onClick={() => setIsDrilldownOpen(false)}>
              Close Breakdown
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            {drilldownData.map((d, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-white">{d.metric}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Telemetry: Live Query Engine</div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400 text-sm">{d.val}</span>
                  <span className="text-[10px] font-bold text-indigo-400 block">{d.change}</span>
                </div>
              </div>
            ))}
          </div>
        </Dialog>
      )}
    </div>
  );
}
