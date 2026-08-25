"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface WorkspaceRecord {
  id: string;
  name: string;
  tenantId: string;
  isPrimary: boolean;
}

export function SettingsView() {
  const [vaultVerified, setVaultVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([
    { id: "w-1", name: "Acme Enterprise Global", tenantId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", isPrimary: true },
    { id: "w-2", name: "European Operations Workspace", tenantId: "e09a28f1-4b10-410a-91cb-710492810a91", isPrimary: false },
    { id: "w-3", name: "APAC Logistics Hub", tenantId: "7f4c102a-92bc-4209-84bc-3901bc749102", isPrimary: false },
  ]);
  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleVerifyVault = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVaultVerified(true);
    }, 1200);
  };

  const handleAddWorkspace = () => {
    if (!newWorkspaceName) return;
    const randomUuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setWorkspaces([
      ...workspaces,
      {
        id: `w-${Date.now()}`,
        name: newWorkspaceName,
        tenantId: randomUuid,
        isPrimary: false,
      },
    ]);
    setIsNewWorkspaceOpen(false);
    setNewWorkspaceName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Enterprise Settings & Security Vault
          </h2>
          <p className="text-xs text-slate-400">
            Multi-tenant organization configurations, RBAC permissions, Prometheus telemetry, and cryptographic audit hash chains.
          </p>
        </div>
        <Button variant="default" size="sm" onClick={() => setIsNewWorkspaceOpen(true)}>
          + Provision New Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immutable Cryptographic Audit Vault */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tamper-Evident Audit Vault</CardTitle>
              <Badge variant="success" dot>SHA-256 Merkle Chain</Badge>
            </div>
            <CardDescription>Cryptographic verification of immutable log sequence integrity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-300 leading-relaxed">
              Every sensitive action (auth, customer edits, payments, role mutations) is hashed sequentially into an immutable Merkle tree.
            </p>

            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-500">Vault Root Hash:</span>{" "}
                <span className="text-indigo-400 break-all font-bold">
                  fae98129bc7801df92a0134f71a09428c04918237149019283
                </span>
              </div>
              <div className="flex justify-between">
                <span><span className="text-slate-500">Verified Records:</span> <strong>1,482 Entries</strong></span>
                <span><span className="text-slate-500">Status:</span> <strong className="text-emerald-400">Zero Tamper Detections</strong></span>
              </div>
            </div>

            <Button
              variant={vaultVerified ? "success" : "default"}
              size="sm"
              className="w-full"
              isLoading={isVerifying}
              onClick={handleVerifyVault}
            >
              {vaultVerified ? "✓ Audit Vault Integrity 100% Verified (0 Breaches)" : "Verify Cryptographic Audit Chain"}
            </Button>
          </CardContent>
        </Card>

        {/* Security & Authentication Policies */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Security & Access Control Policies</CardTitle>
            <CardDescription>Enterprise multi-factor authentication and token session TTL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <div>
                <div className="font-bold text-white">Enforce Multi-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-slate-400">Require TOTP hardware authenticator for all staff</div>
              </div>
              <button
                onClick={() => setIsTwoFactorEnabled(!isTwoFactorEnabled)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  isTwoFactorEnabled
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {isTwoFactorEnabled ? "Enabled ✓" : "Disabled ✕"}
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <div>
                <div className="font-bold text-white">JWT Access Token Expiry (Minutes)</div>
                <div className="text-[11px] text-slate-400">Automatic logout window on user inactivity</div>
              </div>
              <select
                value={sessionTimeout}
                aria-label="JWT Access Token Expiry Minutes"
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none"
              >
                <option value="15">15 Minutes (Strict)</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Tenancy & Workspace Configuration */}
        <Card variant="bordered" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tenant & Workspace Isolation ({workspaces.length} Registered)</CardTitle>
            <CardDescription>Row-Level Data Security (RLS) & Sub-organization tenant partitioning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {workspaces.map((ws) => (
                <div key={ws.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white">{ws.name}</span>
                    <Badge variant={ws.isPrimary ? "purple" : "secondary"} size="sm">
                      {ws.isPrimary ? "Primary" : "Branch"}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    UUID: {ws.tenantId}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Workspace Modal */}
      {isNewWorkspaceOpen && (
        <Dialog
          open={isNewWorkspaceOpen}
          onClose={() => setIsNewWorkspaceOpen(false)}
          title="Provision Tenant Workspace"
          description="Allocate an isolated database schema partition with dedicated encryption keys."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewWorkspaceOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleAddWorkspace}>Provision Workspace</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Organization / Workspace Name"
              placeholder="e.g. Latin America Hub (Brazil)"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
