import * as React from "react";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  variant?: "default" | "success" | "warning" | "danger" | "gradient";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

const progressVariants = {
  default: "bg-indigo-600",
  success: "bg-emerald-600",
  warning: "bg-amber-500",
  danger: "bg-rose-600",
  gradient: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
};

const progressSizes = {
  sm: "h-1.5",
  default: "h-2.5",
  lg: "h-4",
};

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "default",
  showLabel = false,
  className = "",
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 ${progressSizes[size]} ${className}`}
        {...props}
      >
        <div
          className={`h-full transition-all duration-300 ease-out rounded-full ${progressVariants[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
