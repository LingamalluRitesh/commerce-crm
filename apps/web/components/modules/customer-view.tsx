"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  healthScore: number;
  ltv: string;
  status: "active" | "at_risk" | "churned";
  tier: "Tier 1" | "Tier 2";
  industry: string;
  lastInteraction: string;
}

const mockCustomers: CustomerRecord[] = [
  { id: "c1", name: "Alex Morgan", company: "Enterprise Cloud Inc", email: "alex.morgan@enterprise-cloud.io", phone: "+1-555-019-2831", healthScore: 92, ltv: "$250,000.00", status: "active", tier: "Tier 1", industry: "Cloud Infrastructure", lastInteraction: "Executive QBR Call" },
  { id: "c2", name: "Elena Rostova", company: "FinTech Global Payments", email: "elena.rostova@fintech-global.com", phone: "+1-555-018-9481", healthScore: 88, ltv: "$180,000.00", status: "active", tier: "Tier 1", industry: "FinTech", lastInteraction: "Tiered Contract Renewal" },
  { id: "c3", name: "Hiroshi Tanaka", company: "Tokyo Robotics Automation", email: "hiroshi@tokyo-robotics.jp", phone: "+81-3-5550-1928", healthScore: 74, ltv: "$95,000.00", status: "active", tier: "Tier 2", industry: "Robotics", lastInteraction: "Firmware Support Ticket" },
  { id: "c4", name: "David Miller", company: "Apex Logistics Europe", email: "d.miller@apex-logistics.de", phone: "+49-89-5550-1284", healthScore: 54, ltv: "$62,000.00", status: "at_risk", tier: "Tier 2", industry: "Supply Chain", lastInteraction: "SLA Resolution Inquiry" },
  { id: "c5", name: "Sophia Chen", company: "Singapore Data Dynamics", email: "sophia@sg-datadynamics.sg", phone: "+65-6555-0199", healthScore: 96, ltv: "$410,000.00", status: "active", tier: "Tier 1", industry: "Big Data & AI", lastInteraction: "Inference Node Upgrade" },
];

export function CustomerView() {
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "tier1" | "healthy" | "at_risk">("all");
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord | null>(mockCustomers[0]);

  const filtered = mockCustomers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "tier1") return c.tier === "Tier 1";
    if (selectedFilter === "healthy") return c.healthScore >= 80;
    if (selectedFilter === "at_risk") return c.healthScore < 60 || c.status === "at_risk";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Customer 360 & Unified Accounts
          </h2>
          <p className="text-xs text-slate-400">
            Real-time omnichannel telemetry, health score heuristics, and interaction timeline.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">📥 Export CSV</Button>
          <Button variant="default" size="sm">+ Register Customer</Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by contact name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: "all", label: "All Accounts" },
              { id: "tier1", label: "⭐ Tier 1 VIP" },
              { id: "healthy", label: "🟢 Healthy (80+)" },
              { id: "at_risk", label: "⚠️ Churn Risk (<60)" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === f.id
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Table + Customer 360 Slide Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Directory Table */}
        <div className="lg:col-span-2">
          <Card variant="bordered" className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer / Company</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Lifetime Value</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const isSelected = activeCustomer?.id === c.id;
                  return (
                    <TableRow
                      key={c.id}
                      onClick={() => setActiveCustomer(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-950/40 border-l-4 border-l-indigo-500" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="font-bold text-white text-xs">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.company}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.healthScore >= 80
                                  ? "bg-emerald-400 shadow-glow-emerald"
                                  : c.healthScore >= 60
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${c.healthScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {c.healthScore}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-xs text-indigo-400">
                        {c.ltv}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={c.tier === "Tier 1" ? "purple" : "secondary"}
                          size="sm"
                        >
                          {c.tier}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button variant="ghost" size="xs">
                          View 360 →
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Customer 360 Detail Drawer */}
        <div className="lg:col-span-1">
          {activeCustomer ? (
            <Card variant="bordered" className="p-6 space-y-5 sticky top-24">
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-black text-lg text-white">{activeCustomer.name}</h3>
                  <p className="text-xs text-indigo-400 font-semibold">{activeCustomer.company}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeCustomer.industry}</p>
                </div>
                <Badge
                  variant={activeCustomer.status === "active" ? "success" : "destructive"}
                  dot
                >
                  {activeCustomer.status.toUpperCase()}
                </Badge>
              </div>

              {/* Health Score Gauge Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Real-time Health Score
                  </span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {activeCustomer.healthScore} / 100
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30">
                  Optimal
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-200">{activeCustomer.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-200">{activeCustomer.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Lifetime Value:</span>
                  <span className="font-mono font-bold text-indigo-400">{activeCustomer.ltv}</span>
                </div>
              </div>

              {/* Interaction Timeline Feed */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Latest Interaction
                </span>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  💬 <span className="font-semibold text-white">{activeCustomer.lastInteraction}</span>
                  <div className="text-[10px] text-slate-400 mt-1">Conducted yesterday by Solutions Architect</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm">Log Meeting</Button>
                <Button variant="default" size="sm">+ Create Quote</Button>
              </div>
            </Card>
          ) : (
            <Card variant="bordered" className="p-6 text-center text-xs text-slate-500">
              Select a customer to view complete Customer 360 profile.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
