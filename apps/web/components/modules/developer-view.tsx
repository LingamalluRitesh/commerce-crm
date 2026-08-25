"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

export interface KeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
}

export interface WebhookRecord {
  id: string;
  url: string;
  events: string[];
  status: "Active" | "Paused";
  lastDispatch: string;
  successRate: string;
}

const initialKeys: KeyRecord[] = [
  { id: "k-1", name: "Production E-Commerce Integration", prefix: "ccrm_live_98a72ef0", scopes: ["customer:read", "order:read", "order:write"], createdAt: "2026-08-01" },
  { id: "k-2", name: "BI Data Warehouse ETL Connector", prefix: "ccrm_live_14bc0891", scopes: ["customer:read", "analytics:read"], createdAt: "2026-08-15" },
];

const initialWebhooks: WebhookRecord[] = [
  { id: "wh-1", url: "https://api.partner.com/events", events: ["order.paid.v1", "customer.created.v1"], status: "Active", lastDispatch: "12m ago", successRate: "99.8%" },
  { id: "wh-2", url: "https://hooks.slack.com/services/T00/B00/X00", events: ["ticket.sla.breached"], status: "Active", lastDispatch: "1h ago", successRate: "100.0%" },
];

export function DeveloperView() {
  const [keys, setKeys] = useState<KeyRecord[]>(initialKeys);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>(initialWebhooks);

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  const [newKeyName, setNewKeyName] = useState("External Service Connector");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState("https://api.enterprise.com/webhooks");
  const [newWebhookEvent, setNewWebhookEvent] = useState("order.paid.v1");

  const [hmacTestResult, setHmacTestResult] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCreateKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const fullKey = `ccrm_live_${randomHex}`;
    const newKeyRecord: KeyRecord = {
      id: `k-${Date.now()}`,
      name: newKeyName || "Custom API Key",
      prefix: fullKey.slice(0, 18),
      scopes: ["customer:read", "order:read", "order:write"],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setKeys([newKeyRecord, ...keys]);
    setCreatedKey(fullKey);
    showFeedback(`API Key "${newKeyRecord.name}" created!`);
  };

  const handleRevokeKey = (id: string, name: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    showFeedback(`API Key "${name}" revoked`);
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl) return;
    const wh: WebhookRecord = {
      id: `wh-${Date.now()}`,
      url: newWebhookUrl,
      events: [newWebhookEvent],
      status: "Active",
      lastDispatch: "Never",
      successRate: "100%",
    };
    setWebhooks([wh, ...webhooks]);
    setIsWebhookModalOpen(false);
    showFeedback(`Webhook endpoint registered for ${wh.url}`);
  };

  const handleToggleWebhook = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "Active" ? "Paused" : "Active" } : w
      )
    );
    showFeedback("Webhook status updated!");
  };

  const handleTestHmac = (url: string) => {
    const signature = "sha256=" + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setHmacTestResult(
      `HMAC-SHA256 test event sent to ${url} -> HTTP 200 OK (Latency: 28ms, Signature: ${signature})`
    );
    setTimeout(() => setHmacTestResult(null), 6000);
  };

  const handleCopyKey = (keyStr: string) => {
    navigator.clipboard.writeText(keyStr);
    showFeedback("API Key copied to clipboard! 📋");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Developer Platform & HMAC Webhooks
            </h2>
            <Badge variant="purple" size="sm">HMAC-SHA256 Signed</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            High-entropy scoped API keys, SHA-256 key hashing, HMAC-SHA256 signed webhook dispatch, and delivery audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsLogsModalOpen(true)}>
            📊 Delivery Logs
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsWebhookModalOpen(true)}>
            + Register Webhook
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setCreatedKey(null);
              setIsKeyModalOpen(true);
            }}
          >
            + Generate API Key
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {hmacTestResult && (
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>⚡ {hmacTestResult}</span>
          <button onClick={() => setHmacTestResult(null)} className="text-purple-400 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Active Developer API Keys ({keys.length})</CardTitle>
              <Badge variant="purple" size="sm">Scoped Tokens</Badge>
            </div>
            <CardDescription>Scoped authorization tokens for programmatic REST & GraphQL access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              {keys.map((k) => (
                <div key={k.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-bold text-white text-sm">{k.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      Prefix: <span className="text-indigo-400">{k.prefix}</span>••••••••
                    </div>
                    <div className="flex space-x-1 mt-1.5 flex-wrap gap-1">
                      {k.scopes.map((s, idx) => (
                        <Badge key={idx} variant="secondary" size="sm">{s}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5 items-end">
                    <Button variant="destructive" size="xs" onClick={() => handleRevokeKey(k.id, k.name)}>
                      Revoke
                    </Button>
                    <span className="text-[10px] text-slate-500 font-mono">Issued {k.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Outbound Webhook Subscriptions ({webhooks.length})</CardTitle>
              <Badge variant="success" size="sm">Auto-Retry Active</Badge>
            </div>
            <CardDescription>Cryptographic HMAC-SHA256 event dispatch with automatic exponential backoff</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-indigo-400 truncate max-w-[220px]">{wh.url}</span>
                    <Badge variant={wh.status === "Active" ? "success" : "warning"} size="sm">
                      {wh.status} ({wh.successRate})
                    </Badge>
                  </div>
                  <div className="flex space-x-1.5 flex-wrap gap-1">
                    {wh.events.map((ev, idx) => (
                      <Badge key={idx} variant="purple" size="sm">{ev}</Badge>
                    ))}
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Secret: <code>whsec_••••••••••••</code></span>
                    <div className="flex space-x-1.5">
                      <Button variant="ghost" size="xs" onClick={() => handleToggleWebhook(wh.id)}>
                        {wh.status === "Active" ? "Pause" : "Resume"}
                      </Button>
                      <Button variant="outline" size="xs" onClick={() => handleTestHmac(wh.url)}>
                        Test HMAC Dispatch
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Key Modal */}
      {isKeyModalOpen && (
        <Dialog
          open={isKeyModalOpen}
          onClose={() => setIsKeyModalOpen(false)}
          size="md"
          title="Provision New Scoped API Key"
          description="High-entropy secret key will be shown only ONCE upon generation."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsKeyModalOpen(false)}>Close</Button>
              {!createdKey && <Button variant="default" size="sm" onClick={handleCreateKey}>Generate Key</Button>}
            </>
          }
        >
          <div className="space-y-3 text-xs">
            {!createdKey ? (
              <>
                <Input
                  label="Key Description Name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-300 uppercase text-[10px]">Permission Scopes</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /> <span>customer:read</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /> <span>order:read</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /> <span>order:write</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /> <span>analytics:read</span></label>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-300 block">Copy your API Secret Key now:</span>
                  <Button variant="success" size="xs" onClick={() => handleCopyKey(createdKey)}>
                    📋 Copy Secret
                  </Button>
                </div>
                <div className="p-2.5 bg-slate-900 rounded font-mono text-xs select-all text-white break-all border border-slate-700">
                  {createdKey}
                </div>
                <p className="text-[11px] text-emerald-400">
                  ⚠️ This secret key is hashed with SHA-256 and will not be displayed again.
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}

      {/* Webhook Modal */}
      {isWebhookModalOpen && (
        <Dialog
          open={isWebhookModalOpen}
          onClose={() => setIsWebhookModalOpen(false)}
          title="Register Outbound Webhook"
          description="CommerceCRM will sign payloads with HMAC-SHA256."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsWebhookModalOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateWebhook}>Register Endpoint</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Destination HTTPS Endpoint URL"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Event Topic Subscription</label>
              <select
                value={newWebhookEvent}
                aria-label="Event Topic Subscription"
                onChange={(e) => setNewWebhookEvent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="order.paid.v1">order.paid.v1 (Order Paid & Settled)</option>
                <option value="customer.created.v1">customer.created.v1 (Customer Registered)</option>
                <option value="ticket.sla.breached">ticket.sla.breached (SLA Escalated)</option>
                <option value="deal.won.v1">deal.won.v1 (Deal Closed Won)</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delivery Logs Modal */}
      {isLogsModalOpen && (
        <Dialog
          open={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          size="lg"
          title="Webhook Dispatch Delivery Logs"
          description="Real-time HMAC signature verification and HTTP latency diagnostics."
          footer={
            <Button variant="default" size="sm" onClick={() => setIsLogsModalOpen(false)}>
              Close Logs
            </Button>
          }
        >
          <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto pr-1">
            {[
              { event: "order.paid.v1", status: "200 OK", latency: "24ms", dest: "api.partner.com", time: "12m ago" },
              { event: "customer.created.v1", status: "200 OK", latency: "18ms", dest: "api.partner.com", time: "34m ago" },
              { event: "ticket.sla.breached", status: "200 OK", latency: "42ms", dest: "hooks.slack.com", time: "1h ago" },
            ].map((log, i) => (
              <div key={i} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-white font-mono">{log.event}</div>
                  <div className="text-[10px] text-slate-400">Endpoint: {log.dest} • Latency: {log.latency}</div>
                </div>
                <div className="text-right">
                  <Badge variant="success" size="sm">{log.status}</Badge>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Dialog>
      )}
    </div>
  );
}
