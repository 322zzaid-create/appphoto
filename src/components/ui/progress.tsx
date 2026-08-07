"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeMap = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, color, size = "md", showLabel = false, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className={cn("w-full", className)} ref={ref} {...props}>
        {showLabel && (
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs text-white/50">Progress</span>
            <span className="text-xs font-medium text-white/70">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          className={cn(
            "w-full overflow-hidden rounded-full bg-white/10",
            sizeMap[size],
          )}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              color ?? "bg-gradient-to-r from-purple-500 to-blue-500",
            )}
          />
        </div>
      </div>
    );
  },
);

Progress.displayName = "Progress";
