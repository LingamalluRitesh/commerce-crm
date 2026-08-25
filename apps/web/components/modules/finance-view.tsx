"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  taxAmount: number;
  status: "paid" | "issued" | "overdue";
  dueDate: string;
}

const mockInvoices: InvoiceItem[] = [
  { id: "inv-1", invoiceNumber: "INV-2026-001", customer: "Enterprise Cloud Systems", amount: 48500.00, taxAmount: 3880.00, status: "paid", dueDate: "2026-08-30" },
  { id: "inv-2", invoiceNumber: "INV-2026-002", customer: "FinTech Global Inc", amount: 24500.00, taxAmount: 1960.00, status: "issued", dueDate: "2026-09-15" },
  { id: "inv-3", invoiceNumber: "INV-2026-003", customer: "DataMetrics Analytics", amount: 12000.00, taxAmount: 960.00, status: "overdue", dueDate: "2026-08-10" },
];

export function FinanceView() {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Finance, Invoicing & SaaS Subscriptions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Commercial invoicing with Decimal precision arithmetic, recurring billing cycles, and client project time tracking.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">Subscription Tiers</Button>
          <Button variant="default" size="sm">+ Create Commercial Invoice</Button>
        </div>
      </div>

      <Card variant="bordered">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Customer Account</TableHead>
              <TableHead>Net Amount</TableHead>
              <TableHead>Tax (8%)</TableHead>
              <TableHead>Total Gross</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockInvoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">{inv.customer}</TableCell>
                <TableCell className="font-mono text-xs">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400">${inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                  ${(inv.amount + inv.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={inv.status === "paid" ? "success" : inv.status === "issued" ? "info" : "destructive"} size="sm">
                    {inv.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-500">{inv.dueDate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="xs" onClick={() => setSelectedInvoice(inv)}>
                    View PDF Breakdown
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Invoice PDF Modal */}
      {selectedInvoice && (
        <Dialog
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          size="lg"
          title={`Commercial Invoice PDF Preview — ${selectedInvoice.invoiceNumber}`}
          description={`Issued to ${selectedInvoice.customer} • Due ${selectedInvoice.dueDate}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>Close</Button>
              <Button variant="default" size="sm">Download PDF & Send Receipt</Button>
            </>
          }
        >
          <div className="p-6 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 text-xs text-slate-800 dark:text-slate-200">
            <div className="flex justify-between items-start border-b pb-4 border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-base text-indigo-600">CommerceCRM Enterprise Inc</h3>
                <p className="text-slate-400 text-[11px]">100 Tech Enterprise Way, Suite 500, Austin, TX</p>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-sm">{selectedInvoice.invoiceNumber}</span>
                <p className="text-slate-400 text-[10px]">Date: 2026-08-25</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bill To:</span>
                <span className="font-bold text-sm">{selectedInvoice.customer}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount Due:</span>
                <span className="font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                  ${(selectedInvoice.amount + selectedInvoice.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
