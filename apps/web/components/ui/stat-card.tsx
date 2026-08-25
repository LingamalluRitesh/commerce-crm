import React from "react";
import { Card } from "./card";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: string;
  description?: string;
  color?: "indigo" | "emerald" | "violet" | "amber" | "rose" | "cyan";
}

export function StatCard({
  title,
  value,
  change,
  isPositive = true,
  icon,
  description,
  color = "indigo",
}: StatCardProps) {
  const colorAccents = {
    indigo: "from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/20",
    emerald: "from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
    violet: "from-purple-500/10 to-purple-600/5 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20",
    rose: "from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/20",
    cyan: "from-cyan-500/10 to-cyan-600/5 text-cyan-400 border-cyan-500/20",
  };

  const iconBgs = {
    indigo: "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    emerald: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    violet: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    amber: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    rose: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    cyan: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  };

  return (
    <Card
      variant="bordered"
      className={`relative overflow-hidden p-5 bg-gradient-to-br ${colorAccents[color]} border hover:border-slate-700/80 transition-all duration-200 group`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1 min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-2xl font-black text-white tracking-tight pt-0.5">
            {value}
          </div>
        </div>

        {icon && (
          <div
            className={`w-10 h-10 rounded-xl ${iconBgs[color]} flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        {change && (
          <div className="flex items-center space-x-1.5 font-bold">
            <span
              className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold ${
                isPositive
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {isPositive ? "↑" : "↓"} {change}
            </span>
            <span className="text-slate-400 text-[11px] font-medium">vs last period</span>
          </div>
        )}

        {description && (
          <span className="text-[11px] text-slate-400 truncate">{description}</span>
        )}
      </div>
    </Card>
  );
}
