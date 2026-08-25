"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

interface TicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  customerName: string;
  priority: "urgent" | "high" | "medium" | "low";
  slaTimeRemaining: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  csatRating?: number;
}

const mockTickets: TicketItem[] = [
  { id: "tk-1", ticketNumber: "TK-1044", subject: "Webhook Dispatch Latency Spike", customerName: "FinTech Global Inc", priority: "urgent", slaTimeRemaining: "1h 45m remaining", status: "in_progress" },
  { id: "tk-2", ticketNumber: "TK-1045", subject: "Custom Domain SSL Certificate Provisioning", customerName: "Enterprise Cloud Systems", priority: "high", slaTimeRemaining: "5h 20m remaining", status: "open" },
  { id: "tk-3", ticketNumber: "TK-1046", subject: "Billing Invoice PDF Tax Breakdown Inquiry", customerName: "BioHealth Innovations", priority: "medium", slaTimeRemaining: "18h remaining", status: "resolved", csatRating: 5 },
];

export function SupportView() {
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);

  const getPriorityBadge = (priority: TicketItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" dot>Urgent (4h SLA)</Badge>;
      case "high":
        return <Badge variant="warning" dot>High (12h SLA)</Badge>;
      case "medium":
        return <Badge variant="info" dot>Medium (24h SLA)</Badge>;
      case "low":
        return <Badge variant="secondary" dot>Low (48h SLA)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Customer Support & Success Plans</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automated priority SLA deadline tracking, internal note threads, CSAT feedback loops, and Knowledge Base articles.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">Knowledge Base Search</Button>
          <Button variant="default" size="sm">+ Open New Ticket</Button>
        </div>
      </div>

      <Card variant="bordered">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID & Subject</TableHead>
              <TableHead>Customer Account</TableHead>
              <TableHead>Priority SLA</TableHead>
              <TableHead>SLA Clock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{t.ticketNumber}</div>
                  <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{t.subject}</div>
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">{t.customerName}</TableCell>
                <TableCell>{getPriorityBadge(t.priority)}</TableCell>
                <TableCell className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  ⏱️ {t.slaTimeRemaining}
                </TableCell>
                <TableCell>
                  <Badge variant={t.status === "resolved" ? "success" : "info"} size="sm">
                    {t.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="xs" onClick={() => setSelectedTicket(t)}>
                    Open Thread
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Ticket Reply Modal */}
      {selectedTicket && (
        <Dialog
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          size="lg"
          title={`${selectedTicket.ticketNumber} — ${selectedTicket.subject}`}
          description={`Customer: ${selectedTicket.customerName} • SLA Status: ${selectedTicket.slaTimeRemaining}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>Close</Button>
              <Button variant="success" size="sm">Resolve & Request CSAT</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
              <div className="font-bold text-slate-700 dark:text-slate-300">Customer Issue Description:</div>
              <p className="text-slate-600 dark:text-slate-400">
                We observed high response times on outbound webhook delivery for order.paid.v1 events between 09:00 and 10:00 UTC today.
              </p>
            </div>

            <div className="p-3.5 border-l-4 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-xl">
              <div className="font-bold text-amber-900 dark:text-amber-300 text-[11px] uppercase">🔒 Internal Staff Note</div>
              <p className="text-amber-800 dark:text-amber-400 mt-1">
                Engineering team investigated: worker thread pool was auto-scaled at 09:45 UTC, normal latency restored.
              </p>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
