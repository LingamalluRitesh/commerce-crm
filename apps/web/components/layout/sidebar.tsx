"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  section?: string;
}

export const navigationItems: NavItem[] = [
  { name: "Executive Dashboard", href: "/dashboard", icon: "📊", section: "Main" },
  { name: "Customer 360", href: "/customers", icon: "👥", section: "CRM & Sales" },
  { name: "Sales Pipeline", href: "/sales", icon: "💼", section: "CRM & Sales" },
  { name: "Quotes & Contracts", href: "/sales/quotes", icon: "📝", section: "CRM & Sales" },
  { name: "Commerce & Orders", href: "/commerce", icon: "🛒", section: "Commerce & Operations" },
  { name: "Inventory & Warehouses", href: "/inventory", icon: "📦", section: "Commerce & Operations" },
  { name: "Marketing Campaigns", href: "/marketing", icon: "📣", section: "Growth & Retention" },
  { name: "Support & CSAT", href: "/support", icon: "🎧", badge: "3", section: "Growth & Retention" },
  { name: "Customer Success", href: "/support/success-plans", icon: "🎯", section: "Growth & Retention" },
  { name: "Finance & Invoices", href: "/finance", icon: "💳", section: "Finance & Projects" },
  { name: "Projects & Time Tracking", href: "/finance/projects", icon: "⏱️", section: "Finance & Projects" },
  { name: "Workflow Studio", href: "/workflows", icon: "⚡", section: "Automation & Intelligence" },
  { name: "Unified Chat & Channels", href: "/communication", icon: "💬", section: "Automation & Intelligence" },
  { name: "AI Copilot & Vectors", href: "/ai", icon: "✨", badge: "AI", section: "Automation & Intelligence" },
  { name: "Analytics & BI", href: "/analytics", icon: "📈", section: "Intelligence" },
  { name: "Developer API & Webhooks", href: "/developer", icon: "💻", section: "Platform" },
  { name: "Enterprise Settings", href: "/settings", icon: "⚙️", section: "Platform" },
];

export function Sidebar() {
  const pathname = usePathname();

  // Group items by section
  const sections = Array.from(new Set(navigationItems.map((i) => i.section || "Main")));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md">
            <span className="text-lg font-black text-white">C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Commerce<span className="text-indigo-600">CRM</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Enterprise OS
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section}
            </p>
            <div className="space-y-0.5 mt-1.5">
              {navigationItems
                .filter((item) => item.section === section)
                .map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base leading-none">{item.icon}</span>
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.badge === "AI"
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                              : "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Tenant & Version Status */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Cluster</span>
          </span>
          <span className="font-mono text-[10px]">v2.4.0-ent</span>
        </div>
      </div>
    </aside>
  );
}
