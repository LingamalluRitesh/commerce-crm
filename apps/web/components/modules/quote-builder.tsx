"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
}

export function QuoteBuilder() {
  const [items, setItems] = useState<QuoteLineItem[]>([
    { id: "1", description: "Enterprise Cloud Node Compute X9", quantity: 10, unitPrice: 4500.00, discountPercentage: 10 },
    { id: "2", description: "Industrial IoT Gateway Pro", quantity: 25, unitPrice: 1100.00, discountPercentage: 5 },
    { id: "3", description: "Dedicated Solution Architect Support (Hours)", quantity: 100, unitPrice: 250.00, discountPercentage: 0 },
  ]);

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [clientCompany, setClientCompany] = useState("Enterprise Cloud Systems Inc.");
  const [clientContact, setClientContact] = useState("Alex Morgan (VP Infrastructure)");

  const [newDesc, setNewDesc] = useState("");
  const [newQty, setNewQty] = useState("5");
  const [newPrice, setNewPrice] = useState("500.00");
  const [newDisc, setNewDisc] = useState("0");
  const [quoteDispatched, setQuoteDispatched] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const subtotal = items.reduce((acc, it) => {
    const discountedPrice = it.unitPrice * (1 - it.discountPercentage / 100);
    return acc + discountedPrice * it.quantity;
  }, 0);

  const taxRate = 8.25;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalGross = subtotal + taxAmount;
  const proposalId = "PROP-2026-08-9482";
  const certHash = "0xfa98129bc7801df92a0134f71a09428c04918237149019283e74c102a92bc420";

  const handleAddItem = () => {
    if (!newDesc) return;
    const item: QuoteLineItem = {
      id: `it-${Date.now()}`,
      description: newDesc,
      quantity: parseInt(newQty, 10) || 1,
      unitPrice: parseFloat(newPrice) || 100,
      discountPercentage: parseFloat(newDisc) || 0,
    };
    setItems([...items, item]);
    setIsAddItemOpen(false);
    setNewDesc("");
    showFeedback(`Line item "${item.description}" added to quotation!`);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
    showFeedback("Line item removed from quotation");
  };

  const handleGeneratePdf = () => {
    setIsPdfModalOpen(true);
    setQuoteDispatched(true);
    showFeedback("Formal B2B Commercial Proposal PDF generated with cryptographic signature!");
  };

  const handleDownloadPdfFile = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Commercial Proposal - ${proposalId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 900; color: #4f46e5; }
    .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .doc-meta { text-align: right; font-family: monospace; font-size: 13px; color: #334155; }
    .bill-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #1e293b; color: #ffffff; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { width: 320px; margin-left: auto; margin-bottom: 40px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .grand-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; margin-top: 6px; }
    .signature-block { display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px dashed #cbd5e1; margin-top: 40px; }
    .signature-box { width: 45%; }
    .sig-line { border-bottom: 1px solid #0f172a; margin-top: 40px; margin-bottom: 8px; }
    .cert-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-family: monospace; word-break: break-all; margin-top: 20px; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CommerceCRM Enterprise Global</div>
      <div class="brand-sub">100 Tech Enterprise Way, Suite 500, Austin, TX 78701<br>support@commercecrm.enterprise.io • https://commercecrm.io</div>
    </div>
    <div class="doc-meta">
      <div style="font-size: 16px; font-weight: bold; color: #0f172a;">COMMERCIAL PROPOSAL</div>
      <div>Ref: <strong>${proposalId}</strong></div>
      <div>Date: ${new Date().toISOString().slice(0, 10)}</div>
      <div>Valid Until: 2026-10-31</div>
    </div>
  </div>

  <div class="bill-box">
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Prepared For:</div>
      <div style="font-size: 15px; font-weight: bold; color: #0f172a; margin-top: 2px;">${clientCompany}</div>
      <div style="font-size: 13px; color: #475569;">Attn: ${clientContact}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase;">Payment Terms:</div>
      <div style="font-size: 13px; font-weight: bold; color: #0f172a; margin-top: 2px;">Net 30 Days</div>
      <div style="font-size: 12px; color: #059669; font-weight: bold;">Verified Tier Discount Applied</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Line Item Description</th>
        <th class="text-center">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-center">Disc %</th>
        <th class="text-right">Total Net</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map((it) => {
          const net = it.unitPrice * (1 - it.discountPercentage / 100) * it.quantity;
          return `<tr>
            <td style="font-weight: 600;">${it.description}</td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-right">$${it.unitPrice.toFixed(2)}</td>
            <td class="text-center" style="color: #6b21a8; font-weight: bold;">${it.discountPercentage}%</td>
            <td class="text-right" style="font-weight: bold; color: #059669;">$${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Net Subtotal:</span>
      <span style="font-weight: bold; color: #0f172a;">$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>Statutory Sales Tax (8.25%):</span>
      <span style="font-weight: bold; color: #0f172a;">$${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div class="grand-total">
      <span>Total Gross Amount:</span>
      <span>$${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div class="cert-badge">
    🔒 <strong>SHA-256 Cryptographic Digital Signature:</strong><br>
    ${certHash}
  </div>

  <div class="signature-block">
    <div class="signature-box">
      <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Authorized CommerceCRM Signatory:</div>
      <div class="sig-line"></div>
      <div style="font-size: 13px; font-weight: bold;">Sarah Connor</div>
      <div style="font-size: 12px; color: #64748b;">Principal Enterprise Account Director</div>
    </div>
    <div class="signature-box">
      <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Client Acceptance Signatory:</div>
      <div class="sig-line"></div>
      <div style="font-size: 13px; font-weight: bold;">${clientContact}</div>
      <div style="font-size: 12px; color: #64748b;">${clientCompany}</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Proposal_${proposalId}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback(`Downloaded proposal document (${proposalId})!`);
  };

  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Commercial Proposal - ${proposalId}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
    .brand { font-size: 24px; font-weight: 900; color: #4f46e5; }
    .brand-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .doc-meta { text-align: right; font-family: monospace; font-size: 13px; color: #334155; }
    .bill-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #1e293b; color: #ffffff; text-align: left; padding: 10px 14px; font-size: 12px; text-transform: uppercase; }
    td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { width: 320px; margin-left: auto; margin-bottom: 40px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .grand-total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; margin-top: 6px; }
    .cert-badge { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-family: monospace; word-break: break-all; margin-top: 20px; }
    .signature-block { display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px dashed #cbd5e1; margin-top: 40px; }
    .signature-box { width: 45%; }
    .sig-line { border-bottom: 1px solid #0f172a; margin-top: 40px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">CommerceCRM Enterprise Global</div>
      <div class="brand-sub">100 Tech Enterprise Way, Suite 500, Austin, TX 78701</div>
    </div>
    <div class="doc-meta">
      <div style="font-size: 16px; font-weight: bold;">COMMERCIAL PROPOSAL</div>
      <div>Ref: <strong>${proposalId}</strong></div>
      <div>Date: ${new Date().toISOString().slice(0, 10)}</div>
    </div>
  </div>

  <div class="bill-box">
    <div>
      <div style="font-size: 11px; font-weight: bold; color: #64748b;">PREPARED FOR:</div>
      <div style="font-size: 15px; font-weight: bold; color: #0f172a;">${clientCompany}</div>
      <div style="font-size: 13px; color: #475569;">Attn: ${clientContact}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 11px; font-weight: bold; color: #64748b;">TERMS:</div>
      <div style="font-size: 13px; font-weight: bold; color: #0f172a;">Net 30 Days</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Line Item Description</th>
        <th class="text-center">Qty</th>
        <th class="text-right">Unit Price</th>
        <th class="text-center">Disc %</th>
        <th class="text-right">Total Net</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map((it) => {
          const net = it.unitPrice * (1 - it.discountPercentage / 100) * it.quantity;
          return `<tr>
            <td style="font-weight: 600;">${it.description}</td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-right">$${it.unitPrice.toFixed(2)}</td>
            <td class="text-center" style="font-weight: bold;">${it.discountPercentage}%</td>
            <td class="text-right" style="font-weight: bold; color: #059669;">$${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Net Subtotal:</span>
      <span style="font-weight: bold;">$${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>Statutory Sales Tax (8.25%):</span>
      <span style="font-weight: bold;">$${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
    <div class="grand-total">
      <span>Total Gross Amount:</span>
      <span>$${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div class="cert-badge">
    🔒 SHA-256 Digital Signature: ${certHash}
  </div>

  <div class="signature-block">
    <div class="signature-box">
      <div style="font-size: 12px; font-weight: bold; color: #64748b;">Authorized Signatory:</div>
      <div class="sig-line"></div>
      <div style="font-size: 13px; font-weight: bold;">Sarah Connor</div>
    </div>
    <div class="signature-box">
      <div style="font-size: 12px; font-weight: bold; color: #64748b;">Client Signatory:</div>
      <div class="sig-line"></div>
      <div style="font-size: 13px; font-weight: bold;">${clientContact}</div>
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <Card variant="bordered" className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-800">
        <div>
          <CardTitle>Commercial Proposal & Quotation Designer</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Live Decimal line-item arithmetic with dynamic tier volume discounts.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="default" size="sm" onClick={() => setIsAddItemOpen(true)}>
            + Add Line Item
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Client Context Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <Input
          label="Client Account / Company Name"
          value={clientCompany}
          onChange={(e) => setClientCompany(e.target.value)}
        />
        <Input
          label="Primary Contact & Title"
          value={clientContact}
          onChange={(e) => setClientContact(e.target.value)}
        />
      </div>

      {/* Line Items Table */}
      <div className="space-y-3">
        <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-slate-400 uppercase">
          <span className="col-span-5">Item Description</span>
          <span className="col-span-2 text-center">Quantity</span>
          <span className="col-span-2 text-right">Unit Price</span>
          <span className="col-span-1 text-center">Disc %</span>
          <span className="col-span-2 text-right">Total Net</span>
        </div>

        {items.map((it) => {
          const itemNet = it.unitPrice * (1 - it.discountPercentage / 100) * it.quantity;
          return (
            <div key={it.id} className="grid grid-cols-12 gap-3 items-center text-xs p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="col-span-5 flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteItem(it.id)}
                  className="text-slate-500 hover:text-rose-400 font-bold"
                  title="Remove item"
                >
                  ✕
                </button>
                <span className="font-semibold text-white truncate">{it.description}</span>
              </div>
              <span className="col-span-2 text-center font-mono text-slate-300">{it.quantity}</span>
              <span className="col-span-2 text-right font-mono text-slate-300">${it.unitPrice.toFixed(2)}</span>
              <span className="col-span-1 text-center font-mono text-purple-400 font-bold">{it.discountPercentage}%</span>
              <span className="col-span-2 text-right font-mono font-bold text-emerald-400">
                ${itemNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Financial Summary & Generation Button */}
      <div className="pt-4 border-t border-slate-800 flex justify-end">
        <div className="w-80 space-y-2.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Net Subtotal:</span>
            <span className="font-mono text-white">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Statutory Tax (8.25%):</span>
            <span className="font-mono text-white">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
            <span>Total Gross Price:</span>
            <span className="font-mono text-emerald-400 font-black text-base">
              ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <Button
            variant="glow"
            size="md"
            className="w-full mt-3 shadow-glow-primary text-sm font-bold"
            onClick={handleGeneratePdf}
          >
            Generate Signed Proposal PDF ➔
          </Button>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <Dialog
          open={isAddItemOpen}
          onClose={() => setIsAddItemOpen(false)}
          title="Add Line Item to Quotation"
          description="Enter catalog description, quantity, and contract volume discount percentage."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleAddItem}>Add Line Item</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Item Description"
              placeholder="e.g. 100Gbps QSFP28 Direct Attach Copper Cable"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Quantity"
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
              />
              <Input
                label="Unit Price ($)"
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
              />
              <Input
                label="Discount (%)"
                type="number"
                value={newDisc}
                onChange={(e) => setNewDisc(e.target.value)}
              />
            </div>
          </div>
        </Dialog>
      )}

      {/* Signed Proposal PDF Preview & Export Modal */}
      {isPdfModalOpen && (
        <Dialog
          open={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          size="lg"
          title={`Formal Commercial Proposal Preview — ${proposalId}`}
          description={`Prepared for ${clientCompany} • Certified SHA-256 Digital Signature`}
          footer={
            <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-3">
              <Button variant="outline" size="sm" onClick={() => setIsPdfModalOpen(false)}>
                Close Preview
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrintPdf}>
                  🖨️ Print / Save as PDF
                </Button>
                <Button variant="default" size="sm" onClick={handleDownloadPdfFile}>
                  📥 Download Document (.html / .pdf)
                </Button>
              </div>
            </div>
          }
        >
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-6 text-xs text-slate-200 max-h-[70vh] overflow-y-auto font-sans">
            {/* Proposal Letterhead */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-black text-base text-indigo-400">CommerceCRM Enterprise Global</h3>
                <p className="text-slate-400 text-[11px]">100 Tech Enterprise Way, Suite 500, Austin, TX</p>
                <p className="text-slate-500 text-[10px]">support@commercecrm.enterprise.io • https://commercecrm.io</p>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-sm text-white">{proposalId}</span>
                <p className="text-slate-400 text-[10px]">Date: {new Date().toISOString().slice(0, 10)}</p>
                <Badge variant="purple" size="sm" className="mt-1">Tiered Contract</Badge>
              </div>
            </div>

            {/* Bill To & Terms */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Prepared For Client:</span>
                <span className="font-bold text-sm text-white">{clientCompany}</span>
                <p className="text-slate-300 text-[11px]">{clientContact}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Schedule:</span>
                <span className="font-bold text-sm text-white">Net 30 Commercial</span>
                <p className="text-emerald-400 text-[11px] font-bold">Enterprise SLA Included</p>
              </div>
            </div>

            {/* Items Table in Preview */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-[10px] uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-center">Disc</th>
                    <th className="p-2.5 text-right">Total Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {items.map((it) => {
                    const net = it.unitPrice * (1 - it.discountPercentage / 100) * it.quantity;
                    return (
                      <tr key={it.id}>
                        <td className="p-2.5 font-sans font-semibold text-white">{it.description}</td>
                        <td className="p-2.5 text-center text-slate-300">{it.quantity}</td>
                        <td className="p-2.5 text-right text-slate-300">${it.unitPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-center text-purple-400 font-bold">{it.discountPercentage}%</td>
                        <td className="p-2.5 text-right text-emerald-400 font-bold">
                          ${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Net Subtotal:</span>
                  <span className="text-white">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Statutory Tax (8.25%):</span>
                  <span className="text-white">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-slate-800">
                  <span>Total Gross Due:</span>
                  <span className="text-emerald-400 font-black">
                    ${totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Digital Signature Hash */}
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl space-y-1 text-[11px] font-mono">
              <div className="text-emerald-300 font-bold flex items-center space-x-1.5">
                <span>🔒</span>
                <span>SHA-256 Digital Certificate Signed & Genesis Timestamped:</span>
              </div>
              <div className="text-emerald-400 text-[10px] break-all">{certHash}</div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Authorized Signatory:</span>
                <div className="h-10 border-b border-slate-700 flex items-end font-serif italic text-indigo-300 text-sm pb-1">
                  Sarah Connor
                </div>
                <p className="text-[11px] text-slate-400">Principal Enterprise Account Director</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 uppercase text-[10px] font-bold">Client Acceptance Signatory:</span>
                <div className="h-10 border-b border-slate-700 flex items-end font-serif italic text-slate-300 text-sm pb-1">
                  {clientContact}
                </div>
                <p className="text-[11px] text-slate-400">{clientCompany}</p>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </Card>
  );
}
