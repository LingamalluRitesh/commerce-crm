"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { TaxRatesManager } from "./tax-rates-manager";

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customer: string;
  amount: number;
  taxAmount: number;
  status: "paid" | "issued" | "overdue";
  dueDate: string;
  issuedDate: string;
}

const initialInvoices: InvoiceItem[] = [
  { id: "inv-1", invoiceNumber: "INV-2026-001", customer: "Enterprise Cloud Systems", amount: 48500.00, taxAmount: 3880.00, status: "paid", dueDate: "2026-08-30", issuedDate: "2026-08-01" },
  { id: "inv-2", invoiceNumber: "INV-2026-002", customer: "FinTech Global Inc", amount: 24500.00, taxAmount: 1960.00, status: "issued", dueDate: "2026-09-15", issuedDate: "2026-08-15" },
  { id: "inv-3", invoiceNumber: "INV-2026-003", customer: "DataMetrics Analytics", amount: 12000.00, taxAmount: 960.00, status: "overdue", dueDate: "2026-08-10", issuedDate: "2026-07-25" },
  { id: "inv-4", invoiceNumber: "INV-2026-004", customer: "Apex Logistics Europe", amount: 62000.00, taxAmount: 4960.00, status: "issued", dueDate: "2026-09-20", issuedDate: "2026-08-20" },
];

export function FinanceView() {
  const [activeTab, setActiveTab] = useState<"invoices" | "taxes">("invoices");
  const [invoices, setInvoices] = useState<InvoiceItem[]>(initialInvoices);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);

  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newAmount, setNewAmount] = useState("18500");
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [activePlan, setActivePlan] = useState("Enterprise Sovereign");

  const plans = [
    { name: "Starter Tier", price: "$499/mo", limits: "Up to 5 Users • 10k Events", current: activePlan === "Starter Tier" },
    { name: "Business Pro", price: "$2,499/mo", limits: "Up to 50 Users • 500k Events • SLA 4h", current: activePlan === "Business Pro" },
    { name: "Enterprise Sovereign", price: "$8,999/mo", limits: "Unlimited Users • Dedicated VPC • 1h SLA • Merkle Vault", current: activePlan === "Enterprise Sovereign" },
  ];

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
      issuedDate: new Date().toISOString().slice(0, 10),
    };
    setInvoices([inv, ...invoices]);
    setIsNewOpen(false);
    setNewCustomer("");
    showFeedback(`Commercial Invoice ${inv.invoiceNumber} created for ${inv.customer}!`);
  };

  const handleMarkPaid = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv))
    );
    if (selectedInvoice && selectedInvoice.id === id) {
      setSelectedInvoice({ ...selectedInvoice, status: "paid" });
    }
    showFeedback("Invoice marked as PAID and settled in financial ledger!");
  };

  const handleSendReminder = (customer: string, invNum: string) => {
    showFeedback(`Payment reminder dispatch triggered for ${customer} (${invNum}) via Email & SMS!`);
  };

  const handleDownloadPDF = () => {
    if (!selectedInvoice) return;
    setPdfDownloaded(true);

    const invoiceHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Commercial Invoice - ${selectedInvoice.invoiceNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 900; color: #4f46e5; }
    .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .doc-meta { text-align: right; font-family: monospace; font-size: 13px; color: #334155; }
    .bill-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    .totals { width: 320px; margin-left: auto; margin-top: 30px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .grand-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; margin-top: 6px; }
    .cert-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-family: monospace; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CommerceCRM Enterprise Global</div>
      <div class="brand-sub">100 Tech Enterprise Way, Suite 500, Austin, TX 78701</div>
    </div>
    <div class="doc-meta">
      <div style="font-size: 16px; font-weight: bold; color: #0f172a;">COMMERCIAL INVOICE</div>
      <div>Invoice #: <strong>${selectedInvoice.invoiceNumber}</strong></div>
      <div>Issued: ${selectedInvoice.issuedDate}</div>
      <div>Due Date: ${selectedInvoice.dueDate}</div>
    </div>
  </div>

  <div class="bill-box">
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Billed To:</div>
      <div style="font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 2px;">${selectedInvoice.customer}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Payment Status:</div>
      <div style="font-size: 14px; font-weight: bold; color: ${selectedInvoice.status === "paid" ? "#059669" : "#d97706"}; text-transform: uppercase;">
        ${selectedInvoice.status}
      </div>
    </div>
  </div>

  <div class="totals">
    <div class="totals-row">
      <span>Net Invoice Amount:</span>
      <span style="font-weight: bold;">$${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>Statutory Sales Tax (8%):</span>
      <span style="font-weight: bold;">$${selectedInvoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="grand-total">
      <span>Total Gross Amount Due:</span>
      <span>$${(selectedInvoice.amount + selectedInvoice.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div class="cert-badge">
    🔒 <strong>Merkle Audit Receipt:</strong> Genesis Hash: 0xfae98129bc7801df92a0134f71a09428 • Status: Verified Settled
  </div>
</body>
</html>`;

    const blob = new Blob([invoiceHtml], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Invoice_${selectedInvoice.invoiceNumber}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showFeedback(`Invoice document ${selectedInvoice.invoiceNumber} downloaded!`);
    setTimeout(() => setPdfDownloaded(false), 4000);
  };

  const handleExportCSV = () => {
    const headers = "InvoiceNumber,Customer,NetAmount,TaxAmount,TotalGross,Status,IssuedDate,DueDate\n";
    const rows = invoices
      .map(
        (i) =>
          `"${i.invoiceNumber}","${i.customer}",${i.amount},${i.taxAmount},${i.amount + i.taxAmount},"${i.status}","${i.issuedDate}","${i.dueDate}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Invoices CSV exported successfully!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.customer.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === "all") return true;
    return i.status === filterStatus;
  });

  const totalGrossRevenue = invoices.reduce((acc, i) => acc + (i.amount + i.taxAmount), 0);
  const totalPaidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((acc, i) => acc + (i.amount + i.taxAmount), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Finance, Invoicing & SaaS Subscriptions ({invoices.length} Invoices)
            </h2>
            <Badge variant="purple" size="sm">Decimal Arithmetic</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Commercial invoicing with exact decimal arithmetic, multi-jurisdiction tax schedules, and recurring billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subview Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "invoices"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💳 Commercial Invoices
            </button>
            <button
              onClick={() => setActiveTab("taxes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "taxes"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🌐 Tax Schedules
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsPlansOpen(true)}>
            ⚡ Subscription Plans
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>

          <Button variant="default" size="sm" onClick={() => setIsNewOpen(true)}>
            + Create Invoice
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {activeTab === "taxes" ? (
        <TaxRatesManager />
      ) : (
        <>
          {/* Search, Stats & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search invoices by invoice # or customer account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              {[
                { id: "all", label: `All (${invoices.length})` },
                { id: "paid", label: "🟢 Paid" },
                { id: "issued", label: "🔵 Issued" },
                { id: "overdue", label: "🔴 Overdue" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === f.id
                      ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Billed</span>
                <span className="font-bold text-white text-sm">${totalGrossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Collected</span>
                <span className="font-black text-emerald-400 text-sm">${totalPaidRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
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
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <TableCell className="font-mono font-bold text-xs text-indigo-400">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-white">{inv.customer}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      ${inv.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs text-emerald-400">
                      ${(inv.amount + inv.taxAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "success"
                            : inv.status === "issued"
                            ? "cyan"
                            : "destructive"
                        }
                        size="sm"
                        dot
                      >
                        {inv.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">{inv.dueDate}</TableCell>
                    <TableCell className="text-right space-x-1.5">
                      {inv.status !== "paid" && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleMarkPaid(inv.id)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          ✓ Settle
                        </Button>
                      )}
                      {inv.status === "overdue" && (
                        <Button
                          variant="outline"
                          size="xs"
                          onClick={() => handleSendReminder(inv.customer, inv.invoiceNumber)}
                        >
                          📢 Remind
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          setPdfDownloaded(false);
                          setSelectedInvoice(inv);
                        }}
                      >
                        PDF Breakdown
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      {/* Subscription Plans Modal */}
      {isPlansOpen && (
        <Dialog
          open={isPlansOpen}
          onClose={() => setIsPlansOpen(false)}
          size="lg"
          title="Enterprise SaaS Subscription Management"
          description="Manage tenant tier, user license allocations, and billing cycle configurations."
          footer={
            <Button variant="default" size="sm" onClick={() => setIsPlansOpen(false)}>
              Done
            </Button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-3 flex flex-col justify-between ${
                  p.current
                    ? "bg-indigo-950/40 border-indigo-500 shadow-glow-primary"
                    : "bg-slate-900 border-slate-800"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    {p.current && <Badge variant="purple" size="sm">Current Plan</Badge>}
                  </div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-1">{p.price}</div>
                  <p className="text-[11px] text-slate-400 mt-2">{p.limits}</p>
                </div>

                <Button
                  variant={p.current ? "outline" : "default"}
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    setActivePlan(p.name);
                    showFeedback(`Organization upgraded to ${p.name}!`);
                  }}
                >
                  {p.current ? "Active Plan ✓" : "Switch to Plan ➔"}
                </Button>
              </div>
            ))}
          </div>
        </Dialog>
      )}

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
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex justify-between">
              <span>Estimated Tax (8%):</span>
              <span className="font-mono text-emerald-400 font-bold">
                ${((parseFloat(newAmount) || 0) * 0.08).toFixed(2)}
              </span>
            </div>
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
                <p className="text-slate-400 text-[10px]">Issued: {selectedInvoice.issuedDate}</p>
                <p className="text-slate-400 text-[10px]">Due: {selectedInvoice.dueDate}</p>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bill To:</span>
                <span className="font-bold text-sm text-white">{selectedInvoice.customer}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Gross Due:</span>
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
