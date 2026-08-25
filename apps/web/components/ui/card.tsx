import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "glass" | "gradient" | "interactive";
}

export function Card({
  className = "",
  variant = "bordered",
  children,
  ...props
}: CardProps) {
  const baseStyles = "rounded-2xl transition-all duration-200 text-slate-100";

  const variants = {
    default: "bg-[#111827] border border-slate-800 shadow-xl",
    bordered: "bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800/90 shadow-2xl hover:border-slate-700/80",
    glass: "glass-panel shadow-2xl hover:border-indigo-500/30",
    gradient: "bg-gradient-to-br from-[#131b2e] via-[#0f172a] to-[#0c111d] border border-indigo-500/20 shadow-2xl",
    interactive: "bg-[#111827]/80 backdrop-blur-xl border border-slate-800/80 hover:border-indigo-500/50 hover:shadow-card-dark-hover hover:-translate-y-0.5 cursor-pointer",
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pb-3 flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-base font-bold tracking-tight text-white flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-slate-400 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pt-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 pt-0 border-t border-slate-800/60 mt-4 flex items-center justify-between text-xs text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
