"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { track: "h-5 w-9", thumb: "h-3.5 w-3.5", translate: "translate-x-4" },
  md: { track: "h-6 w-11", thumb: "h-4 w-4", translate: "translate-x-5" },
  lg: { track: "h-7 w-14", thumb: "h-5 w-5", translate: "translate-x-7" },
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked = false, onChange, disabled = false, label, size = "md", className }, ref) => {
    const s = sizeMap[size];

    return (
      <label
        className={cn(
          "inline-flex items-center gap-3",
          disabled && "pointer-events-none opacity-50",
          className,
        )}
      >
        <button
          ref={ref}
          role="switch"
          type="button"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange?.(!checked)}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200",
            s.track,
            checked ? "bg-purple-600" : "bg-white/15",
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "pointer-events-none inline-block rounded-full bg-white shadow-lg",
              s.thumb,
              checked ? s.translate : "translate-x-1",
            )}
          />
        </button>
        {label && <span className="text-sm text-white/80">{label}</span>}
      </label>
    );
  },
);

Toggle.displayName = "Toggle";
