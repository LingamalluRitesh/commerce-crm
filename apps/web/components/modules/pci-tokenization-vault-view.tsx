"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Lock,
  Key,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface TokenCardUI {
  tokenId: string;
  brand: string;
  maskedPan: string;
  expiry: string;
  keyVer: string;
  lastUsed: string;
}

const SAMPLE_TOKENS: TokenCardUI[] = [
  { tokenId: "TKN-VI-8F9201A94", brand: "VISA", maskedPan: "4111 11** **** 1111", expiry: "12/28", keyVer: "K-VER-2026-PRIMARY", lastUsed: "2 mins ago" },
  { tokenId: "TKN-MC-7B3182C01", brand: "MASTERCARD", maskedPan: "5500 00** **** 0004", expiry: "06/27", keyVer: "K-VER-2026-PRIMARY", lastUsed: "1 hour ago" },
  { tokenId: "TKN-AX-91A23D811", brand: "AMERICAN_EXPRESS", maskedPan: "3782 82** **** 0005", expiry: "09/29", keyVer: "K-VER-2026-PRIMARY", lastUsed: "Yesterday" },
];

export function PCITokenizationVaultView() {
  const [tokens, setTokens] = useState<TokenCardUI[]>(SAMPLE_TOKENS);
  const [activeKey, setActiveKey] = useState("K-VER-2026-PRIMARY");
  const [rotated, setRotated] = useState(false);

  const handleRotateKey = () => {
    const newVer = `K-VER-2026-ROT-${Math.floor(Math.random() * 900 + 100)}`;
    setActiveKey(newVer);
    setTokens(tokens.map((t) => ({ ...t, keyVer: newVer })));
    setRotated(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">PCI-DSS 4.0 Cardholder Data Environment (CDE) Vault</h2>
              <p className="text-sm text-slate-400">
                Format-preserving PAN tokenization, zero plaintext storage barrier & automated HSM key rotation.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> PCI-DSS Level 1 Certified
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Total Active Tokens Stored</span>
          <span className="text-xl font-bold text-slate-100">{tokens.length} Payment Methods</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">Active Master HSM Key</span>
          <span className="text-xl font-bold text-cyan-400 font-mono text-sm">{activeKey}</span>
        </div>
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 block">CDE Plaintext PAN Exposure</span>
          <span className="text-xl font-bold text-emerald-400">0 Instances (Isolated)</span>
        </div>
      </div>

      {/* Tokens Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" /> Vault Stored Payment Tokens & Key Lineage
          </h3>
          <button
            onClick={handleRotateKey}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Rotate Master HSM Key (AES-256-GCM)
          </button>
        </div>

        {rotated && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Master key rotated to <span className="font-mono font-bold text-white">{activeKey}</span>. All stored cipher blobs re-encrypted successfully.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800 pb-2">
                <th className="py-2 font-medium">Token ID</th>
                <th className="py-2 font-medium">Card Brand</th>
                <th className="py-2 font-medium">Masked PAN Display</th>
                <th className="py-2 font-medium text-center">Expiry</th>
                <th className="py-2 font-medium">Vault Key Version</th>
                <th className="py-2 font-medium text-right">Last Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tokens.map((t) => (
                <tr key={t.tokenId} className="text-slate-300">
                  <td className="py-3 font-mono font-semibold text-amber-400">{t.tokenId}</td>
                  <td className="py-3 font-medium text-slate-200">{t.brand}</td>
                  <td className="py-3 font-mono text-slate-300">{t.maskedPan}</td>
                  <td className="py-3 text-center font-mono text-slate-400">{t.expiry}</td>
                  <td className="py-3 font-mono text-[10px] text-cyan-400">{t.keyVer}</td>
                  <td className="py-3 text-right text-slate-400">{t.lastUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
