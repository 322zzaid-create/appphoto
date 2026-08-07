"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatsCard({
  icon,
  value,
  label,
  trend,
  className,
}: StatsCardProps) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl",
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                trend.positive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400",
              )}
            >
              {trend.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="mt-0.5 text-sm text-white/40">{label}</p>
        </div>
      </motion.div>
    );
}
