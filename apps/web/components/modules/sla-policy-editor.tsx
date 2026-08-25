"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface SLATier {
  id: string;
  name: string;
  urgent: string;
  high: string;
  medium: string;
  low: string;
  hours: string;
}

export function SLAPolicyEditor() {
  const [tiers, setTiers] = useState<SLATier[]>([
    { id: "1", name: "Platinum Enterprise", urgent: "1 hour", high: "4 hours", medium: "8 hours", low: "24 hours", hours: "24/7/365 Dedicated" },
    { id: "2", name: "Gold Corporate", urgent: "2 hours", high: "8 hours", medium: "16 hours", low: "36 hours", hours: "24/7 Global" },
    { id: "3", name: "Standard Business", urgent: "4 hours", high: "12 hours", medium: "24 hours", low: "48 hours", hours: "Business Hours (9-5)" },
  ]);

  const [isAddTierOpen, setIsAddTierOpen] = useState(false);
  const [newTierName, setNewTierName] = useState("");
  const [newUrgent, setNewUrgent] = useState("30 mins");
  const [newHigh, setNewHigh] = useState("2 hours");
  const [newHours, setNewHours] = useState("24/7 Follow-the-Sun");
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddTier = () => {
    if (!newTierName) return;
    const tier: SLATier = {
      id: `t-${Date.now()}`,
      name: newTierName,
      urgent: newUrgent,
      high: newHigh,
      medium: "6 hours",
      low: "18 hours",
      hours: newHours,
    };
    setTiers([...tiers, tier]);
    setIsAddTierOpen(false);
    setNewTierName("");
    setFeedback(`SLA Tier "${tier.name}" created and applied to organization policies!`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <Card variant="bordered" className="p-6 space-y-4">
      <div className="flex justify-between items-center border-b pb-4 border-slate-800">
        <div>
          <CardTitle>Enterprise SLA Policy Matrix ({tiers.length} Tiers)</CardTitle>
          <p className="text-xs text-slate-400 mt-1">Multi-tier support resolution target thresholds and escalation policies.</p>
        </div>
        <Button variant="default" size="sm" onClick={() => setIsAddTierOpen(true)}>
          + Define Custom SLA Tier
        </Button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((t, idx) => (
          <div key={t.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white">{t.name}</span>
              <Badge variant={idx === 0 ? "purple" : idx === 1 ? "warning" : "secondary"} size="sm">
                {t.hours}
              </Badge>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between"><span className="text-slate-400">Urgent Priority:</span> <span className="font-bold text-rose-400">{t.urgent}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">High Priority:</span> <span className="font-bold text-amber-400">{t.high}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Medium Priority:</span> <span className="font-bold text-sky-400">{t.medium}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Low Priority:</span> <span className="font-bold text-slate-400">{t.low}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Add SLA Tier Modal */}
      {isAddTierOpen && (
        <Dialog
          open={isAddTierOpen}
          onClose={() => setIsAddTierOpen(false)}
          title="Define Custom SLA Policy Tier"
          description="Set contractual response and resolution time targets."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddTierOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleAddTier}>Deploy SLA Tier</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="SLA Policy Name"
              placeholder="e.g. Diamond Mission-Critical"
              value={newTierName}
              onChange={(e) => setNewTierName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Urgent Response Target"
                value={newUrgent}
                onChange={(e) => setNewUrgent(e.target.value)}
              />
              <Input
                label="High Priority Target"
                value={newHigh}
                onChange={(e) => setNewHigh(e.target.value)}
              />
            </div>
            <Input
              label="Operating Coverage Hours"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
            />
          </div>
        </Dialog>
      )}
    </Card>
  );
}
