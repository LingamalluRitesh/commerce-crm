"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function SLAPolicyEditor() {
  const tiers = [
    { name: "Platinum Enterprise", urgent: "1 hour", high: "4 hours", medium: "8 hours", low: "24 hours", hours: "24/7/365 Dedicated" },
    { name: "Gold Corporate", urgent: "2 hours", high: "8 hours", medium: "16 hours", low: "36 hours", hours: "24/7 Global" },
    { name: "Standard Business", urgent: "4 hours", high: "12 hours", medium: "24 hours", low: "48 hours", hours: "Business Hours (9-5)" },
  ];

  return (
    <Card variant="bordered" className="p-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-4 border-slate-100 dark:border-slate-800">
        <div>
          <CardTitle>Enterprise SLA Policy Matrix</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Multi-tier support resolution target thresholds and escalation policies.</p>
        </div>
        <Button variant="default" size="sm">+ Define Custom SLA Tier</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-slate-100">{t.name}</span>
              <Badge variant={idx === 0 ? "purple" : idx === 1 ? "warning" : "secondary"} size="sm">
                {t.hours}
              </Badge>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between"><span className="text-slate-400">Urgent Priority:</span> <span className="font-bold text-rose-600">{t.urgent}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">High Priority:</span> <span className="font-bold text-amber-500">{t.high}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Medium Priority:</span> <span className="font-bold text-sky-500">{t.medium}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Low Priority:</span> <span className="font-bold text-slate-400">{t.low}</span></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
