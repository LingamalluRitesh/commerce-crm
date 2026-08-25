"use client";

import React, { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("Acme Enterprise Global");

  const recentNotifications = [
    { id: 1, title: "High-Priority SLA Alert", desc: "Ticket #TK-2026-0042 has 45 mins remaining", time: "5m ago", type: "urgent" },
    { id: 2, title: "New Deal Stage Progression", desc: "Enterprise Cloud Node closed at $250,000", time: "18m ago", type: "success" },
    { id: 3, title: "Stock Reorder Warning", desc: "Dallas W-1: NVMe 64T array below threshold (12 left)", time: "1h ago", type: "warning" },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-800/80 bg-[#0c111d]/80 backdrop-blur-xl px-6 flex items-center justify-between shadow-lg">
        {/* Left: Workspace Picker & Page Context */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-glow-primary" />
            <select
              value={selectedTenant}
              aria-label="Select active tenant workspace"
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="Acme Enterprise Global" className="bg-slate-900 text-slate-200">
                🏢 Acme Enterprise Global (Production)
              </option>
              <option value="European Operations" className="bg-slate-900 text-slate-200">
                🌍 European Operations (Branch)
              </option>
              <option value="APAC Logistics Hub" className="bg-slate-900 text-slate-200">
                🌏 APAC Logistics Hub (Branch)
              </option>
            </select>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400">
            <span>/</span>
            <span className="font-semibold text-slate-300">Enterprise Suite</span>
          </div>
        </div>

        {/* Middle: Command Search Trigger */}
        <div className="flex-1 max-w-md mx-6 hidden lg:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm group-hover:text-indigo-400">🔍</span>
              <span>Search customers, orders, deals, tickets...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & Copilot */}
        <div className="flex items-center space-x-3">
          {/* AI Copilot Badge Button */}
          <LinkButton href="/ai" />

          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              <span className="text-sm">🔔</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {isNotifyOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-4 space-y-3 z-50 backdrop-blur-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">Domain Event Feed</span>
                  <Badge variant="purple" size="sm">3 Unread</Badge>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {recentNotifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 transition-colors space-y-1"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[11px] font-bold text-slate-200">{n.title}</span>
                        <span className="text-[9px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Quick Create CTA */}
          <Button variant="default" size="sm" className="hidden sm:inline-flex shadow-glow-primary">
            + Quick Action
          </Button>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && (
        <Dialog
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          size="md"
          title="Universal Enterprise Search"
          description="Type keywords across Customers, Deals, Invoices, and Knowledge Articles."
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search anything (e.g. 'Stripe deal', 'Dallas W-1', 'Server Node X9')..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">Quick Navigation</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href="/customers" className="p-2 rounded-lg bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors block">
                  👥 Customer Directory
                </a>
                <a href="/sales" className="p-2 rounded-lg bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors block">
                  💼 Deal Pipeline Kanban
                </a>
                <a href="/inventory" className="p-2 rounded-lg bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors block">
                  📦 Warehouse Stocks
                </a>
                <a href="/support" className="p-2 rounded-lg bg-slate-800/50 hover:bg-indigo-600/20 hover:text-indigo-300 border border-slate-800 transition-colors block">
                  🎫 Support Tickets (SLA)
                </a>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

function LinkButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 text-xs font-bold transition-all shadow-sm group"
    >
      <span className="text-xs group-hover:scale-125 transition-transform">✨</span>
      <span>AI Copilot</span>
    </a>
  );
}
