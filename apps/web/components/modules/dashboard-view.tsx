"use client";

import React from "react";
import { StatCard } from "../ui/stat-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xl">👋</span>
            <h1 className="text-2xl font-black tracking-tight">Enterprise Overview</h1>
            <Badge variant="purple" size="sm">Multi-Tenant OS</Badge>
          </div>
          <p className="text-xs text-indigo-200 max-w-xl">
            Real-time telemetry across Sales CRM, Omnichannel Orders, Customer 360, SLA Support, and AI Propensity Scoring.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            Export BI Report
          </Button>
          <Button variant="default" size="sm" className="bg-white text-indigo-900 hover:bg-slate-100 shadow-md">
            + New Sales Deal
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Quarterly Sales Won"
          value="$1,248,500"
          change={{ value: "+18.4%", trend: "up", label: "vs last quarter" }}
          icon="💼"
          variant="elevated"
        />
        <StatCard
          title="Active Commerce Orders"
          value="3,420"
          change={{ value: "+9.2%", trend: "up", label: "order volume" }}
          icon="🛒"
          variant="elevated"
        />
        <StatCard
          title="Avg Customer Health"
          value="88 / 100"
          change={{ value: "+4.1 pts", trend: "up", label: "high retention" }}
          icon="❤️"
          variant="elevated"
        />
        <StatCard
          title="Support SLA Compliance"
          value="99.2%"
          change={{ value: "0.1% breach", trend: "neutral", label: "under 4h SLA" }}
          icon="⏱️"
          variant="elevated"
        />
      </div>

      {/* Main Charts & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Pipeline & Revenue Velocity */}
        <Card className="lg:col-span-2" variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue & Pipeline Conversion Velocity</CardTitle>
                <CardDescription>Multi-stage lead propensity and weighted deal forecasts</CardDescription>
              </div>
              <div className="flex space-x-1.5">
                <Badge variant="info">Lead (42)</Badge>
                <Badge variant="warning">Qualified (28)</Badge>
                <Badge variant="purple">Negotiation (14)</Badge>
                <Badge variant="success">Closed-Won (36)</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simulated Visual Pipeline Funnel Progress */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Prospecting & Inbound Leads</span>
                  <span className="font-mono">$2,450,000 (100%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Qualified Discovery & Demo</span>
                  <span className="font-mono">$1,820,000 (74%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "74%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Proposal & Formal Quotation</span>
                  <span className="font-mono">$1,350,000 (55%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "55%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Closed-Won Revenue</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">$1,248,500 (51%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "51%" }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Event Stream & AI Suggestions */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>AI Copilot Live Recommendations</CardTitle>
            <CardDescription>Automated deal actions & anomaly detection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="rounded-xl border border-purple-100 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 dark:text-purple-300">High Propensity Lead</span>
                <Badge variant="purple" size="sm">94% Win Prob</Badge>
              </div>
              <p className="text-xs text-purple-800 dark:text-purple-400 leading-relaxed">
                Stripe Enterprise expansion contract reached negotiation. AI suggests offering 5% multi-year discount to close by Friday.
              </p>
              <Button variant="default" size="xs" className="mt-2 bg-purple-600 hover:bg-purple-700">
                Apply AI Strategy
              </Button>
            </div>

            <div className="rounded-xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">Warehouse Stock Alert</span>
                <Badge variant="warning" size="sm">Reorder Req</Badge>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                SKU <code>SRV-NODE-01</code> in Dallas Warehouse dropped below threshold (4 units remaining).
              </p>
              <Button variant="outline" size="xs" className="mt-2 text-amber-900 dark:text-amber-300">
                Trigger Purchase Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
