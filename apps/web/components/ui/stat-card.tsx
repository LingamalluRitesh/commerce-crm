import * as React from "react";
import { Card } from "./card";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  variant?: "default" | "elevated" | "bordered" | "gradient";
}

export function StatCard({
  title,
  value,
  change,
  icon,
  description,
  variant = "default",
}: StatCardProps) {
  return (
    <Card variant={variant} className="p-6 transition-all hover:scale-[1.01]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </div>
        {change && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={`inline-flex items-center font-semibold ${
                change.trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : change.trend === "down"
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {change.trend === "up" && (
                <svg
                  className="mr-1 h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                  />
                </svg>
              )}
              {change.trend === "down" && (
                <svg
                  className="mr-1 h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"
                  />
                </svg>
              )}
              {change.value}
            </span>
            {change.label && (
              <span className="ml-1.5 text-slate-400 dark:text-slate-500">
                {change.label}
              </span>
            )}
          </div>
        )}
        {description && !change && (
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
}
