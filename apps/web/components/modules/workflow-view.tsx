"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  conditionsCount: number;
  actionsCount: number;
  status: "active" | "paused";
  lastExecuted: string;
}

const initialWorkflows: WorkflowItem[] = [
  { id: "wf-1", name: "High Value Lead Instant Escalation", trigger: "lead.created (Budget > $100k)", conditionsCount: 2, actionsCount: 3, status: "active", lastExecuted: "5 mins ago" },
  { id: "wf-2", name: "Order Delivered CSAT Survey Dispatch", trigger: "order.delivered.v1", conditionsCount: 1, actionsCount: 2, status: "active", lastExecuted: "2 hours ago" },
  { id: "wf-3", name: "Churn Risk Score Auto Notification", trigger: "customer.health_score < 50", conditionsCount: 1, actionsCount: 2, status: "active", lastExecuted: "Yesterday" },
];

export function WorkflowView() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(initialWorkflows);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newWfName, setNewWfName] = useState("");
  const [newWfTrigger, setNewWfTrigger] = useState("order.paid.v1");
  const [simulatingWf, setSimulatingWf] = useState<WorkflowItem | null>(null);
  const [simStep, setSimStep] = useState(0);

  const toggleStatus = (id: string) => {
    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w
      )
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
    };
    setWorkflows([item, ...workflows]);
    setIsNewOpen(false);
    setNewWfName("");
  };

  const startSimulation = (wf: WorkflowItem) => {
    setSimulatingWf(wf);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 1000);
    setTimeout(() => setSimStep(3), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Workflow Automation Studio
          </h2>
          <p className="text-xs text-slate-400">
            Visual rule orchestration, condition branch evaluation, health score mutations, and automated event triggers.
          </p>
        </div>
        <Button variant="default" size="sm" onClick={() => setIsNewOpen(true)}>
          + Design Automation Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((wf) => (
          <Card key={wf.id} variant="bordered" className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-sm text-white">{wf.name}</h3>
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
                <span className="font-mono text-slate-200">{wf.trigger}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px] pt-1">
                <span>Conditions: <strong className="text-white">{wf.conditionsCount} nodes</strong></span>
                <span>Actions: <strong className="text-white">{wf.actionsCount} tasks</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => toggleStatus(wf.id)}
                className="text-[11px] text-slate-400 hover:text-white font-semibold"
              >
                {wf.status === "active" ? "⏸ Pause Rule" : "▶ Resume Rule"}
              </button>
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
            <Input
              label="Event Trigger Topic"
              placeholder="e.g. order.paid.v1"
              value={newWfTrigger}
              onChange={(e) => setNewWfTrigger(e.target.value)}
            />
          </div>
        </Dialog>
      )}

      {/* Test Run Simulator Modal */}
      {simulatingWf && (
        <Dialog
          open={!!simulatingWf}
          onClose={() => setSimulatingWf(null)}
          title={`Simulation: ${simulatingWf.name}`}
          description={`Executing workflow rule graph against live event payload`}
          footer={
            <Button variant="default" size="sm" onClick={() => setSimulatingWf(null)}>
              Done
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className={simStep >= 1 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {simStep >= 1 ? "✓ Step 1: Trigger Detected" : "○ Step 1: Evaluating..."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">({simulatingWf.trigger})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={simStep >= 2 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {simStep >= 2 ? "✓ Step 2: Conditions Passed" : "○ Step 2: Evaluating..."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">({simulatingWf.conditionsCount} filters matched)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={simStep >= 3 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {simStep >= 3 ? "✓ Step 3: Actions Dispatched" : "○ Step 3: Waiting..."}
                </span>
                <span className="font-mono text-[11px] text-slate-400">({simulatingWf.actionsCount} tasks completed)</span>
              </div>
            </div>

            {simStep === 3 && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                ✓ Workflow execution completed successfully with 0 errors.
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}
