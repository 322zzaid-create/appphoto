"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Search, AlertCircle } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  search?: boolean;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, search, icon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <div className="relative">
          {(search || icon) && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {search ? <Search className="h-4 w-4" /> : icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "flex h-10 w-full rounded-xl border bg-white/5 px-3 py-2 text-sm text-white",
              "placeholder:text-white/30",
              "backdrop-blur-xl transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              search && "pl-10",
              error
                ? "border-red-500/50 focus:ring-red-500/50"
                : "border-white/10 hover:border-white/20",
              className,
            )}
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
