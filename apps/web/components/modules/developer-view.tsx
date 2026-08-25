"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

export function DeveloperView() {
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const handleCreateKey = () => {
    setCreatedKey("ccrm_live_98a72ef019bc847291a83401ef9482910a823491");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Developer Platform & Webhooks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High-entropy scoped API keys, SHA-256 key hashing, HMAC-SHA256 signed webhook dispatch, and delivery audit logs.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm">+ Register Webhook</Button>
          <Button variant="default" size="sm" onClick={() => { setCreatedKey(null); setIsKeyModalOpen(true); }}>
            + Generate API Key
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Keys */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Active Developer API Keys</CardTitle>
            <CardDescription>Scoped authorization tokens for programmatic API access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Production E-Commerce Integration</div>
                  <div className="font-mono text-[11px] text-slate-400">Prefix: ccrm_live_••••••••</div>
                  <div className="flex space-x-1 mt-1.5">
                    <Badge variant="secondary" size="sm">customer:read</Badge>
                    <Badge variant="secondary" size="sm">order:read</Badge>
                    <Badge variant="secondary" size="sm">order:write</Badge>
                  </div>
                </div>
                <Button variant="destructive" size="xs">Revoke</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Webhooks */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Outbound Webhook Subscriptions</CardTitle>
            <CardDescription>Cryptographic HMAC-SHA256 event dispatch with automatic retries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">https://api.partner.com/events</span>
                  <Badge variant="success" size="sm">Active (5 Retries)</Badge>
                </div>
                <div className="flex space-x-1.5">
                  <Badge variant="purple" size="sm">order.paid.v1</Badge>
                  <Badge variant="purple" size="sm">customer.created.v1</Badge>
                </div>
                <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                  <span>Secret: <code>whsec_••••••••••••</code></span>
                  <Button variant="outline" size="xs">Test HMAC Dispatch</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Modal */}
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
                <Input label="Key Description Name" defaultValue="External Analytics Sync Service" />
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Permission Scopes</span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /> <span>customer:read</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" defaultChecked /> <span>order:read</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" /> <span>order:write</span></label>
                    <label className="flex items-center space-x-2"><input type="checkbox" /> <span>admin:*</span></label>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Copy your API Secret Key now:</span>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded font-mono text-xs select-all text-slate-800 dark:text-slate-200 break-all border">
                  {createdKey}
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                  ⚠️ This secret key is hashed with SHA-256 and will not be displayed again.
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
