"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface WorkflowItem {
  id: string;
  name: string;
  trigger: string;
  conditionsCount: number;
  actionsCount: number;
  status: "active" | "paused";
  lastExecuted: string;
}

const mockWorkflows: WorkflowItem[] = [
  { id: "wf-1", name: "High Value Lead Instant Escalation", trigger: "lead.created (Budget > $100k)", conditionsCount: 2, actionsCount: 3, status: "active", lastExecuted: "5 mins ago" },
  { id: "wf-2", name: "Order Delivered CSAT Survey Dispatch", trigger: "order.delivered.v1", conditionsCount: 1, actionsCount: 2, status: "active", lastExecuted: "2 hours ago" },
  { id: "wf-3", name: "Churn Risk Score Auto Notification", trigger: "customer.health_score < 50", conditionsCount: 1, actionsCount: 2, status: "active", lastExecuted: "Yesterday" },
];

export function WorkflowView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Workflow Automation Studio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Visual rule orchestration, condition branch evaluation, health score mutations, and automated event triggers.
          </p>
        </div>
        <Button variant="default" size="sm">+ Design Automation Workflow</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockWorkflows.map((wf) => (
          <Card key={wf.id} variant="bordered" className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{wf.name}</h3>
              <Badge variant={wf.status === "active" ? "success" : "secondary"} size="sm">
                {wf.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900">
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 block">Trigger Node</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{wf.trigger}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                <span>Conditions: <strong>{wf.conditionsCount} nodes</strong></span>
                <span>Actions: <strong>{wf.actionsCount} tasks</strong></span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">Last run: {wf.lastExecuted}</span>
              <Button variant="outline" size="xs">Edit Canvas</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
