"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  taxAmount: number;
  status: "paid" | "issued" | "overdue";
  dueDate: string;
}

const initialInvoices: InvoiceItem[] = [
  { id: "inv-1", invoiceNumber: "INV-2026-001", customer: "Enterprise Cloud Systems", amount: 48500.00, taxAmount: 3880.00, status: "paid", dueDate: "2026-08-30" },
  { id: "inv-2", invoiceNumber: "INV-2026-002", customer: "FinTech Global Inc", amount: 24500.00, taxAmount: 1960.00, status: "issued", dueDate: "2026-09-15" },
  { id: "inv-3", invoiceNumber: "INV-2026-003", customer: "DataMetrics Analytics", amount: 12000.00, taxAmount: 960.00, status: "overdue", dueDate: "2026-08-10" },
];

export function FinanceView() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newAmount, setNewAmount] = useState("15000");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const handleCreateInvoice = () => {
    if (!newCustomer) return;
    const net = parseFloat(newAmount) || 10000;
    const tax = net * 0.08;
    const inv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-00${invoices.length + 1}`,
      customer: newCustomer,
      amount: net,
      taxAmount: tax,
      status: "issued",
      dueDate: "2026-09-30",
    };
    setInvoices([inv, ...invoices]);
    setIsNewOpen(false);
    setNewCustomer("");
  };

  const handleDownloadPDF = () => {
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Finance, Invoicing & SaaS Subscriptions
          </h2>
          <p className="text-xs text-slate-400">
            Commercial invoicing with Decimal precision arithmetic, recurring billing cycles, and client project time tracking.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Subscription Plans</Button>
          <Button variant="default" size="sm" onClick={() => setIsNewOpen(true)}>
            + Create Commercial Invoice
          </Button>
        </div>
      </div>

      <Card variant="bordered" className="overflow-hidden">
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
            {invoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                <TableCell className="font-mono font-bold text-xs text-indigo-400">
                  {inv.invoiceNumber}
                </TableCell>
                <TableCell className="text-xs font-semibold text-white">{inv.customer}</TableCell>
                <TableCell className="font-mono text-xs text-slate-300">${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="font-mono text-xs text-slate-400">${inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="font-mono font-bold text-xs text-emerald-400">
                  ${(inv.amount + inv.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  <Badge variant={inv.status === "paid" ? "success" : inv.status === "issued" ? "cyan" : "destructive"} size="sm" dot>
                    {inv.status.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-400">{inv.dueDate}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="xs" onClick={() => { setPdfDownloaded(false); setSelectedInvoice(inv); }}>
                    View PDF Breakdown
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* New Invoice Modal */}
      {isNewOpen && (
        <Dialog
          open={isNewOpen}
          onClose={() => setIsNewOpen(false)}
          title="Create Commercial Invoice"
          description="Issue formal B2B commercial invoice with statutory tax calculation."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateInvoice}>Issue Invoice</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Customer Account Name"
              placeholder="e.g. Oracle Enterprise Cloud"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
            />
            <Input
              label="Net Invoice Amount ($)"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
          </div>
        </Dialog>
      )}

      {/* Invoice PDF Modal */}
      {selectedInvoice && (
        <Dialog
          open={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          size="lg"
          title={`Commercial Invoice Preview — ${selectedInvoice.invoiceNumber}`}
          description={`Issued to ${selectedInvoice.customer} • Due ${selectedInvoice.dueDate}`}
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>Close</Button>
              <Button variant={pdfDownloaded ? "success" : "default"} size="sm" onClick={handleDownloadPDF}>
                {pdfDownloaded ? "✓ PDF Exported & Sent to Customer" : "Download PDF & Send Receipt"}
              </Button>
            </div>
          }
        >
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 space-y-6 text-xs text-slate-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-base text-indigo-400">CommerceCRM Enterprise Global</h3>
                <p className="text-slate-400 text-[11px]">100 Tech Enterprise Way, Suite 500, Austin, TX</p>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-sm text-white">{selectedInvoice.invoiceNumber}</span>
                <p className="text-slate-400 text-[10px]">Date: 2026-08-25</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bill To:</span>
                <span className="font-bold text-sm text-white">{selectedInvoice.customer}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount Due:</span>
                <span className="font-mono font-black text-base text-emerald-400">
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
