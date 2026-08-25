"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Avatar } from "../ui/avatar";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  healthScore: number;
  lifetimeValue: number;
  status: "active" | "churn_risk" | "vip" | "onboarding";
  lastInteraction: string;
}

const mockCustomers: CustomerRecord[] = [
  {
    id: "c1",
    name: "Alex Morgan",
    email: "alex@enterprise-cloud.io",
    company: "Enterprise Cloud Systems",
    healthScore: 92,
    lifetimeValue: 145000,
    status: "vip",
    lastInteraction: "Today, 10:45 AM - Executive QBR Call",
  },
  {
    id: "c2",
    name: "Elena Rostova",
    email: "elena@fintech-global.com",
    company: "FinTech Global Inc",
    healthScore: 84,
    lifetimeValue: 98000,
    status: "active",
    lastInteraction: "Yesterday - Support Ticket #TK-1044 Resolved",
  },
  {
    id: "c3",
    name: "David Chen",
    email: "david@datametrics.co",
    company: "DataMetrics Analytics",
    healthScore: 48,
    lifetimeValue: 42000,
    status: "churn_risk",
    lastInteraction: "4 days ago - Overdue Invoice Reminder",
  },
  {
    id: "c4",
    name: "Samantha Wright",
    email: "samantha@biohealth.org",
    company: "BioHealth Innovations",
    healthScore: 95,
    lifetimeValue: 210000,
    status: "vip",
    lastInteraction: "2 hours ago - Contract Renewal Signed",
  },
];

export function CustomerView() {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const getStatusBadge = (status: CustomerRecord["status"]) => {
    switch (status) {
      case "vip":
        return <Badge variant="purple" dot>Enterprise VIP</Badge>;
      case "active":
        return <Badge variant="success" dot>Active & Healthy</Badge>;
      case "churn_risk":
        return <Badge variant="destructive" dot>High Churn Risk</Badge>;
      case "onboarding":
        return <Badge variant="info" dot>Onboarding</Badge>;
    }
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <span className="font-bold text-emerald-600 dark:text-emerald-400">{score}/100</span>;
    if (score >= 60) return <span className="font-bold text-amber-500">{score}/100</span>;
    return <span className="font-bold text-rose-600 dark:text-rose-400">{score}/100</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Customer 360 & Unified Accounts</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time customer health telemetry, lifetime revenue value, and omnichannel interaction timelines.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">Export CSV</Button>
          <Button variant="default" size="sm">+ Create Customer</Button>
        </div>
      </div>

      {/* Main Customers Table */}
      <Card variant="bordered">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer / Company</TableHead>
              <TableHead>Health Score</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Lifetime Value (LTV)</TableHead>
              <TableHead>Recent Timeline Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCustomers.map((cust) => (
              <TableRow key={cust.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar fallback={cust.name} size="sm" />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">{cust.name}</div>
                      <div className="text-[11px] text-slate-400">{cust.company}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getHealthBadge(cust.healthScore)}</TableCell>
                <TableCell>{getStatusBadge(cust.status)}</TableCell>
                <TableCell className="font-mono text-xs font-semibold">
                  ${cust.lifetimeValue.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                  {cust.lastInteraction}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="xs" onClick={() => setSelectedCustomer(cust)}>
                    View 360 Timeline
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Customer 360 Detail Drawer / Dialog */}
      {selectedCustomer && (
        <Dialog
          open={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          size="lg"
          title={`Customer 360 — ${selectedCustomer.name} (${selectedCustomer.company})`}
          description="Consolidated omnichannel profile, lifetime financial ledger, and interaction timeline."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>Close</Button>
              <Button variant="default" size="sm">Log New Interaction</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Email Address</span>
                <span className="font-semibold">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Total Revenue</span>
                <span className="font-mono font-bold text-emerald-600">${selectedCustomer.lifetimeValue.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block uppercase tracking-wider text-[10px]">Health Indicator</span>
                <span className="font-bold">{selectedCustomer.healthScore}/100 (Optimal)</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Interaction History Stream</h4>
              <div className="space-y-2 border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-900"></span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Executive QBR Call Completed</div>
                  <div className="text-slate-400 text-[11px]">Today at 10:45 AM • Logged by Account Executive</div>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">Customer discussed upgrading to Enterprise Tier 3 with custom SLA contracts.</p>
                </div>
                <div className="relative pt-3">
                  <span className="absolute -left-[21px] top-4 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900"></span>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Invoice Payment Received ($24,500.00)</div>
                  <div className="text-slate-400 text-[11px]">3 days ago • Automated Stripe Webhook</div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
