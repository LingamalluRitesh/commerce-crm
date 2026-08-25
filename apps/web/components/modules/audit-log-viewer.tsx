"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  actor: string;
  ipAddress: string;
  timestamp: string;
}

const mockAuditLogs: AuditEntry[] = [
  { id: "aud-1", action: "api_key:created", entityType: "ApiKey", actor: "sarah.connor@acme-enterprise.com", ipAddress: "198.51.100.42", timestamp: "2026-08-25 10:45:12 UTC" },
  { id: "aud-2", action: "customer:updated", entityType: "Customer", actor: "john.doe@acme-enterprise.com", ipAddress: "198.51.100.18", timestamp: "2026-08-25 10:30:00 UTC" },
  { id: "aud-3", action: "order:paid", entityType: "Order", actor: "System Webhook", ipAddress: "54.187.205.12", timestamp: "2026-08-25 10:15:22 UTC" },
  { id: "aud-4", action: "role:permission_granted", entityType: "RolePermission", actor: "sarah.connor@acme-enterprise.com", ipAddress: "198.51.100.42", timestamp: "2026-08-25 09:50:45 UTC" },
];

export function AuditLogViewer() {
  return (
    <Card variant="bordered" className="p-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle>Tamper-Evident Immutable Audit Trail</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Cryptographic SHA-256 hash-chained security event ledger.</p>
        </div>
        <Badge variant="success">Merkle Hash Intact</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Actor Account</TableHead>
            <TableHead>Origin IP</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAuditLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                {log.action}
              </TableCell>
              <TableCell className="text-xs font-medium">{log.entityType}</TableCell>
              <TableCell className="text-xs text-slate-600 dark:text-slate-400">{log.actor}</TableCell>
              <TableCell className="font-mono text-xs text-slate-400">{log.ipAddress}</TableCell>
              <TableCell className="font-mono text-xs text-slate-500">{log.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
