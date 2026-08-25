import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "success"
    | "glow";
  size?: "xs" | "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className = "",
  variant = "default",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

  const sizeStyles = {
    xs: "px-2.5 py-1 text-[11px]",
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-2.5 text-sm",
  };

  const variantStyles = {
    default:
      "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 border border-indigo-500/30",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-slate-600",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-200 border border-slate-700 hover:border-slate-500",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white",
    destructive:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 border border-rose-500/30",
    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 border border-emerald-500/30",
    glow:
      "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/40 border border-purple-400/40",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="animate-spin h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
