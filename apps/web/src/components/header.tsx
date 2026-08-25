"use client";

import React from "react";
import { ShieldCheck, Activity, Layers } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              CommerceCRM
              <span className="text-xs bg-indigo-500/20 text-indigo-400 font-medium px-2 py-0.5 rounded-full border border-indigo-500/30">
                Enterprise v0.1.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-3 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
            System Operational
          </div>
        </div>
      </div>
    </header>
  );
}
