"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const value = i + 1;
        const filled = interactive
          ? value <= (hoverRating || rating)
          : value <= Math.round(rating);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(value)}
            onMouseEnter={() => interactive && setHoverRating(value)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn(
              "transition-colors",
              interactive && "cursor-pointer hover:scale-110",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-none text-white/20"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
