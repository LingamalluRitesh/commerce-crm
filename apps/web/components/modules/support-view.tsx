"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  customer: string;
  subject: string;
  priority: "urgent" | "high" | "medium" | "low";
  remainingSla: string;
  isBreached: boolean;
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
}

const initialTickets: SupportTicket[] = [
  { id: "t1", ticketNumber: "TK-2026-0042", customer: "Alex Morgan (Enterprise Cloud)", subject: "Dedicated Direct Connect 10 Gbps Bandwidth Expansion", priority: "urgent", remainingSla: "42 mins", isBreached: false, status: "in_progress", assignedTo: "Sarah Connor" },
  { id: "t2", ticketNumber: "TK-2026-0043", customer: "Elena Rostova (FinTech Global)", subject: "Webhook HMAC Replay Validation Query", priority: "high", remainingSla: "3h 15m", isBreached: false, status: "open", assignedTo: "Dev Support" },
  { id: "t3", ticketNumber: "TK-2026-0044", customer: "David Miller (Apex Logistics)", subject: "Dallas W-1 Dispatch Delay Investigation", priority: "urgent", remainingSla: "Breached (12m)", isBreached: true, status: "open", assignedTo: "Operations" },
  { id: "t4", ticketNumber: "TK-2026-0045", customer: "Hiroshi Tanaka (Tokyo Robotics)", subject: "Firmware v2.4 Release Notes & Schema Updates", priority: "medium", remainingSla: "18h 40m", isBreached: false, status: "resolved", assignedTo: "Tech Support" },
];

export function SupportView() {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(initialTickets[0]);
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Alex Morgan", role: "Customer", text: "We need the 10Gbps interconnect operational before our Q3 deployment next Monday.", time: "10:15 AM", isInternal: false },
    { id: 2, author: "Sarah Connor", role: "Support Lead", text: "Internal: Port allocation #42 on Dallas Switch SW-CORE-48X is confirmed.", time: "10:30 AM", isInternal: true },
  ]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        author: "Sarah Connor",
        role: "Support Lead",
        text: replyText,
        time: "Just now",
        isInternal: isInternalNote,
      },
    ]);
    setReplyText("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Customer Support & SLA Resolution Center
          </h2>
          <p className="text-xs text-slate-400">
            Real-time countdown SLAs, internal collaboration notes, and CSAT metrics.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="default" size="sm">+ New Support Ticket</Button>
        </div>
      </div>

      {/* Ticket List + Conversation Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ticket Inbox List */}
        <div className="lg:col-span-5 space-y-3">
          {tickets.map((t) => {
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
                    variant={t.isBreached ? "destructive" : t.priority === "urgent" ? "warning" : "secondary"}
                    size="sm"
                    dot={t.priority === "urgent"}
                  >
                    {t.remainingSla}
                  </Badge>
                </div>

                <div className="font-bold text-xs text-white line-clamp-1">{t.subject}</div>
                <div className="text-[11px] text-slate-400 truncate">{t.customer}</div>

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
          {selectedTicket && (
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
                  <Button variant="success" size="xs">✓ Mark Resolved</Button>
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
                        ? "bg-amber-600 text-white shadow-glow-amber"
                        : "bg-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🔒 Internal Private Note
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder={
                      isInternalNote
                        ? "Add private staff note (invisible to customer)..."
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
          )}
        </div>
      </div>
    </div>
  );
}
