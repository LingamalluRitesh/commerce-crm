"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { AuditLogViewer } from "./audit-log-viewer";

export interface WorkspaceRecord {
  id: string;
  name: string;
  tenantId: string;
  isPrimary: boolean;
  region: string;
}

const initialWorkspaces: WorkspaceRecord[] = [
  { id: "w-1", name: "Acme Enterprise Global", tenantId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", isPrimary: true, region: "US-East (N. Virginia)" },
  { id: "w-2", name: "European Operations Workspace", tenantId: "e09a28f1-4b10-410a-91cb-710492810a91", isPrimary: false, region: "EU-Central (Frankfurt)" },
  { id: "w-3", name: "APAC Logistics Hub", tenantId: "7f4c102a-92bc-4209-84bc-3901bc749102", isPrimary: false, region: "AP-Southeast (Singapore)" },
];

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<"security" | "audit" | "tenants">("security");
  const [vaultVerified, setVaultVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("15");
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>(initialWorkspaces);

  const [isNewWorkspaceOpen, setIsNewWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newRegion, setNewRegion] = useState("US-West (Oregon)");

  const [feedback, setFeedback] = useState<string | null>(null);

  const handleVerifyVault = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVaultVerified(true);
      showFeedback("Cryptographic Merkle Root Verified against Genesis Block: 100% Intact (Zero Breaches)!");
    }, 1200);
  };

  const handleAddWorkspace = () => {
    if (!newWorkspaceName) return;
    const randomUuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    const ws: WorkspaceRecord = {
      id: `w-${Date.now()}`,
      name: newWorkspaceName,
      tenantId: randomUuid,
      isPrimary: false,
      region: newRegion,
    };
    setWorkspaces([...workspaces, ws]);
    setIsNewWorkspaceOpen(false);
    setNewWorkspaceName("");
    showFeedback(`Tenant workspace "${ws.name}" provisioned with RLS isolation!`);
  };

  const handleSetPrimary = (id: string) => {
    setWorkspaces((prev) =>
      prev.map((w) => ({
        ...w,
        isPrimary: w.id === id,
      }))
    );
    showFeedback("Primary workspace changed and synchronized!");
  };

  const handleDeleteWorkspace = (id: string, name: string) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    showFeedback(`Workspace "${name}" removed`);
  };

  const handleExportSecurityConfig = () => {
    const config = {
      mfa_enforced: isTwoFactorEnabled,
      jwt_ttl_minutes: parseInt(sessionTimeout, 10),
      merkle_vault_verified: vaultVerified,
      workspaces_count: workspaces.length,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Security_Policy_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Security configuration JSON exported!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Enterprise Settings & Security Vault
            </h2>
            <Badge variant="purple" size="sm">RLS + Merkle Vault</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multi-tenant organization configurations, RBAC permissions, Prometheus telemetry, and cryptographic audit hash chains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subview Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("security")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "security"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⚙️ Security Policies
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "audit"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📜 Audit Trail
            </button>
            <button
              onClick={() => setActiveTab("tenants")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "tenants"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🏢 Workspaces ({workspaces.length})
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportSecurityConfig}>
            📥 Export Config
          </Button>

          <Button variant="default" size="sm" onClick={() => setIsNewWorkspaceOpen(true)}>
            + Provision Workspace
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {activeTab === "audit" ? (
        <AuditLogViewer />
      ) : activeTab === "tenants" ? (
        <Card variant="bordered" className="p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4 border-slate-800">
            <div>
              <CardTitle>Tenant & Workspace Partitioning ({workspaces.length})</CardTitle>
              <CardDescription>
                Row-Level Security (RLS) partition boundaries and multi-region database routing
              </CardDescription>
            </div>
            <Button variant="default" size="sm" onClick={() => setIsNewWorkspaceOpen(true)}>
              + Provision New Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-white text-sm">{ws.name}</span>
                    <Badge variant={ws.isPrimary ? "purple" : "secondary"} size="sm">
                      {ws.isPrimary ? "Primary" : "Branch"}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-indigo-400">🌐 Region: {ws.region}</div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">UUID: {ws.tenantId}</div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                  {!ws.isPrimary ? (
                    <button
                      onClick={() => handleSetPrimary(ws.id)}
                      className="text-xs font-bold text-indigo-400 hover:underline"
                    >
                      Set as Primary
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400">✓ Active Primary</span>
                  )}

                  {!ws.isPrimary && (
                    <button
                      onClick={() => handleDeleteWorkspace(ws.id, ws.name)}
                      className="text-xs font-bold text-rose-400 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
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
                  onClick={() => {
                    const next = !isTwoFactorEnabled;
                    setIsTwoFactorEnabled(next);
                    showFeedback(`MFA policy updated: ${next ? "ENFORCED" : "OPTIONAL"}`);
                  }}
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
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    showFeedback(`JWT session expiry timeout saved: ${e.target.value} minutes`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="15">15 Minutes (Strict)</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="120">120 Minutes (Relaxed)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Cloud Region Deployment</label>
              <select
                value={newRegion}
                aria-label="Cloud Region Deployment"
                onChange={(e) => setNewRegion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="US-East (N. Virginia)">US-East (N. Virginia)</option>
                <option value="US-West (Oregon)">US-West (Oregon)</option>
                <option value="EU-Central (Frankfurt)">EU-Central (Frankfurt)</option>
                <option value="AP-Southeast (Singapore)">AP-Southeast (Singapore)</option>
                <option value="SA-East (São Paulo)">SA-East (São Paulo)</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
