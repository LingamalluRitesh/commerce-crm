"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

export interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  conditionsCount: number;
  actionsCount: number;
  status: "active" | "paused";
  lastExecuted: string;
  executionCount: number;
}

const initialWorkflows: WorkflowItem[] = [
  { id: "wf-1", name: "High Value Lead Instant Escalation", trigger: "lead.created (Budget > $100k)", conditionsCount: 2, actionsCount: 3, status: "active", lastExecuted: "5 mins ago", executionCount: 342 },
  { id: "wf-2", name: "Order Delivered CSAT Survey Dispatch", trigger: "order.delivered.v1", conditionsCount: 1, actionsCount: 2, status: "active", lastExecuted: "2 hours ago", executionCount: 1205 },
  { id: "wf-3", name: "Churn Risk Score Auto Notification", trigger: "customer.health_score < 50", conditionsCount: 1, actionsCount: 2, status: "active", lastExecuted: "Yesterday", executionCount: 88 },
  { id: "wf-4", name: "Contract Signed PDF Outbox Archival", trigger: "quote.accepted.v1", conditionsCount: 2, actionsCount: 4, status: "active", lastExecuted: "18 mins ago", executionCount: 614 },
];

export function WorkflowView() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState("order.paid.v1");
  const [simulatingWf, setSimulatingWf] = useState<WorkflowItem | null>(null);
  const [simStep, setSimStep] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const next = w.status === "active" ? "paused" : "active";
          showFeedback(`Workflow "${w.name}" is now ${next.toUpperCase()}`);
          return { ...w, status: next };
        }
        return w;
      })
    );
  };

  const handleCreateWorkflow = () => {
    if (!newWfName) return;
    const item: WorkflowItem = {
      id: `wf-${Date.now()}`,
      name: newWfName,
      trigger: newWfTrigger,
      conditionsCount: 1,
      actionsCount: 2,
      status: "active",
      lastExecuted: "Just now",
      executionCount: 0,
    };
    setWorkflows([item, ...workflows]);
    setIsNewOpen(false);
    setNewWfName("");
    showFeedback(`Automation Rule "${item.name}" deployed to event bus!`);
  };

  const handleDelete = (id: string, name: string) => {
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    showFeedback(`Workflow "${name}" deleted`);
  };

  const handleDuplicate = (wf: WorkflowItem) => {
    const copy: WorkflowItem = {
      ...wf,
      id: `wf-${Date.now()}`,
      name: `${wf.name} (Copy)`,
      lastExecuted: "Never",
      executionCount: 0,
    };
    setWorkflows([...workflows, copy]);
    showFeedback(`Duplicated rule: "${copy.name}"`);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(workflows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Workflows_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Workflow rule graph JSON exported!");
  };

  const startSimulation = (wf: WorkflowItem) => {
    setSimulatingWf(wf);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 800);
    setTimeout(() => setSimStep(3), 1600);
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Workflow Automation Studio ({workflows.length} Active Rules)
            </h2>
            <Badge variant="purple" size="sm">Event DAG Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual rule orchestration, condition branch evaluation, health score mutations, and automated event triggers.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportJSON}>
            📥 Export DAG JSON
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsNewOpen(true)}>
            + Design Automation Rule
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workflows.map((wf) => (
          <Card key={wf.id} variant="bordered" className="p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm text-white line-clamp-1">{wf.name}</h3>
                <Badge
                  variant={wf.status === "active" ? "success" : "secondary"}
                  size="sm"
                  dot={wf.status === "active"}
                >
                  {wf.status.toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">Trigger Node</span>
                  <span className="font-mono text-slate-200 truncate block">{wf.trigger}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                  <span>Conditions: <strong className="text-white">{wf.conditionsCount} nodes</strong></span>
                  <span>Tasks: <strong className="text-white">{wf.actionsCount} tasks</strong></span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Total Dispatches: <strong className="text-emerald-400 font-mono">{wf.executionCount}</strong></span>
                  <span>Last: {wf.lastExecuted}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex space-x-2">
                <button
                  onClick={() => toggleStatus(wf.id)}
                  className="text-[11px] text-slate-400 hover:text-white font-semibold"
                >
                  {wf.status === "active" ? "⏸ Pause" : "▶ Resume"}
                </button>
                <button
                  onClick={() => handleDuplicate(wf)}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 font-semibold"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => handleDelete(wf.id, wf.name)}
                  className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold"
                >
                  ✕
                </button>
              </div>

              <Button variant="outline" size="xs" onClick={() => startSimulation(wf)}>
                ▶ Test Run
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* New Workflow Modal */}
      {isNewOpen && (
        <Dialog
          open={isNewOpen}
          onClose={() => setIsNewOpen(false)}
          title="Create Automation Rule"
          description="Define event trigger condition and downstream action nodes."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateWorkflow}>Deploy Rule</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Workflow Name"
              placeholder="e.g. VIP Customer Milestone Celebration"
              value={newWfName}
              onChange={(e) => setNewWfName(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Trigger Event Topic</label>
              <select
                value={newWfTrigger}
                aria-label="Trigger Event Topic"
                onChange={(e) => setNewWfTrigger(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="order.paid.v1">order.paid.v1 (Omnichannel Order Settled)</option>
                <option value="lead.created.v1">lead.created.v1 (New Inbound Lead)</option>
                <option value="ticket.sla.breached">ticket.sla.breached (SLA Escalation)</option>
                <option value="customer.health.downgraded">customer.health.downgraded (&lt; 60)</option>
                <option value="quote.accepted.v1">quote.accepted.v1 (Formal Quote Signed)</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}

      {/* Test Run Simulator Modal */}
      {simulatingWf && (
        <Dialog
          open={!!simulatingWf}
          onClose={() => setSimulatingWf(null)}
          title={`Simulation: ${simulatingWf.name}`}
          description="Executing workflow rule graph against live event payload."
          footer={
            <Button variant="default" size="sm" onClick={() => setSimulatingWf(null)}>
              Done
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2">
                <span className={simStep >= 1 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {simStep >= 1 ? "✓ Step 1: Trigger Captured" : "○ Step 1: Evaluating..."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">({simulatingWf.trigger})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={simStep >= 2 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {simStep >= 2 ? "✓ Step 2: Conditions Evaluated" : "○ Step 2: Evaluating..."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">({simulatingWf.conditionsCount} filters matched)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={simStep >= 3 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {simStep >= 3 ? "✓ Step 3: Action Tasks Dispatched" : "○ Step 3: Waiting..."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">({simulatingWf.actionsCount} tasks completed)</span>
              </div>
            </div>

            {simStep === 3 && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                ✓ Workflow DAG execution completed successfully with zero exceptions!
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
