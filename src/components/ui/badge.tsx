import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

const colorMap = {
  default: "bg-white/10 text-white/70 border-white/10",
  purple: "bg-purple-500/20 text-purple-300 border-purple-500/20",
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  green: "bg-green-500/20 text-green-300 border-green-500/20",
  red: "bg-red-500/20 text-red-300 border-red-500/20",
  yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/20",
  pink: "bg-pink-500/20 text-pink-300 border-pink-500/20",
  cyan: "bg-cyan-500/20 text-cyan-300 border-cyan-500/20",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: keyof typeof colorMap;
  outline?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, color = "default", outline = false, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
          outline
            ? `border-current bg-transparent ${colorMap[color].split(" ").slice(2).join(" ")}`
            : colorMap[color],
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
