"use client";

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { SLAPolicyEditor } from "./sla-policy-editor";

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customer: string;
  subject: string;
  priority: "urgent" | "high" | "medium" | "low";
  remainingSla: string;
  isBreached: boolean;
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
  createdAt: string;
}

const initialTickets: SupportTicket[] = [
  { id: "t1", ticketNumber: "TK-2026-0042", customer: "Alex Morgan (Enterprise Cloud)", subject: "Dedicated Direct Connect 10 Gbps Bandwidth Expansion", priority: "urgent", remainingSla: "42 mins", isBreached: false, status: "in_progress", assignedTo: "Sarah Connor", createdAt: "2026-08-25 09:10" },
  { id: "t2", ticketNumber: "TK-2026-0043", customer: "Elena Rostova (FinTech Global)", subject: "Webhook HMAC Replay Validation Query", priority: "high", remainingSla: "3h 15m", isBreached: false, status: "open", assignedTo: "Dev Support", createdAt: "2026-08-25 08:30" },
  { id: "t3", ticketNumber: "TK-2026-0044", customer: "David Miller (Apex Logistics)", subject: "Dallas W-1 Dispatch Delay Investigation", priority: "urgent", remainingSla: "Breached (12m)", isBreached: true, status: "open", assignedTo: "Operations", createdAt: "2026-08-24 18:00" },
  { id: "t4", ticketNumber: "TK-2026-0045", customer: "Hiroshi Tanaka (Tokyo Robotics)", subject: "Firmware v2.4 Release Notes & Schema Updates", priority: "medium", remainingSla: "18h 40m", isBreached: false, status: "resolved", assignedTo: "Tech Support", createdAt: "2026-08-24 14:15" },
];

export function SupportView() {
  const [activeTab, setActiveTab] = useState<"inbox" | "sla_matrix">("inbox");
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(initialTickets[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState<"urgent" | "high" | "medium" | "low">("high");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [comments, setComments] = useState([
    { id: 1, author: "Alex Morgan", role: "Customer", text: "We need the 10Gbps interconnect operational before our Q3 deployment next Monday.", time: "10:15 AM", isInternal: false },
    { id: 2, author: "Sarah Connor", role: "Support Lead", text: "Internal: Port allocation #42 on Dallas Switch SW-CORE-48X is confirmed.", time: "10:30 AM", isInternal: true },
  ]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const newComment = {
      id: Date.now(),
      author: "Sarah Connor",
      role: "Support Lead",
      text: replyText.trim(),
      time: "Just now",
      isInternal: isInternalNote,
    };
    setComments([...comments, newComment]);
    setReplyText("");
    showFeedback(isInternalNote ? "Private internal staff note logged!" : "Public reply dispatched to customer!");
  };

  const handleCreateTicket = () => {
    if (!newCustomer || !newSubject) return;
    const newTk: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `TK-2026-00${tickets.length + 46}`,
      customer: newCustomer,
      subject: newSubject,
      priority: newPriority,
      remainingSla: newPriority === "urgent" ? "1h 00m" : newPriority === "high" ? "4h 00m" : "24h 00m",
      isBreached: false,
      status: "open",
      assignedTo: "Sarah Connor",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setTickets([newTk, ...tickets]);
    setSelectedTicket(newTk);
    setIsNewTicketOpen(false);
    setNewCustomer("");
    setNewSubject("");
    showFeedback(`Ticket ${newTk.ticketNumber} opened with ${newTk.priority.toUpperCase()} SLA!`);
  };

  const handleMarkResolved = () => {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, status: "resolved", remainingSla: "Resolved ✓", isBreached: false }
          : t
      )
    );
    setSelectedTicket({
      ...selectedTicket,
      status: "resolved",
      remainingSla: "Resolved ✓",
      isBreached: false,
    });
    showFeedback(`Ticket ${selectedTicket.ticketNumber} marked RESOLVED!`);
  };

  const handleExportCSV = () => {
    const headers = "TicketID,Customer,Subject,Priority,Status,RemainingSLA,AssignedTo,CreatedAt\n";
    const rows = tickets
      .map(
        (t) =>
          `"${t.ticketNumber}","${t.customer}","${t.subject}","${t.priority}","${t.status}","${t.remainingSla}","${t.assignedTo}","${t.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CommerceCRM_Support_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback("Support tickets CSV exported successfully!");
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterPriority === "all") return true;
    if (filterPriority === "urgent") return t.priority === "urgent";
    if (filterPriority === "high") return t.priority === "high";
    if (filterPriority === "resolved") return t.status === "resolved";
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Customer Support & SLA Resolution Center ({tickets.length} Tickets)
            </h2>
            <Badge variant="purple" size="sm">Real-time Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SLA countdowns, two-way omnichannel communication, and customizable SLA policy matrices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subview Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("inbox")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "inbox"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎫 Tickets Inbox
            </button>
            <button
              onClick={() => setActiveTab("sla_matrix")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "sla_matrix"
                  ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              ⏱️ SLA Policy Matrix
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>

          <Button variant="default" size="sm" onClick={() => setIsNewTicketOpen(true)}>
            + New Support Ticket
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>✓ {feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {activeTab === "sla_matrix" ? (
        <SLAPolicyEditor />
      ) : (
        <>
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tickets by ID, customer name, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: "all", label: `All Tickets (${tickets.length})` },
                { id: "urgent", label: "🔴 Urgent SLA" },
                { id: "high", label: "🟡 High Priority" },
                { id: "resolved", label: "🟢 Resolved" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterPriority(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    filterPriority === f.id
                      ? "bg-indigo-600 text-white shadow-glow-primary border border-indigo-400/40"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List + Conversation Thread */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Ticket Inbox List */}
            <div className="lg:col-span-5 space-y-3">
              {filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 shadow-glow-primary"
                        : "bg-[#0f172a] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        {t.ticketNumber}
                      </span>
                      <Badge
                        variant={
                          t.isBreached
                            ? "destructive"
                            : t.priority === "urgent"
                            ? "warning"
                            : t.status === "resolved"
                            ? "success"
                            : "secondary"
                        }
                        size="sm"
                        dot={t.priority === "urgent" && t.status !== "resolved"}
                      >
                        {t.remainingSla}
                      </Badge>
                    </div>

                    <div className="font-bold text-xs text-white line-clamp-1">{t.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate">🏢 {t.customer}</div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                      <span>Assigned: <strong className="text-slate-300">{t.assignedTo}</strong></span>
                      <span className="uppercase font-bold text-slate-400">{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Ticket Thread Viewer */}
            <div className="lg:col-span-7">
              {selectedTicket ? (
                <Card variant="bordered" className="p-6 space-y-4 flex flex-col justify-between h-full min-h-[500px]">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-400">
                          {selectedTicket.ticketNumber}
                        </span>
                        <h3 className="font-black text-base text-white mt-0.5">
                          {selectedTicket.subject}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Customer: <strong className="text-slate-200">{selectedTicket.customer}</strong>
                        </p>
                      </div>
                      {selectedTicket.status !== "resolved" ? (
                        <Button variant="success" size="xs" onClick={handleMarkResolved}>
                          ✓ Mark Resolved
                        </Button>
                      ) : (
                        <Badge variant="success" size="sm">Resolved ✓</Badge>
                      )}
                    </div>

                    {/* Messages Feed */}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            c.isInternal
                              ? "bg-amber-950/30 border-amber-500/40 text-amber-200"
                              : "bg-slate-900/70 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-1.5 font-bold">
                              <span>{c.author}</span>
                              <span className="text-[10px] text-slate-400">({c.role})</span>
                              {c.isInternal && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                                  Internal Staff Note
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{c.time}</span>
                          </div>
                          <p className="leading-relaxed">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Box */}
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsInternalNote(false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          !isInternalNote
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Public Reply
                      </button>
                      <button
                        onClick={() => setIsInternalNote(true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          isInternalNote
                            ? "bg-amber-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        🔒 Internal Staff Note
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder={
                          isInternalNote
                            ? "Add private staff note (hidden from customer)..."
                            : "Type public response to customer..."
                        }
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                        className={`flex-1 px-4 py-2.5 rounded-xl border text-xs text-white focus:outline-none ${
                          isInternalNote
                            ? "bg-amber-950/20 border-amber-500/50 focus:ring-2 focus:ring-amber-500"
                            : "bg-slate-900 border-slate-700 focus:ring-2 focus:ring-indigo-500"
                        }`}
                      />
                      <Button variant="default" size="sm" onClick={handleSendReply}>
                        Send ➔
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card variant="bordered" className="p-6 text-center text-xs text-slate-500">
                  Select a ticket from the inbox.
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <Dialog
          open={isNewTicketOpen}
          onClose={() => setIsNewTicketOpen(false)}
          title="Create Customer Support Ticket"
          description="Register customer issue and compute SLA resolution target."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsNewTicketOpen(false)}>Cancel</Button>
              <Button variant="default" size="sm" onClick={handleCreateTicket}>Open Ticket</Button>
            </>
          }
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Customer Account / Contact"
              placeholder="e.g. Alex Morgan (Enterprise Cloud)"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
            />
            <Input
              label="Issue Subject"
              placeholder="e.g. Optical Interconnect Latency Anomaly"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">SLA Priority Tier</label>
              <select
                value={newPriority}
                aria-label="SLA Priority Tier"
                onChange={(e) => setNewPriority(e.target.value as "urgent" | "high" | "medium" | "low")}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
              >
                <option value="urgent">🔴 Urgent (1 Hour Response SLA)</option>
                <option value="high">🟡 High (4 Hour Response SLA)</option>
                <option value="medium">🔵 Medium (24 Hour Response SLA)</option>
                <option value="low">⚪ Low (72 Hour Response SLA)</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
