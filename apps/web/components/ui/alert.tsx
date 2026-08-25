import * as React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "destructive";
  title?: React.ReactNode;
  icon?: React.ReactNode;
}

const alertVariants = {
  info: "bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800",
  success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
  warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  destructive: "bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-rose-200 dark:border-rose-800",
};

export function Alert({
  className = "",
  variant = "info",
  title,
  icon,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-xl border p-4 shadow-sm flex items-start space-x-3 ${alertVariants[variant]} ${className}`}
      {...props}
    >
      {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1">
        {title && (
          <h5 className="mb-1 font-semibold text-sm leading-none tracking-tight">
            {title}
          </h5>
        )}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
