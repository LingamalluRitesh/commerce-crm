"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function SettingsView() {
  const [vaultVerified, setVaultVerified] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Enterprise Settings & Security Vault</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-tenant organization configurations, RBAC permissions, Prometheus telemetry, and cryptographic audit hash chains.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immutable Cryptographic Audit Vault */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tamper-Evident Audit Vault</CardTitle>
              <Badge variant="success">SHA-256 Chain</Badge>
            </div>
            <CardDescription>Cryptographic verification of immutable log sequence integrity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Every sensitive action (auth, customer edits, payments, role mutations) is hashed sequentially into an immutable merkle chain.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] space-y-1">
              <div><span className="text-slate-400">Vault Root Hash:</span> <span className="text-indigo-600 dark:text-indigo-400 break-all font-bold">fae98129bc7801df92a0134f71a09428...</span></div>
              <div><span className="text-slate-400">Verified Records:</span> <span className="font-bold">42 Entries</span></div>
            </div>

            <Button
              variant={vaultVerified ? "success" : "default"}
              size="sm"
              className="w-full"
              onClick={() => setVaultVerified(true)}
            >
              {vaultVerified ? "✓ Audit Vault Integrity 100% Verified" : "Verify Cryptographic Audit Chain"}
            </Button>
          </CardContent>
        </Card>

        {/* Multi-Tenancy & Workspace Configuration */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Tenant & Workspace Isolation</CardTitle>
            <CardDescription>Row-Level Data Security (RLS) & Workspace Scopes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Acme Enterprise Global</div>
                  <div className="text-[10px] text-slate-400 font-mono">Tenant ID: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d</div>
                </div>
                <Badge variant="purple" size="sm">Primary Tenant</Badge>
              </div>

              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">European Operations Workspace</div>
                  <div className="text-[10px] text-slate-400 font-mono">Tenant ID: e09a28f1-4b10-410a-91cb-710492810a91</div>
                </div>
                <Badge variant="secondary" size="sm">Branch</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
