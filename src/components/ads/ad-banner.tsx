"use client";

import { cn } from "@/lib/utils/cn";

interface AdBannerProps {
  position?: "top" | "bottom" | "sidebar";
  className?: string;
}

export function AdBanner({ position = "bottom", className }: AdBannerProps) {
  const heights: Record<string, string> = {
    top: "h-24",
    bottom: "h-28",
    sidebar: "h-[250px] w-[300px]",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]",
        heights[position],
        className,
      )}
    >
      <div className="text-center">
        <p className="text-xs text-white/20">Advertisement</p>
        <p className="mt-0.5 text-[10px] text-white/10">
          {position === "sidebar" ? "300 x 250" : position === "top" ? "728 x 90" : "728 x 90"}
        </p>
      </div>
    </div>
  );
}
