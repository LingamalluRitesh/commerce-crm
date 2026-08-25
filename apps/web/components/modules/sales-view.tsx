"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

interface DealCard {
  id: string;
  name: string;
  customer: string;
  amount: number;
  probability: number;
  stageId: "discovery" | "qualification" | "proposal" | "negotiation" | "won";
}

const initialDeals: DealCard[] = [
  { id: "d1", name: "Enterprise Multi-Region Edge Migration", customer: "Alex Morgan (Enterprise Cloud)", amount: 250000, probability: 75, stageId: "proposal" },
  { id: "d2", name: "Global Payment Processing Core", customer: "Elena Rostova (FinTech Global)", amount: 180000, probability: 85, stageId: "negotiation" },
  { id: "d3", name: "Industrial IoT Edge Gateway Cluster", customer: "Hiroshi Tanaka (Tokyo Robotics)", amount: 95000, probability: 40, stageId: "discovery" },
  { id: "d4", name: "Autonomous Warehouse Telemetry", customer: "David Miller (Apex Logistics)", amount: 120000, probability: 60, stageId: "qualification" },
  { id: "d5", name: "AI Inference Cluster Hardware", customer: "Sophia Chen (Singapore Data)", amount: 410000, probability: 100, stageId: "won" },
];

const stages = [
  { id: "discovery", name: "1. Discovery", color: "border-sky-500/40 text-sky-400" },
  { id: "qualification", name: "2. Qualification", color: "border-indigo-500/40 text-indigo-400" },
  { id: "proposal", name: "3. Proposal Sent", color: "border-purple-500/40 text-purple-400" },
  { id: "negotiation", name: "4. Negotiation", color: "border-amber-500/40 text-amber-400" },
  { id: "won", name: "5. Closed Won", color: "border-emerald-500/40 text-emerald-400" },
];

export function SalesView() {
  const [deals, setDeals] = useState<DealCard[]>(initialDeals);
  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [newDealName, setNewDealName] = useState("");
  const [newDealCustomer, setNewDealCustomer] = useState("");
  const [newDealAmount, setNewDealAmount] = useState("50000");

  const moveDealStage = (dealId: string, nextStage: DealCard["stageId"]) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stageId: nextStage, probability: nextStage === "won" ? 100 : d.probability } : d))
    );
  };

  const handleCreateDeal = () => {
    if (!newDealName) return;
    const newDeal: DealCard = {
      id: `d_${Date.now()}`,
      name: newDealName,
      customer: newDealCustomer || "New Prospect Corp",
      amount: parseFloat(newDealAmount) || 50000,
      probability: 30,
      stageId: "discovery",
    };
    setDeals([newDeal, ...deals]);
    setIsNewDealOpen(false);
    setNewDealName("");
  };

  const totalPipeline = deals.reduce((acc, d) => acc + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Pipeline Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              B2B Strategic Sales Pipeline
            </h2>
            <Badge variant="purple" size="sm">Active Deals: {deals.length}</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Drag, prioritize, and track deal stages from discovery to closed-won.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pipeline Value</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              ${totalPipeline.toLocaleString()}.00
            </span>
          </div>
          <Button variant="default" size="sm" onClick={() => setIsNewDealOpen(true)}>
            + Create Deal
          </Button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageDeals = deals.filter((d) => d.stageId === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div
              key={stage.id}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col space-y-3 min-w-[240px]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div>
                  <span className={`text-xs font-bold ${stage.color}`}>{stage.name}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ${stageTotal.toLocaleString()}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                  {stageDeals.length}
                </span>
              </div>

              {/* Deal Cards */}
              <div className="space-y-2.5 flex-1">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3.5 rounded-xl bg-[#0f172a] border border-slate-800/90 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 space-y-2.5 group"
                  >
                    <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                      {deal.name}
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      🏢 {deal.customer}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                      <span className="font-mono font-bold text-xs text-emerald-400">
                        ${deal.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {deal.probability}% Win
                      </span>
                    </div>

                    {/* Quick Move Next Stage Button */}
                    {stage.id !== "won" && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            const nextStageMap: Record<string, DealCard["stageId"]> = {
                              discovery: "qualification",
                              qualification: "proposal",
                              proposal: "negotiation",
                              negotiation: "won",
                            };
                            moveDealStage(deal.id, nextStageMap[stage.id]);
                          }}
                          className="text-[10px] text-indigo-400 hover:text-indigo-200 font-bold flex items-center space-x-1"
                        >
                          <span>Advance ➔</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* New Deal Modal */}
      {isNewDealOpen && (
        <Dialog
          open={isNewDealOpen}
          onClose={() => setIsNewDealOpen(false)}
          title="Create New Sales Opportunity"
          description="Register a new strategic pipeline deal and assign win probability."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewDealOpen(false)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleCreateDeal}>
                Create Opportunity
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Opportunity Deal Name"
              placeholder="e.g. Multi-Site Enterprise Expansion"
              value={newDealName}
              onChange={(e) => setNewDealName(e.target.value)}
            />
            <Input
              label="Account / Customer Name"
              placeholder="e.g. Acme Cloud Corp"
              value={newDealCustomer}
              onChange={(e) => setNewDealCustomer(e.target.value)}
            />
            <Input
              label="Estimated Deal Value ($)"
              type="number"
              value={newDealAmount}
              onChange={(e) => setNewDealAmount(e.target.value)}
            />
          </div>
        </Dialog>
      )}
    </div>
  );
}
