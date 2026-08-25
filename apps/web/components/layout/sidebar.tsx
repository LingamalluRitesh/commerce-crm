"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

const navigationGroups: NavSection[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "📊", badge: "Live" },
      { label: "Analytics & BI", href: "/analytics", icon: "📈" },
    ],
  },
  {
    group: "Customer & Sales",
    items: [
      { label: "Customer 360", href: "/customers", icon: "👥", badge: "500+" },
      { label: "Sales Pipeline", href: "/sales", icon: "💼" },
      { label: "Commerce & Orders", href: "/commerce", icon: "🛍️", badge: "New" },
      { label: "Inventory & Warehouses", href: "/inventory", icon: "📦" },
    ],
  },
  {
    group: "Operations & Success",
    items: [
      { label: "Support & SLAs", href: "/support", icon: "🎫", badge: "2 Urgent", badgeColor: "bg-rose-500/20 text-rose-400 border border-rose-500/30" },
      { label: "Finance & Invoicing", href: "/finance", icon: "💳" },
      { label: "Marketing Campaigns", href: "/marketing", icon: "📣" },
      { label: "Unified Communication", href: "/communication", icon: "💬" },
    ],
  },
  {
    group: "Intelligence & Automations",
    items: [
      { label: "Workflow Studio", href: "/workflows", icon: "⚡" },
      { label: "AI Intelligence Lab", href: "/ai", icon: "✨", badge: "v2.4", badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/30" },
    ],
  },
  {
    group: "Administration",
    items: [
      { label: "Developer & Webhooks", href: "/developer", icon: "🔌" },
      { label: "Settings & Security", href: "/settings", icon: "⚙️" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-[#0c111d]/90 backdrop-blur-2xl flex flex-col justify-between shadow-2xl transition-all duration-300">
      {/* Top Branding Section */}
      <div className="p-5 border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-black text-lg tracking-wider">C</span>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Commerce<span className="text-indigo-400 font-black">CRM</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Enterprise OS
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Nav Link Groups */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        {navigationGroups.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-2">
              {section.group}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-transparent text-white border border-indigo-500/30 shadow-sm shadow-indigo-500/10"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm transition-transform group-hover:scale-110 duration-150">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.badgeColor ||
                        (isActive
                          ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                          : "bg-slate-800 text-slate-400")
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-500 shadow-glow-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile & Organization Card */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                SC
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0c111d]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 truncate">Sarah Connor</div>
              <div className="text-[10px] text-indigo-400 font-medium truncate">Acme Global • Admin</div>
            </div>
          </div>
          <button
            title="Settings"
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs">⚡</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
