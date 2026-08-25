"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { StatCard } from "../ui/stat-card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

export function DashboardView() {
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D" | "YTD">("30D");
  const [copilotExecuted, setCopilotExecuted] = useState(false);
  const [hoveredDataPoint, setHoveredDataPoint] = useState<number | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Time-range dynamic metric values
  const metricsByRange = {
    "7D": { revenue: "$420,850", growth: "+8.2%", deals: "18 Active", orders: "312 Shipped", tickets: "4 Open" },
    "30D": { revenue: "$1,842,500", growth: "+18.4%", deals: "42 Active", orders: "1,240 Shipped", tickets: "12 Open" },
    "90D": { revenue: "$5,120,000", growth: "+24.1%", deals: "94 Active", orders: "3,890 Shipped", tickets: "28 Open" },
    "YTD": { revenue: "$14,890,200", growth: "+31.8%", deals: "240 Closed", orders: "11,450 Shipped", tickets: "84 Resolved" },
  };

  const current = metricsByRange[timeRange];

  const chartPoints = [
    { day: "Day 1", val: 40, rev: "$120k" },
    { day: "Day 5", val: 55, rev: "$185k" },
    { day: "Day 10", val: 48, rev: "$160k" },
    { day: "Day 15", val: 72, rev: "$240k" },
    { day: "Day 20", val: 65, rev: "$210k" },
    { day: "Day 25", val: 88, rev: "$310k" },
    { day: "Day 30", val: 95, rev: "$380k" },
  ];

  const liveEvents = [
    { id: 1, type: "order.paid.v1", title: "Enterprise Node X9 Paid", amount: "+$4,999.00", time: "2m ago", tenant: "Acme Global", hash: "a8f90...1b2c" },
    { id: 2, type: "lead.converted.v1", title: "Elena Rostova Converted to Deal", amount: "$250,000.00", time: "11m ago", tenant: "FinTech Corp", hash: "98c7a...55e1" },
    { id: 3, type: "stock.adjusted.v1", title: "100 Units Inbounded to Dallas W-1", amount: "100 Qty", time: "24m ago", tenant: "Dallas Mega-Hub", hash: "f1a23...7890" },
    { id: 4, type: "ticket.sla.breach", title: "Urgent Direct Connect Triage", amount: "SLA Active", time: "42m ago", tenant: "Alex Morgan", hash: "44d21...cc01" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Time Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131b2e] to-[#0c111d] border border-slate-800/80 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Executive Platform Command Center
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● All Systems Operational
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-tenant telemetry across CRM, Omnichannel Orders, SLAs, and AI intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Period:</span>
          {(["7D", "30D", "90D", "YTD"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                timeRange === r
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Gross Realized Revenue"
          value={current.revenue}
          change={current.growth}
          isPositive={true}
          icon="💰"
          color="indigo"
          description="SaaS & Hardware Sales"
        />
        <StatCard
          title="Weighted Deal Pipeline"
          value={current.deals}
          change="+12.5%"
          isPositive={true}
          icon="💼"
          color="violet"
          description="Avg win rate: 68%"
        />
        <StatCard
          title="Omnichannel Fulfillment"
          value={current.orders}
          change="+9.1%"
          isPositive={true}
          icon="📦"
          color="emerald"
          description="99.4% On-Time SLA"
        />
        <StatCard
          title="Active SLA Tickets"
          value={current.tickets}
          change="-15.0%"
          isPositive={true}
          icon="🎫"
          color="amber"
          description="Avg response: 18m"
        />
      </div>

      {/* Main Charts & Live Feed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Trajectory SVG Area Chart */}
        <Card variant="bordered" className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <CardTitle>Revenue Velocity & Cash Flow Trajectory</CardTitle>
                <CardDescription>
                  Realized revenue across all sales pipelines & recurring commercial billing
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  {hoveredDataPoint !== null ? chartPoints[hoveredDataPoint].rev : current.revenue}
                </span>
              </div>
            </div>

            {/* Interactive SVG Curve Chart */}
            <div className="relative h-64 w-full pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal guide lines */}
                <line x1="0" y1="40" x2="700" y2="40" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="700" y2="90" stroke="#1e293b" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="700" y2="140" stroke="#1e293b" strokeDasharray="4 4" />

                {/* Gradient Fill Path */}
                <path
                  d="M 0 160 Q 100 120, 200 135 T 400 80 T 600 45 L 700 30 L 700 200 L 0 200 Z"
                  fill="url(#areaGradient)"
                />

                {/* Main Stroke Bezier Curve */}
                <path
                  d="M 0 160 Q 100 120, 200 135 T 400 80 T 600 45 L 700 30"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                {chartPoints.map((pt, idx) => {
                  const x = idx * (700 / (chartPoints.length - 1));
                  const y = 180 - pt.val * 1.5;
                  const isHovered = hoveredDataPoint === idx;
                  return (
                    <g
                      key={idx}
                      onMouseEnter={() => setHoveredDataPoint(idx)}
                      onMouseLeave={() => setHoveredDataPoint(null)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? "7" : "4.5"}
                        className={`transition-all duration-200 ${
                          isHovered
                            ? "fill-white stroke-indigo-400 stroke-[3]"
                            : "fill-indigo-600 stroke-[#0f172a] stroke-[2]"
                        }`}
                      />
                    </g>
                  );
                })}
              </svg>

              <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-2 px-1">
                {chartPoints.map((p, i) => (
                  <span key={i}>{p.day}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Funnel Stats Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Leads</span>
              <span className="font-bold text-white text-sm">342</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Deals</span>
              <span className="font-bold text-indigo-400 text-sm">94</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quotes</span>
              <span className="font-bold text-purple-400 text-sm">62</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Closed Won</span>
              <span className="font-bold text-emerald-400 text-sm">48 (77%)</span>
            </div>
          </div>
        </Card>

        {/* Right Col: Real-Time Event Stream Ticker */}
        <Card variant="bordered" className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <CardTitle>Live Event Bus</CardTitle>
              </div>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <CardDescription className="mb-4">
              Transactional outbox events drained with zero delay
            </CardDescription>

            <div className="space-y-3">
              {liveEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">{evt.title}</span>
                    <span className="font-mono font-bold text-emerald-400">{evt.amount}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span className="font-mono text-[10px] text-indigo-400">{evt.type}</span>
                    <span>{evt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => setIsAuditModalOpen(true)}
          >
            View Complete Event Audit Logs ➔
          </Button>
        </Card>
      </div>

      {/* AI Deal Velocity Copilot Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-xl text-white shadow-glow-violet flex-shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-black text-white text-sm">AI Deal Velocity Recommendation</h3>
              <Badge variant="purple" size="sm">High Confidence 94%</Badge>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              3 high-value enterprise proposals are pending procurement approval. Applying a 10% Q3 tiered contract incentive will accelerate closure by 14 days.
            </p>
          </div>
        </div>

        <Button
          variant={copilotExecuted ? "success" : "glow"}
          size="sm"
          onClick={() => setCopilotExecuted(true)}
          className="flex-shrink-0"
        >
          {copilotExecuted ? "✓ Incentive Triggered via Outbox" : "Execute AI Recommendation"}
        </Button>
      </div>

      {/* Complete Event Audit Logs Dialog */}
      {isAuditModalOpen && (
        <Dialog
          open={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          size="lg"
          title="Transactional Outbox Event Stream & Cryptographic Audit"
          description="Immutable Merkle-chained event record log with zero packet drops."
          footer={
            <Button variant="default" size="sm" onClick={() => setIsAuditModalOpen(false)}>
              Close Feed
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] flex justify-between text-slate-400">
              <span>Merkle Root: <strong className="text-indigo-400">fae98129bc...a09428</strong></span>
              <span>Drained Events: <strong className="text-emerald-400">100% Synced</strong></span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {liveEvents.map((e) => (
                <div key={e.id} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex justify-between items-center text-slate-200">
                  <div>
                    <div className="font-bold">{e.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Topic: {e.type} • Hash: {e.hash}
                    </div>
                  </div>
                  <Badge variant="purple" size="sm">Delivered</Badge>
                </div>
              ))}
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
