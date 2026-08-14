import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const skeletonBase =
  "animate-pulse rounded-xl bg-gradient-to-r from-white/[0.06] via-white/[0.12] to-white/[0.06]";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "image" | "list";
  lines?: number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "text", lines = 1, ...props }, ref) => {
    if (variant === "circular") {
      return (
        <div ref={ref} className={cn(skeletonBase, "aspect-square rounded-full", className)} {...props} />
      );
    }

    if (variant === "card") {
      return (
        <div ref={ref} className={cn("space-y-3", className)} {...props}>
          <div className={cn(skeletonBase, "aspect-[4/3] w-full")} />
          <div className="space-y-2">
            <div className={cn(skeletonBase, "h-4 w-3/4")} />
            <div className={cn(skeletonBase, "h-3 w-1/2")} />
          </div>
        </div>
      );
    }

    if (variant === "image") {
      return (
        <div ref={ref} className={cn(skeletonBase, "aspect-video w-full", className)} {...props} />
      );
    }

    if (variant === "list") {
      return (
        <div ref={ref} className={cn("space-y-4", className)} {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn(skeletonBase, "h-10 w-10 shrink-0 rounded-full")} />
              <div className="flex-1 space-y-2">
                <div className={cn(skeletonBase, "h-3.5 w-3/4")} />
                <div className={cn(skeletonBase, "h-2.5 w-1/2")} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              skeletonBase,
              "h-3.5",
              i === lines - 1 ? "w-3/5" : "w-full",
            )}
          />
        ))}
      </div>
    );
  },
);

Skeleton.displayName = "Skeleton";
