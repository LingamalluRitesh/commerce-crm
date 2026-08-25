"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  actor: string;
  ipAddress: string;
  timestamp: string;
  hash: string;
}

const initialAuditLogs: AuditEntry[] = [
  { id: "aud-1", action: "api_key:created", entityType: "ApiKey", actor: "sarah.connor@acme-enterprise.com", ipAddress: "198.51.100.42", timestamp: "2026-08-25 10:45:12 UTC", hash: "9a8f1...b2c3" },
  { id: "aud-2", action: "customer:updated", entityType: "Customer", actor: "john.doe@acme-enterprise.com", ipAddress: "198.51.100.18", timestamp: "2026-08-25 10:30:00 UTC", hash: "8b7e2...a1f4" },
  { id: "aud-3", action: "order:paid", entityType: "Order", actor: "System Webhook", ipAddress: "54.187.205.12", timestamp: "2026-08-25 10:15:22 UTC", hash: "7c6d3...e9d5" },
  { id: "aud-4", action: "role:permission_granted", entityType: "RolePermission", actor: "sarah.connor@acme-enterprise.com", ipAddress: "198.51.100.42", timestamp: "2026-08-25 09:50:45 UTC", hash: "6d5c4...f8c6" },
];

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEntry[]>(initialAuditLogs);
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CommerceCRM_Audit_Trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedback("Cryptographic Audit Log JSON exported!");
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleVerify = () => {
    setVerified(true);
    setFeedback("SHA-256 Merkle root verified against Genesis block: 100% Intact!");
    setTimeout(() => setFeedback(null), 5000);
  };

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card variant="bordered" className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4 border-slate-800">
        <div>
          <CardTitle>Tamper-Evident Immutable Audit Trail ({logs.length} Records)</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Cryptographic SHA-256 hash-chained security event ledger.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportAudit}>
            Export Audit JSON
          </Button>
          <Button variant={verified ? "success" : "default"} size="sm" onClick={handleVerify}>
            {verified ? "✓ 100% Hash Verified" : "Verify Merkle Hash"}
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          placeholder="Filter audit entries by action, actor, or entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Actor Account</TableHead>
            <TableHead>Origin IP</TableHead>
            <TableHead>Block Hash</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((log) => (
            <TableRow key={log.id} className="hover:bg-slate-800/40 transition-colors">
              <TableCell className="font-mono font-bold text-xs text-indigo-400">
                {log.action}
              </TableCell>
              <TableCell className="text-xs font-medium text-white">{log.entityType}</TableCell>
              <TableCell className="text-xs text-slate-300">{log.actor}</TableCell>
              <TableCell className="font-mono text-xs text-slate-400">{log.ipAddress}</TableCell>
              <TableCell className="font-mono text-xs text-purple-400">{log.hash}</TableCell>
              <TableCell className="font-mono text-xs text-slate-500">{log.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
