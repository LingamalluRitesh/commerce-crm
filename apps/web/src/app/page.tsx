"use client";

import React from "react";
import { Header } from "../components/header";
import { SystemStatus } from "../components/system-status";
import {
  Users,
  Briefcase,
  ShoppingCart,
  Boxes,
  Mail,
  LifeBuoy,
  Award,
  CircleDollarSign,
  Workflow,
  Sparkles,
  ShieldCheck,
  TerminalSquare,
  ArrowRight,
  GitBranch,
} from "lucide-react";

const MODULES = [
  {
    name: "Identity & Multi-Tenancy",
    description: "Organizations, Workspaces, Teams, RBAC & Row-Level Isolation",
    icon: ShieldCheck,
    phase: "Phase 2",
    badge: "Foundation Ready",
  },
  {
    name: "Customer 360",
    description: "Unified accounts, contacts, timeline interactions & dynamic health scoring",
    icon: Users,
    phase: "Phase 3",
    badge: "Planned",
  },
  {
    name: "Sales Pipeline & CRM",
    description: "Leads, qualification scoring, deal stages, quotes & proposals",
    icon: Briefcase,
    phase: "Phase 4",
    badge: "Planned",
  },
  {
    name: "Commerce & Orders",
    description: "Catalogs, variants, carts, checkouts, payments & return state machines",
    icon: ShoppingCart,
    phase: "Phase 5",
    badge: "Planned",
  },
  {
    name: "Inventory & Fulfillment",
    description: "Multi-warehouse stock reservations, POs, picking & shipping tracking",
    icon: Boxes,
    phase: "Phase 6",
    badge: "Planned",
  },
  {
    name: "Marketing Automation",
    description: "Campaigns, dynamic segments, email/SMS dispatch & A/B conversion tests",
    icon: Mail,
    phase: "Phase 7",
    badge: "Planned",
  },
  {
    name: "Support & Customer Success",
    description: "Ticketing, SLAs, knowledge bases, success milestones & churn prevention",
    icon: LifeBuoy,
    phase: "Phase 8",
    badge: "Planned",
  },
  {
    name: "Finance & Projects",
    description: "Invoicing, subscription billing, customer projects & time tracking",
    icon: CircleDollarSign,
    phase: "Phase 9",
    badge: "Planned",
  },
  {
    name: "Workflow Engine",
    description: "Idempotent event triggers, branching logic, delays & execution audit logs",
    icon: Workflow,
    phase: "Phase 10",
    badge: "Planned",
  },
  {
    name: "AI / ML Platform",
    description: "Semantic search with pgvector, RAG, deal risk detection & smart summaries",
    icon: Sparkles,
    phase: "Phase 13",
    badge: "Planned",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <GitBranch className="h-3.5 w-3.5" />
            Phase 1 Foundation Operational
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Unified Customer & Commerce Operating System
          </h1>
          <p className="text-base text-slate-400 max-w-3xl leading-relaxed">
            CommerceCRM breaks down enterprise silos by uniting customer relationships, sales pipelines,
            e-commerce order flows, inventory fulfillment, automated workflows, and AI intelligence
            into a single modular monolith architecture.
          </p>
        </div>

        {/* Live System Diagnostics */}
        <SystemStatus />

        {/* Domain Modules Matrix */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Domain Modules & Architecture Roadmap</h3>
            <p className="text-sm text-slate-400">
              Each module follows strict 4-layer separation: API, Application, Domain, and Infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <div
                  key={module.name}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-600/20 transition">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {module.phase}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition">
                        {module.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{module.badge}</span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition flex items-center gap-1">
                      Details <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        CommerceCRM Enterprise Operating System • MIT Licensed • Built with FastAPI, SQLAlchemy 2 & Next.js
      </footer>
    </div>
  );
}
