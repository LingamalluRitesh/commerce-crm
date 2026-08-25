"use client";

import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { QuoteBuilder } from "./quote-builder";

export interface DealCard {
  id: string;
  name: string;
  customer: string;
  amount: number;
  probability: number;
  stageId: "discovery" | "qualification" | "proposal" | "negotiation" | "won";
  expectedClose: string;
  owner: string;
}

const initialDeals: DealCard[] = [
  { id: "d1", name: "Enterprise Multi-Region Edge Migration", customer: "Alex Morgan (Enterprise Cloud)", amount: 250000, probability: 75, stageId: "proposal", expectedClose: "2026-09-15", owner: "Sarah Connor" },
  { id: "d2", name: "Global Payment Processing Core", customer: "Elena Rostova (FinTech Global)", amount: 180000, probability: 85, stageId: "negotiation", expectedClose: "2026-09-30", owner: "Marcus Vance" },
  { id: "d3", name: "Industrial IoT Edge Gateway Cluster", customer: "Hiroshi Tanaka (Tokyo Robotics)", amount: 95000, probability: 40, stageId: "discovery", expectedClose: "2026-10-15", owner: "Sarah Connor" },
  { id: "d4", name: "Autonomous Warehouse Telemetry", customer: "David Miller (Apex Logistics)", amount: 120000, probability: 60, stageId: "qualification", expectedClose: "2026-10-01", owner: "Elena Rostova" },
  { id: "d5", name: "AI Inference Cluster Hardware", customer: "Sophia Chen (Singapore Data)", amount: 410000, probability: 100, stageId: "won", expectedClose: "2026-08-20", owner: "Sarah Connor" },
];

const stages = [
  { id: "discovery", name: "1. Discovery", color: "border-sky-500/40 text-sky-400" },
  { id: "qualification", name: "2. Qualification", color: "border-indigo-500/40 text-indigo-400" },
  { id: "proposal", name: "3. Proposal Sent", color: "border-purple-500/40 text-purple-400" },
  { id: "negotiation", name: "4. Negotiation", color: "border-amber-500/40 text-amber-400" },
  { id: "won", name: "5. Closed Won", color: "border-emerald-500/40 text-emerald-400" },
];

export function SalesView() {
  const [activeTab, setActiveTab] = useState<"kanban" | "quotation">("kanban");
  const [deals, setDeals] = useState<DealCard[]>(initialDeals);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealCard | null>(null);

  const [isNewDealOpen, setIsNewDealOpen] = useState(false);
  const [newDealName, setNewDealName] = useState("");
  const [newDealCustomer, setNewDealCustomer] = useState("");
  const [newDealAmount, setNewDealAmount] = useState("75000");
  const [newOwner, setNewOwner] = useState("Sarah Connor");
  const [feedback, setFeedback] = useState<string | null>(null);

  const moveDealStage = (dealId: string, nextStage: DealCard["stageId"]) => {
    const nextProbMap: Record<DealCard["stageId"], number> = {
      discovery: 30,
      qualification: 50,
      proposal: 75,
      negotiation: 90,
      won: 100,
    };

    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, stageId: nextStage, probability: nextProbMap[nextStage] }
          : d
      )
    );
    if (selectedDeal && selectedDeal.id === dealId) {
      setSelectedDeal({
        ...selectedDeal,
        stageId: nextStage,
        probability: nextProbMap[nextStage],
      });
    }
    showFeedback(`Deal moved to ${nextStage.toUpperCase()} (${nextProbMap[nextStage]}% win probability)`);
  };

  const handleCreateDeal = () => {
    if (!newDealName) return;
    const newDeal: DealCard = {
      id: `d_${Date.now()}`,
      name: newDealName,
      customer: newDealCustomer || "New Prospect Enterprise",
      amount: parseFloat(newDealAmount) || 50000,
      probability: 30,
      stageId: "discovery",
      expectedClose: "2026-10-31",
      owner: newOwner,
    };
    setDeals([newDeal, ...deals]);
    setIsNewDealOpen(false);
    setNewDealName("");
    setNewDealCustomer("");
    showFeedback(`Opportunity "${newDeal.name}" added to pipeline!`);
  };

  const handleDeleteDeal = (id: string, name: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    if (selectedDeal?.id === id) setSelectedDeal(null);
    showFeedback(`Deal "${name}" removed from pipeline`);
  };

  const handleExportCSV = () => {
    const headers = "DealID,Name,Customer,Amount,Probability,Stage,ExpectedClose,Owner\n";
    const rows = deals
      .map(
        (d) =>
          `"${d.id}","${d.name}","${d.customer}",${d.amount},${d.probability}%,"${d.stageId}","${d.expectedClose}","${d.owner}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Sales_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Sales pipeline CSV exported successfully!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredDeals = deals.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPipeline = filteredDeals.reduce((acc, d) => acc + d.amount, 0);
  const weightedPipeline = filteredDeals.reduce((acc, d) => acc + (d.amount * d.probability) / 100, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Bar with Tabs and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              B2B Strategic Sales Pipeline ({deals.length} Opportunities)
            </h2>
            <Badge variant="purple" size="sm">Real-time Kanban</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic stage progression, weighted revenue forecasts, and formal CPQ quotation designer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subview Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("kanban")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "kanban"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              💼 Deal Pipeline
            </button>
            <button
              onClick={() => setActiveTab("quotation")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "quotation"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📝 Quotation Designer (CPQ)
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>

          <Button variant="default" size="sm" onClick={() => setIsNewDealOpen(true)}>
            + Create Deal
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {activeTab === "quotation" ? (
        <QuoteBuilder />
      ) : (
        <>
          {/* Pipeline Metric Bar & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search deals by opportunity, customer, or account owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
            </div>

            <div className="flex items-center space-x-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Gross Pipeline</span>
                <span className="font-bold text-white text-sm">${totalPipeline.toLocaleString()}.00</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Weighted Pipeline</span>
                <span className="font-black text-emerald-400 text-sm">${weightedPipeline.toLocaleString(undefined, { maximumFractionDigits: 0 })}.00</span>
              </div>
            </div>
          </div>

          {/* Kanban Board Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {stages.map((stage) => {
              const stageDeals = filteredDeals.filter((d) => d.stageId === stage.id);
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
                        onClick={() => setSelectedDeal(deal)}
                        className="p-3.5 rounded-xl bg-[#0f172a] border border-slate-800/90 hover:border-indigo-500/50 hover:shadow-lg transition-all duration-200 space-y-2.5 group cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                            {deal.name}
                          </div>
                          <button
                            title="Remove Deal"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDeal(deal.id, deal.name);
                            }}
                            className="text-slate-600 hover:text-rose-400 text-xs font-bold transition-colors ml-1"
                          >
                            ✕
                          </button>
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

                        {/* Stage Advancement Action Bar */}
                        <div
                          className="pt-1.5 flex justify-between items-center border-t border-slate-800/50"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {stage.id !== "discovery" && (
                            <button
                              onClick={() => {
                                const prevMap: Record<string, DealCard["stageId"]> = {
                                  qualification: "discovery",
                                  proposal: "qualification",
                                  negotiation: "proposal",
                                  won: "negotiation",
                                };
                                moveDealStage(deal.id, prevMap[stage.id]);
                              }}
                              className="text-[10px] text-slate-400 hover:text-white font-bold"
                            >
                              ◀ Back
                            </button>
                          )}

                          {stage.id !== "won" ? (
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
                              className="text-[10px] text-indigo-400 hover:text-indigo-200 font-bold ml-auto flex items-center space-x-0.5"
                            >
                              <span>Advance ➔</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-bold ml-auto">
                              ✓ Won & Closed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Deal Deep-Dive Detail Modal */}
      {selectedDeal && (
        <Dialog
          open={!!selectedDeal}
          onClose={() => setSelectedDeal(null)}
          size="md"
          title={`Opportunity Details — ${selectedDeal.name}`}
          description={`Customer: ${selectedDeal.customer} • Value: $${selectedDeal.amount.toLocaleString()}`}
          footer={
            <div className="flex justify-between w-full">
              <Button variant="destructive" size="sm" onClick={() => handleDeleteDeal(selectedDeal.id, selectedDeal.name)}>
                Delete Deal
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDeal(null)}>
                  Close
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setSelectedDeal(null);
                    setActiveTab("quotation");
                    showFeedback(`Loaded ${selectedDeal.customer} into Quotation Designer!`);
                  }}
                >
                  Open in Quote Designer ➔
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Account Owner:</span>
                <span className="font-bold text-white">{selectedDeal.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Pipeline Stage:</span>
                <Badge variant="purple" size="sm">{selectedDeal.stageId.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Win Probability:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedDeal.probability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Target Close Date:</span>
                <span className="font-mono text-slate-300">{selectedDeal.expectedClose}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-300 uppercase text-[10px]">Advance Stage Quickly:</span>
              <div className="grid grid-cols-5 gap-1.5">
                {(["discovery", "qualification", "proposal", "negotiation", "won"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => moveDealStage(selectedDeal.id, st)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                      selectedDeal.stageId === st
                        ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st.slice(0, 4).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* New Deal Modal */}
      {isNewDealOpen && (
        <Dialog
          open={isNewDealOpen}
          onClose={() => setIsNewDealOpen(false)}
          title="Create New Sales Opportunity"
          description="Register a new strategic pipeline deal and assign initial probability."
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
              placeholder="e.g. Multi-Site Enterprise Edge Expansion"
              value={newDealName}
              onChange={(e) => setNewDealName(e.target.value)}
            />
            <Input
              label="Account / Customer Name"
              placeholder="e.g. Acme Global Industries"
              value={newDealCustomer}
              onChange={(e) => setNewDealCustomer(e.target.value)}
            />
            <Input
              label="Estimated Deal Value ($)"
              type="number"
              value={newDealAmount}
              onChange={(e) => setNewDealAmount(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Assigned Account Executive</label>
              <select
                value={newOwner}
                aria-label="Assigned Account Executive"
                onChange={(e) => setNewOwner(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="Sarah Connor">Sarah Connor (Principal AE)</option>
                <option value="Marcus Vance">Marcus Vance (Strategic Director)</option>
                <option value="Elena Rostova">Elena Rostova (Enterprise Lead)</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
