import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "success"
    | "warning"
    | "destructive"
    | "purple"
    | "cyan";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "default",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-bold tracking-wide rounded-full transition-colors select-none";

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3.5 py-1 text-xs",
  };

  const variantStyles = {
    default:
      "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30",
    secondary:
      "bg-slate-800 text-slate-300 border border-slate-700/80",
    outline:
      "border border-slate-700 text-slate-300 bg-transparent",
    success:
      "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    warning:
      "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    destructive:
      "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    purple:
      "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    cyan:
      "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
  };

  const dotColors = {
    default: "bg-indigo-400",
    secondary: "bg-slate-400",
    outline: "bg-slate-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    destructive: "bg-rose-400",
    purple: "bg-purple-400",
    cyan: "bg-cyan-400",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${dotColors[variant]}`}
        />
      )}
      {children}
    </span>
  );
}
