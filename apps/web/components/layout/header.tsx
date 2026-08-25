"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

interface SearchResultItem {
  id: string;
  title: string;
  category: "Customer" | "Deal" | "Order" | "Ticket" | "SKU" | "Invoice";
  subtitle: string;
  href: string;
}

const searchableEntities: SearchResultItem[] = [
  { id: "s1", title: "Alex Morgan", category: "Customer", subtitle: "Enterprise Cloud Inc • Tier 1 VIP", href: "/customers" },
  { id: "s2", title: "Elena Rostova", category: "Customer", subtitle: "FinTech Global Payments • Tier 1 VIP", href: "/customers" },
  { id: "s3", title: "Enterprise Multi-Region Edge Migration", category: "Deal", subtitle: "$250,000.00 • 75% Win Probability", href: "/sales" },
  { id: "s4", title: "Global Payment Processing Core", category: "Deal", subtitle: "$180,000.00 • Negotiation Stage", href: "/sales" },
  { id: "s5", title: "ORD-2026-00918", category: "Order", subtitle: "$5,089.00 • FedEx Priority • PAID", href: "/commerce" },
  { id: "s6", title: "TK-2026-0042 (Direct Connect)", category: "Ticket", subtitle: "Urgent SLA • 42 mins remaining", href: "/support" },
  { id: "s7", title: "SRV-NODE-01 (Edge Server)", category: "SKU", subtitle: "Dallas Primary (W-1) • 34 Available", href: "/inventory" },
  { id: "s8", title: "INV-2026-001 ($48,500)", category: "Invoice", subtitle: "Enterprise Cloud Systems • Paid", href: "/finance" },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("Acme Enterprise Global");
  const [notifications, setNotifications] = useState([
    { id: 1, title: "High-Priority SLA Alert", desc: "Ticket #TK-2026-0042 has 42 mins remaining", time: "5m ago", type: "urgent" },
    { id: 2, title: "New Deal Stage Progression", desc: "Enterprise Cloud Node closed at $250,000", time: "18m ago", type: "success" },
    { id: 3, title: "Stock Reorder Warning", desc: "Dallas W-1: NVMe 64T array below threshold (12 left)", time: "1h ago", type: "warning" },
  ]);

  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredSearchResults = searchQuery.trim()
    ? searchableEntities.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchableEntities.slice(0, 5);

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
            <span className="font-semibold text-slate-300">Enterprise Operating System</span>
          </div>
        </div>

        {/* Middle: Command Search Trigger */}
        <div className="flex-1 max-w-sm mx-4 hidden lg:block">
          <button
            onClick={() => {
              setSearchQuery("");
              setIsSearchOpen(true);
            }}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-2 truncate">
              <span className="text-sm group-hover:text-indigo-400">🔍</span>
              <span className="truncate">Search CRM, deals, orders...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 ml-2">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & Copilot */}
        <div className="flex items-center space-x-3">
          {/* AI Copilot Badge Button */}
          <Link
            href="/ai"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/30 hover:border-purple-400/60 text-purple-200 text-xs font-bold transition-all shadow-sm group"
          >
            <span className="text-xs group-hover:scale-125 transition-transform">✨</span>
            <span>AI Copilot</span>
          </Link>

          {/* Notifications Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
            >
              <span className="text-sm">🔔</span>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotifyOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl p-4 space-y-3 z-50 backdrop-blur-2xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-200">Domain Event Feed</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="purple" size="sm">{notifications.length} Unread</Badge>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">
                      Zero unread notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/80 hover:bg-slate-800/70 transition-colors space-y-1 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-bold text-slate-200">{n.title}</span>
                          <button
                            onClick={() => dismissNotification(n.id)}
                            className="text-slate-500 hover:text-rose-400 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{n.desc}</p>
                        <span className="text-[9px] text-slate-500 block">{n.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Quick Create CTA */}
          <Button
            variant="default"
            size="sm"
            className="hidden sm:inline-flex shadow-glow-primary"
            onClick={() => setIsQuickActionOpen(true)}
          >
            + Quick Action
          </Button>
        </div>
      </header>

      {/* Quick Action Modal */}
      {isQuickActionOpen && (
        <Dialog
          open={isQuickActionOpen}
          onClose={() => setIsQuickActionOpen(false)}
          title="Enterprise Quick Action"
          description="Instant shortcuts to provision resources across all CRM & Commerce domains."
        >
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <Link
              href="/customers"
              onClick={() => setIsQuickActionOpen(false)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-200 hover:text-indigo-300 transition-all flex items-center space-x-2.5"
            >
              <span className="text-lg">👥</span>
              <div>
                <div className="font-bold">Register Customer</div>
                <div className="text-[10px] text-slate-400">Add account to 360 directory</div>
              </div>
            </Link>

            <Link
              href="/sales"
              onClick={() => setIsQuickActionOpen(false)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-200 hover:text-indigo-300 transition-all flex items-center space-x-2.5"
            >
              <span className="text-lg">💼</span>
              <div>
                <div className="font-bold">Create Deal</div>
                <div className="text-[10px] text-slate-400">Add opportunity to pipeline</div>
              </div>
            </Link>

            <Link
              href="/commerce"
              onClick={() => setIsQuickActionOpen(false)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-200 hover:text-indigo-300 transition-all flex items-center space-x-2.5"
            >
              <span className="text-lg">🛍️</span>
              <div>
                <div className="font-bold">New Order</div>
                <div className="text-[10px] text-slate-400">Place omnichannel order</div>
              </div>
            </Link>

            <Link
              href="/support"
              onClick={() => setIsQuickActionOpen(false)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-200 hover:text-indigo-300 transition-all flex items-center space-x-2.5"
            >
              <span className="text-lg">🎫</span>
              <div>
                <div className="font-bold">Support Ticket</div>
                <div className="text-[10px] text-slate-400">Open priority SLA ticket</div>
              </div>
            </Link>

            <Link
              href="/finance"
              onClick={() => setIsQuickActionOpen(false)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-200 hover:text-indigo-300 transition-all flex items-center space-x-2.5"
            >
              <span className="text-lg">💳</span>
              <div>
                <div className="font-bold">Commercial Invoice</div>
                <div className="text-[10px] text-slate-400">Issue B2B invoice PDF</div>
              </div>
            </Link>

            <Link
              href="/workflows"
              onClick={() => setIsQuickActionOpen(false)}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 text-slate-200 hover:text-indigo-300 transition-all flex items-center space-x-2.5"
            >
              <span className="text-lg">⚡</span>
              <div>
                <div className="font-bold">Automation Rule</div>
                <div className="text-[10px] text-slate-400">Design event trigger rule</div>
              </div>
            </Link>
          </div>
        </Dialog>
      )}

      {/* Global Search Modal */}
      {isSearchOpen && (
        <Dialog
          open={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          size="md"
          title="Universal Enterprise Search"
          description="Type keywords across Customers, Deals, Invoices, Orders, SKUs, and Knowledge Articles."
        >
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anything (e.g. 'Alex Morgan', 'Edge Node', 'TK-2026', 'INV-2026')..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-indigo-500/50 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Results List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div className="text-[11px] font-bold uppercase text-slate-500">
                {searchQuery.trim() ? `Search Matches (${filteredSearchResults.length})` : "Top Quick Jump Links"}
              </div>

              {filteredSearchResults.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-indigo-950/40 hover:border-indigo-500/50 border border-slate-800 transition-all flex items-center justify-between text-xs group block"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-indigo-300">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.subtitle}</div>
                  </div>
                  <Badge variant="purple" size="sm">{item.category}</Badge>
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-[10px] font-bold uppercase text-slate-500 mb-1.5">Module Shortcuts</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                <Link href="/customers" onClick={() => setIsSearchOpen(false)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-center block">
                  👥 Customers
                </Link>
                <Link href="/sales" onClick={() => setIsSearchOpen(false)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-center block">
                  💼 Deals
                </Link>
                <Link href="/inventory" onClick={() => setIsSearchOpen(false)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-center block">
                  📦 Inventory
                </Link>
                <Link href="/support" onClick={() => setIsSearchOpen(false)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-center block">
                  🎫 Support
                </Link>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
