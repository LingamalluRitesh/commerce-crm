"use client";

import React, { useState } from "react";
import {
  FileCode2,
  Building2,
  ShoppingCart,
  Send,
  CheckCircle2,
  Globe,
  Code,
  ShieldCheck,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface PunchoutItem {
  sku: string;
  desc: string;
  unitPrice: number;
  unspsc: string;
  uom: string;
  qty: number;
}

export function B2BPunchoutCXMLView() {
  const [sessionId, setSessionId] = useState("POS-9482-ARIB-CORP");
  const [buyerOrg, setBuyerOrg] = useState("Acme Global Enterprises (SAP Ariba)");
  const [returnUrl, setReturnUrl] = useState("https://ariba.acmeglobal.internal/punchout/callback");
  const [cart, setCart] = useState<PunchoutItem[]>([
    { sku: "HW-RACK-2U", desc: "Enterprise Dual-Socket 2U Server Chassis", unitPrice: 3200.0, unspsc: "43211501", uom: "EA", qty: 2 },
    { sku: "SW-LIC-CORP", desc: "CommerceCRM Enterprise Core Seat (Annual)", unitPrice: 1200.0, unspsc: "43231505", uom: "EA", qty: 5 },
    { sku: "NET-OPTIC-10G", desc: "10GBase-SR SFP+ Transceiver Module", unitPrice: 85.0, unspsc: "43222604", uom: "EA", qty: 10 },
  ]);

  const [poomGenerated, setPoomGenerated] = useState(false);

  const totalCart = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const handleTransferToERP = () => {
    setPoomGenerated(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <FileCode2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">B2B cXML / OCI PunchOut E-Procurement Gateway</h2>
              <p className="text-sm text-slate-400">
                Roundtrip procurement integration with SAP Ariba, Coupa, Jaggaer & SAP SRM via POSR/POOM protocols.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> cXML v1.2.014 Compliant
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Session & Catalog Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Session Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-400" /> Active Punchout Handshake Session
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block">Buyer ERP Tenant</span>
                <span className="font-semibold text-slate-200 text-sm">{buyerOrg}</span>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block">PunchOut Session ID</span>
                <span className="font-mono font-semibold text-cyan-400 text-sm">{sessionId}</span>
              </div>
              <div className="sm:col-span-2 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 block">ERP Callback Return URL</span>
                <span className="font-mono text-slate-300 truncate block">{returnUrl}</span>
              </div>
            </div>
          </div>

          {/* Staged Items Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-cyan-400" /> Staged B2B Purchase Order Requisition
              </h3>
              <span className="text-xs text-slate-400">{cart.length} line items</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-2">
                    <th className="py-2 font-medium">SKU / UNSPSC</th>
                    <th className="py-2 font-medium">Description</th>
                    <th className="py-2 font-medium text-right">Contract Price</th>
                    <th className="py-2 font-medium text-center">Qty / UOM</th>
                    <th className="py-2 font-medium text-right">Extended</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {cart.map((item) => (
                    <tr key={item.sku} className="text-slate-300">
                      <td className="py-3 font-mono">
                        <span className="text-cyan-400 block font-semibold">{item.sku}</span>
                        <span className="text-[10px] text-slate-500">UNSPSC {item.unspsc}</span>
                      </td>
                      <td className="py-3 font-medium text-slate-200">{item.desc}</td>
                      <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        {item.qty} {item.uom}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-100">
                        ${(item.unitPrice * item.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Transfer Actions & POOM Preview */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-200">ERP Check-In Settlement</h3>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Contract Subtotal</span>
                <span className="text-slate-200 font-semibold">${totalCart.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Estimated Tax (B2B Exemption)</span>
                <span className="text-emerald-400 font-semibold">$0.00 (Tax Cert #9924)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 pt-2 border-t border-slate-800">
                <span>Total Requisition</span>
                <span className="text-blue-400 text-lg">${totalCart.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleTransferToERP}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Send className="h-4 w-4" /> Transfer Cart to SAP Ariba POOM
            </button>

            {poomGenerated && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> PunchOutOrderMessage Ready
                </div>
                <p className="text-xs text-slate-300">
                  Payload formatted into XML POOM standard and ready for browser POST back to ERP procurement queue.
                </p>
                <div className="p-2.5 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-400 overflow-x-auto">
                  &lt;PunchOutOrderMessage&gt;
                  <br />
                  &nbsp;&nbsp;&lt;Total&gt;&lt;Money currency="USD"&gt;{totalCart.toFixed(2)}&lt;/Money&gt;&lt;/Total&gt;
                  <br />
                  &nbsp;&nbsp;&lt;ItemIn quantity="2"&gt;...&lt;/ItemIn&gt;
                  <br />
                  &lt;/PunchOutOrderMessage&gt;
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
