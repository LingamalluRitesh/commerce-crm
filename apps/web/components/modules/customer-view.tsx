"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";

export interface CustomerRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  healthScore: number;
  ltv: string;
  status: "active" | "at_risk" | "churned";
  tier: "Tier 1" | "Tier 2";
  industry: string;
  lastInteraction: string;
}

const initialCustomers: CustomerRecord[] = [
  { id: "c1", name: "Alex Morgan", company: "Enterprise Cloud Inc", email: "alex.morgan@enterprise-cloud.io", phone: "+1-555-019-2831", healthScore: 92, ltv: "$250,000.00", status: "active", tier: "Tier 1", industry: "Cloud Infrastructure", lastInteraction: "Executive QBR Call" },
  { id: "c2", name: "Elena Rostova", company: "FinTech Global Payments", email: "elena.rostova@fintech-global.com", phone: "+1-555-018-9481", healthScore: 88, ltv: "$180,000.00", status: "active", tier: "Tier 1", industry: "FinTech", lastInteraction: "Tiered Contract Renewal" },
  { id: "c3", name: "Hiroshi Tanaka", company: "Tokyo Robotics Automation", email: "hiroshi@tokyo-robotics.jp", phone: "+81-3-5550-1928", healthScore: 74, ltv: "$95,000.00", status: "active", tier: "Tier 2", industry: "Robotics", lastInteraction: "Firmware Support Ticket" },
  { id: "c4", name: "David Miller", company: "Apex Logistics Europe", email: "d.miller@apex-logistics.de", phone: "+49-89-5550-1284", healthScore: 54, ltv: "$62,000.00", status: "at_risk", tier: "Tier 2", industry: "Supply Chain", lastInteraction: "SLA Resolution Inquiry" },
  { id: "c5", name: "Sophia Chen", company: "Singapore Data Dynamics", email: "sophia@sg-datadynamics.sg", phone: "+65-6555-0199", healthScore: 96, ltv: "$410,000.00", status: "active", tier: "Tier 1", industry: "Big Data & AI", lastInteraction: "Inference Node Upgrade" },
];

export function CustomerView() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "tier1" | "healthy" | "at_risk">("all");
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord | null>(initialCustomers[0]);

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLogMeetingOpen, setIsLogMeetingOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form states
  const [newName, setNewName] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newTier, setNewTier] = useState<"Tier 1" | "Tier 2">("Tier 1");
  const [newIndustry, setNewIndustry] = useState("Enterprise SaaS");

  // Edit states
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editTier, setEditTier] = useState<"Tier 1" | "Tier 2">("Tier 1");

  const [meetingNotes, setMeetingNotes] = useState("");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "tier1") return c.tier === "Tier 1";
    if (selectedFilter === "healthy") return c.healthScore >= 80;
    if (selectedFilter === "at_risk") return c.healthScore < 60 || c.status === "at_risk";
    return true;
  });

  const handleRegisterCustomer = () => {
    if (!newName || !newCompany) return;
    const newCust: CustomerRecord = {
      id: `c-${Date.now()}`,
      name: newName,
      company: newCompany,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, ".")}@${newCompany.toLowerCase().replace(/\s+/g, "")}.com`,
      phone: newPhone || "+1-555-010-0000",
      healthScore: 85,
      ltv: "$50,000.00",
      status: "active",
      tier: newTier,
      industry: newIndustry,
      lastInteraction: "Account Provisioned",
    };

    setCustomers([newCust, ...customers]);
    setActiveCustomer(newCust);
    setIsRegisterOpen(false);
    setNewName("");
    setNewCompany("");
    setNewEmail("");
    setNewPhone("");
    showFeedback(`Customer "${newCust.name} (${newCust.company})" registered successfully!`);
  };

  const handleExportCSV = () => {
    const headers = "ID,Name,Company,Email,Phone,HealthScore,LTV,Tier,Status,Industry\n";
    const rows = customers
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.company}","${c.email}","${c.phone}",${c.healthScore},"${c.ltv}","${c.tier}","${c.status}","${c.industry}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("CSV export generated and downloaded!");
  };

  const handleLogMeeting = () => {
    if (!activeCustomer || !meetingNotes) return;
    const updatedScore = Math.min(100, activeCustomer.healthScore + 3);
    const updatedCust = {
      ...activeCustomer,
      lastInteraction: meetingNotes,
      healthScore: updatedScore,
      status: (updatedScore >= 60 ? "active" : "at_risk") as CustomerRecord["status"],
    };

    setCustomers((prev) =>
      prev.map((c) => (c.id === activeCustomer.id ? updatedCust : c))
    );
    setActiveCustomer(updatedCust);
    setIsLogMeetingOpen(false);
    setMeetingNotes("");
    showFeedback(`Interaction logged for ${activeCustomer.name} (Health Score +3)!`);
  };

  const handleSaveEdit = () => {
    if (!activeCustomer) return;
    const updatedCust = {
      ...activeCustomer,
      email: editEmail || activeCustomer.email,
      phone: editPhone || activeCustomer.phone,
      tier: editTier,
    };
    setCustomers((prev) =>
      prev.map((c) => (c.id === activeCustomer.id ? updatedCust : c))
    );
    setActiveCustomer(updatedCust);
    setIsEditOpen(false);
    showFeedback(`Account details updated for ${activeCustomer.company}`);
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    const nextList = customers.filter((c) => c.id !== id);
    setCustomers(nextList);
    setActiveCustomer(nextList.length > 0 ? nextList[0] : null);
    showFeedback(`Customer account "${name}" removed from 360 directory`);
  };

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Customer 360 & Unified Accounts ({customers.length})
            </h2>
            <Badge variant="purple" size="sm">Live Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time omnichannel telemetry, health score heuristics, interaction timeline, and lifetime value tracking.
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>
          <Button variant="default" size="sm" onClick={() => setIsRegisterOpen(true)}>
            + Register Customer
          </Button>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by contact name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: "all", label: `All Accounts (${customers.length})` },
              { id: "tier1", label: "⭐ Tier 1 VIP" },
              { id: "healthy", label: "🟢 Healthy (80+)" },
              { id: "at_risk", label: "⚠️ Churn Risk (<60)" },
            ] as const
          ).map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedFilter === f.id
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout: Table + Customer 360 Slide Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Directory Table */}
        <div className="lg:col-span-2">
          <Card variant="bordered" className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer / Company</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Lifetime Value</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const isSelected = activeCustomer?.id === c.id;
                  return (
                    <TableRow
                      key={c.id}
                      onClick={() => setActiveCustomer(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-950/40 border-l-4 border-l-indigo-500" : ""
                      }`}
                    >
                      <TableCell>
                        <div className="font-bold text-white text-xs">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.company}</div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-12 bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                c.healthScore >= 80
                                  ? "bg-emerald-400 shadow-glow-emerald"
                                  : c.healthScore >= 60
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${c.healthScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {c.healthScore}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-mono font-bold text-xs text-indigo-400">
                        {c.ltv}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={c.tier === "Tier 1" ? "purple" : "secondary"}
                          size="sm"
                        >
                          {c.tier}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveCustomer(c);
                          }}
                        >
                          View 360 →
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Customer 360 Detail Drawer */}
        <div className="lg:col-span-1">
          {activeCustomer ? (
            <Card variant="bordered" className="p-6 space-y-5 sticky top-24">
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-black text-lg text-white">{activeCustomer.name}</h3>
                  <p className="text-xs text-indigo-400 font-semibold">{activeCustomer.company}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{activeCustomer.industry}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge
                    variant={activeCustomer.status === "active" ? "success" : "destructive"}
                    dot
                  >
                    {activeCustomer.status.toUpperCase()}
                  </Badge>
                  <button
                    onClick={() => {
                      setEditEmail(activeCustomer.email);
                      setEditPhone(activeCustomer.phone);
                      setEditTier(activeCustomer.tier);
                      setIsEditOpen(true);
                    }}
                    className="text-[10px] text-indigo-400 hover:underline font-bold"
                  >
                    Edit Info ✏️
                  </button>
                </div>
              </div>

              {/* Health Score Gauge Box */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Real-time Health Score
                  </span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {activeCustomer.healthScore} / 100
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/20 border border-emerald-500/30">
                  {activeCustomer.healthScore >= 80 ? "Optimal" : activeCustomer.healthScore >= 60 ? "Moderate" : "At Risk"}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-200">{activeCustomer.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-200">{activeCustomer.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Lifetime Value:</span>
                  <span className="font-mono font-bold text-indigo-400">{activeCustomer.ltv}</span>
                </div>
              </div>

              {/* Interaction Timeline Feed */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Latest Interaction
                </span>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  💬 <span className="font-semibold text-white">{activeCustomer.lastInteraction}</span>
                  <div className="text-[10px] text-slate-400 mt-1">Updated in audit timeline</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsLogMeetingOpen(true)}>
                  Log Meeting
                </Button>
                <Button variant="default" size="sm" onClick={() => setIsQuoteOpen(true)}>
                  + Create Quote
                </Button>
              </div>

              <div className="pt-2 border-t border-slate-800 text-right">
                <button
                  onClick={() => handleDeleteCustomer(activeCustomer.id, activeCustomer.name)}
                  className="text-[11px] text-slate-500 hover:text-rose-400 font-semibold"
                >
                  Delete Customer Account
                </button>
              </div>
            </Card>
          ) : (
            <Card variant="bordered" className="p-6 text-center text-xs text-slate-500">
              Select a customer to view complete Customer 360 profile.
            </Card>
          )}
        </div>
      </div>

      {/* Register Customer Dialog */}
      {isRegisterOpen && (
        <Dialog
          open={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          title="Register New Enterprise Customer"
          description="Provision a unified customer record with auto-calculated health score telemetry."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsRegisterOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleRegisterCustomer}>Register Customer</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Contact Full Name"
              placeholder="e.g. Marcus Vance"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Company Name"
              placeholder="e.g. Nexus Global Infrastructure"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
            <Input
              label="Business Email"
              type="email"
              placeholder="marcus@nexusglobal.io"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              placeholder="+1-555-019-4829"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Customer Tier</label>
              <select
                value={newTier}
                aria-label="Customer Tier"
                onChange={(e) => setNewTier(e.target.value as "Tier 1" | "Tier 2")}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="Tier 1">⭐ Tier 1 VIP (Strategic)</option>
                <option value="Tier 2">🏢 Tier 2 (Standard Enterprise)</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit Customer Dialog */}
      {isEditOpen && activeCustomer && (
        <Dialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title={`Edit Account Info — ${activeCustomer.company}`}
          description="Update contact email, phone, and tier assignment."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleSaveEdit}>Save Changes</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Email Address"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Tier</label>
              <select
                value={editTier}
                aria-label="Tier"
                onChange={(e) => setEditTier(e.target.value as "Tier 1" | "Tier 2")}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="Tier 1">⭐ Tier 1 VIP</option>
                <option value="Tier 2">🏢 Tier 2 Standard</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}

      {/* Log Meeting Dialog */}
      {isLogMeetingOpen && activeCustomer && (
        <Dialog
          open={isLogMeetingOpen}
          onClose={() => setIsLogMeetingOpen(false)}
          title={`Log Interaction — ${activeCustomer.name}`}
          description={`Record meeting, call, or quarterly business review for ${activeCustomer.company}`}
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsLogMeetingOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleLogMeeting}>Save Interaction</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Meeting Topic / Action Summary"
              placeholder="e.g. Q3 Dedicated Server Capacity Review & SLA Sign-off"
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
            />
          </div>
        </Dialog>
      )}

      {/* Quote Dialog */}
      {isQuoteOpen && activeCustomer && (
        <Dialog
          open={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          title={`Generate Commercial Quote — ${activeCustomer.company}`}
          description={`Prepare structured quote for ${activeCustomer.name}`}
          footer={
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setIsQuoteOpen(false);
                showFeedback(`Formal B2B Quote generated & dispatched to ${activeCustomer.email}`);
              }}
            >
              Dispatch Quote PDF ➔
            </Button>
          }
        >
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Selected Account:</span>
              <strong className="text-white">{activeCustomer.company}</strong>
            </div>
            <div className="flex justify-between">
              <span>Assigned Tier Discount:</span>
              <span className="font-mono text-purple-400 font-bold">{activeCustomer.tier === "Tier 1" ? "15% VIP Discount" : "5% Standard Discount"}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Value:</span>
              <span className="font-mono text-emerald-400 font-bold">$125,000.00</span>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
