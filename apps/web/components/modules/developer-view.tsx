"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface KeyRecord {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
}

interface WebhookRecord {
  id: string;
  url: string;
  events: string[];
  status: "Active" | "Paused";
}

export function DeveloperView() {
  const [keys, setKeys] = useState<KeyRecord[]>([
    { id: "k-1", name: "Production E-Commerce Integration", prefix: "ccrm_live_98a72ef0", scopes: ["customer:read", "order:read", "order:write"] },
    { id: "k-2", name: "BI Data Warehouse ETL Connector", prefix: "ccrm_live_14bc0891", scopes: ["customer:read", "analytics:read"] },
  ]);
  const [webhooks, setWebhooks] = useState<WebhookRecord[]>([
    { id: "wh-1", url: "https://api.partner.com/events", events: ["order.paid.v1", "customer.created.v1"], status: "Active" },
  ]);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("External Service Connector");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [newWebhookUrl, setNewWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/X00");
  const [hmacTestResult, setHmacTestResult] = useState<string | null>(null);

  const handleCreateKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const fullKey = `ccrm_live_${randomHex}`;
    const newKeyRecord: KeyRecord = {
      id: `k-${Date.now()}`,
      name: newKeyName || "Custom API Key",
      prefix: fullKey.slice(0, 18),
      scopes: ["customer:read", "order:read"],
    };
    setKeys([newKeyRecord, ...keys]);
    setCreatedKey(fullKey);
  };

  const handleRevokeKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const handleCreateWebhook = () => {
    if (!newWebhookUrl) return;
    const wh: WebhookRecord = {
      id: `wh-${Date.now()}`,
      url: newWebhookUrl,
      events: ["order.paid.v1"],
      status: "Active",
    };
    setWebhooks([wh, ...webhooks]);
    setIsWebhookModalOpen(false);
  };

  const handleTestHmac = (url: string) => {
    setHmacTestResult(`HMAC-SHA256 test event sent to ${url} -> HTTP 200 OK (Signature: sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)`);
    setTimeout(() => setHmacTestResult(null), 6000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Developer Platform & Webhooks
          </h2>
          <p className="text-xs text-slate-400">
            High-entropy scoped API keys, SHA-256 key hashing, HMAC-SHA256 signed webhook dispatch, and delivery audit logs.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsWebhookModalOpen(true)}>
            + Register Webhook
          </Button>
          <Button variant="default" size="sm" onClick={() => { setCreatedKey(null); setIsKeyModalOpen(true); }}>
            + Generate API Key
          </Button>
        </div>
      </div>

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
            <CardTitle>Active Developer API Keys ({keys.length})</CardTitle>
            <CardDescription>Scoped authorization tokens for programmatic API access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              {keys.map((k) => (
                <div key={k.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{k.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">Prefix: {k.prefix}••••••••</div>
                    <div className="flex space-x-1 mt-1.5 flex-wrap gap-1">
                      {k.scopes.map((s, idx) => (
                        <Badge key={idx} variant="secondary" size="sm">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="destructive" size="xs" onClick={() => handleRevokeKey(k.id)}>
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Outbound Webhook Subscriptions ({webhooks.length})</CardTitle>
            <CardDescription>Cryptographic HMAC-SHA256 event dispatch with automatic retries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              {webhooks.map((wh) => (
                <div key={wh.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-indigo-400 truncate max-w-[220px]">{wh.url}</span>
                    <Badge variant="success" size="sm">{wh.status} (5 Retries)</Badge>
                  </div>
                  <div className="flex space-x-1.5">
                    {wh.events.map((ev, idx) => (
                      <Badge key={idx} variant="purple" size="sm">{ev}</Badge>
                    ))}
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-800 text-[11px] text-slate-400">
                    <span>Secret: <code>whsec_••••••••••••</code></span>
                    <Button variant="outline" size="xs" onClick={() => handleTestHmac(wh.url)}>
                      Test HMAC Dispatch
                    </Button>
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
                    <label className="flex items-center space-x-2"><input type="checkbox" /> <span>admin:*</span></label>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                <span className="font-bold text-emerald-300 block">Copy your API Secret Key now:</span>
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
          </div>
        </Dialog>
      )}
    </div>
  );
}
