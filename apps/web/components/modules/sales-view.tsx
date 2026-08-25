"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface DealCard {
  id: string;
  title: string;
  company: string;
  amount: number;
  propensityScore: number;
  stage: "discovery" | "qualified" | "proposal" | "negotiation" | "won";
}

const initialDeals: DealCard[] = [
  { id: "d1", title: "Enterprise SaaS Expansion", company: "Stripe Inc", amount: 250000, propensityScore: 92, stage: "negotiation" },
  { id: "d2", title: "Global Logistics Cloud", company: "FedEx Freight", amount: 180000, propensityScore: 78, stage: "proposal" },
  { id: "d3", title: "Omnichannel Commerce Upgrade", company: "Sephora Retail", amount: 120000, propensityScore: 85, stage: "qualified" },
  { id: "d4", title: "Financial Core Migration", company: "Monzo Bank", amount: 340000, propensityScore: 96, stage: "discovery" },
  { id: "d5", title: "Automotive IoT Telemetry", company: "Tesla Energy", amount: 500000, propensityScore: 94, stage: "won" },
];

const stages = [
  { id: "discovery", name: "1. Discovery", color: "border-slate-300 dark:border-slate-700" },
  { id: "qualified", name: "2. Qualified", color: "border-sky-300 dark:border-sky-700" },
  { id: "proposal", name: "3. Proposal Sent", color: "border-purple-300 dark:border-purple-700" },
  { id: "negotiation", name: "4. Negotiation", color: "border-amber-300 dark:border-amber-700" },
  { id: "won", name: "5. Closed Won", color: "border-emerald-300 dark:border-emerald-700" },
];

export function SalesView() {
  const [deals, setDeals] = useState<DealCard[]>(initialDeals);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const moveDeal = (dealId: string, nextStage: DealCard["stage"]) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: nextStage } : d))
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">CRM Sales Pipeline & Deals</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive multi-stage deal flow, ML lead conversion propensity, and commercial quote builder.
          </p>
        </div>
        <div className="flex space-x-2.5">
          <Button variant="outline" size="sm" onClick={() => setIsQuoteOpen(true)}>
            📝 Create Formal Quote
          </Button>
          <Button variant="default" size="sm">+ Add New Deal</Button>
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div key={stage.id} className="flex flex-col space-y-3 bg-slate-50/60 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{stage.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">${stageTotal.toLocaleString()}</span>
                </div>
                <Badge variant="secondary" size="sm">{stageDeals.length}</Badge>
              </div>

              <div className="space-y-2.5 flex-1">
                {stageDeals.map((deal) => (
                  <Card key={deal.id} variant="elevated" className="p-3.5 space-y-2 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-tight">{deal.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">{deal.company}</div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ${deal.amount.toLocaleString()}
                      </span>
                      <Badge variant="purple" size="sm">
                        {deal.propensityScore}% AI
                      </Badge>
                    </div>

                    {/* Quick Move Trigger Controls */}
                    {stage.id !== "won" && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-[10px] text-indigo-600"
                          onClick={() => {
                            const stageIndex = stages.findIndex((s) => s.id === stage.id);
                            if (stageIndex < stages.length - 1) {
                              moveDeal(deal.id, stages[stageIndex + 1].id as DealCard["stage"]);
                            }
                          }}
                        >
                          Advance ➔
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quote Builder Modal */}
      {isQuoteOpen && (
        <Dialog
          open={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          size="lg"
          title="Formal Commercial Quotation Builder"
          description="Build itemized proposals with dynamic volume tier discounts and automatic tax arithmetic."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsQuoteOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm">Generate & Send Quote PDF</Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Deal Reference" defaultValue="Enterprise SaaS Expansion (Stripe)" />
              <Input label="Recipient Email" defaultValue="procurement@stripe.com" />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="font-bold text-slate-800 dark:text-slate-200">Line Items & Scope</div>
              <div className="grid grid-cols-4 gap-2 text-slate-500 text-[10px] uppercase font-bold">
                <span className="col-span-2">Item Description</span>
                <span>Qty / Hours</span>
                <span className="text-right">Total Price</span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="col-span-2 font-medium">Enterprise License (Annual 500 seats)</span>
                <span>1</span>
                <span className="text-right font-mono font-semibold">$200,000.00</span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <span className="col-span-2 font-medium">Dedicated Solution Architect Support</span>
                <span>120 hrs</span>
                <span className="text-right font-mono font-semibold">$30,000.00</span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between font-bold text-sm">
                <span>Subtotal (Net + 5% Volume Discount):</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">$218,500.00</span>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
