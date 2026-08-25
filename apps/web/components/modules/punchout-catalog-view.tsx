"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Building,
  FileCode,
  CheckCircle2,
  Lock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Layers
} from "lucide-react";

interface PunchOutItem {
  sku: string;
  name: string;
  listPrice: number;
  contractPrice: number;
  qty: number;
}

const ITEMS: PunchOutItem[] = [
  { sku: "SRV-XEON-MAX", name: "Enterprise Dual-Socket Xeon Server", listPrice: 8500, contractPrice: 7225, qty: 2 },
  { sku: "SAN-ARRAY-100TB", name: "100TB All-Flash NVMe SAN Array", listPrice: 24000, contractPrice: 20400, qty: 1 },
  { sku: "ETH-SW-400G", name: "400Gbps Leaf Switch 32-Port", listPrice: 12000, contractPrice: 10200, qty: 2 },
];

export function PunchOutCatalogView() {
  const [items, setItems] = useState<PunchOutItem[]>(ITEMS);
  const [cxmlGenerated, setCxmlGenerated] = useState<boolean>(false);

  const totalCart = items.reduce((acc, i) => acc + i.contractPrice * i.qty, 0);
  const totalList = items.reduce((acc, i) => acc + i.listPrice * i.qty, 0);
  const savings = totalList - totalCart;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">B2B cXML / OCI PunchOut Electronic Procurement Catalog</h2>
              <p className="text-sm text-slate-400">
                SAP Ariba & Coupa Procurement authenticated catalog session with dynamic contract tier discount pricing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCxmlGenerated(!cxmlGenerated)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-lg shadow-indigo-900/30"
          >
            <FileCode className="h-4 w-4" /> {cxmlGenerated ? "Hide cXML Message" : "Generate cXML PunchOutOrderMessage"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Contract Cart Total</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">${totalCart.toLocaleString()} USD</div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 15% Contract Tier Applied
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Enterprise Savings</span>
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">${savings.toLocaleString()} USD</div>
          <div className="text-xs text-slate-400 mt-1">Below standard MSRP list</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Buyer ERP Network</span>
            <Building className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-cyan-400">SAP Ariba Network</div>
          <div className="text-xs text-slate-400 mt-1">DUNS: 192837465</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Protocol Standard</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-purple-400">cXML v1.2.014</div>
          <div className="text-xs text-slate-400 mt-1">POSR / POOM compliant</div>
        </div>
      </div>

      {/* Cart Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            PunchOut Order Staging Items
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800/60">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold text-right">MSRP List</th>
                <th className="py-3 px-4 font-semibold text-right">Negotiated Unit Price</th>
                <th className="py-3 px-4 font-semibold text-right">Quantity</th>
                <th className="py-3 px-4 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {items.map((i) => (
                <tr key={i.sku} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{i.sku}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-100">{i.name}</td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-400 line-through">
                    ${i.listPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-emerald-400">
                    ${i.contractPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-right text-slate-200">{i.qty}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-right text-slate-100">
                    ${(i.contractPrice * i.qty).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cxmlGenerated && (
        <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span>Generated cXML PunchOutOrderMessage Payload</span>
            <span className="font-mono text-[11px] text-slate-400">MIME: application/xml</span>
          </div>
          <pre className="p-4 bg-slate-900/80 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd">
<cXML timestamp="2026-08-25T16:00:00Z" payloadIdentity="POS-ARIBA-2026-091">
  <Header>
    <From><Credential domain="NetworkID"><Identity>DUNS:192837465</Identity></Credential></From>
    <To><Credential domain="NetworkID"><Identity>COMMERCE_CRM_HUB</Identity></Credential></To>
  </Header>
  <Message>
    <PunchOutOrderMessage>
      <BuyerCookie>POS-ARIBA-2026-091</BuyerCookie>
      <PunchOutOrderMessageHeader operationAllowed="create">
        <Total><Money currency="USD">${totalCart}.00</Money></Total>
      </PunchOutOrderMessageHeader>
      <!-- ${items.length} line items ready for checkout return -->
    </PunchOutOrderMessage>
  </Message>
</cXML>`}
          </pre>
        </div>
      )}
    </div>
  );
}
