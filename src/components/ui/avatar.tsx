"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: keyof typeof sizeMap;
  online?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "from-purple-500 to-blue-500",
    "from-pink-500 to-rose-500",
    "from-cyan-500 to-blue-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-violet-500 to-purple-500",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = "", name = "U", size = "md", online, ...props }, ref) => {
    const [imgError, setImgError] = useState(false);
    const showImage = src && !imgError;

    return (
      <div ref={ref} className={cn("relative inline-flex shrink-0", className)} {...props}>
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            className={cn(
              "rounded-full object-cover ring-2 ring-white/10",
              sizeMap[size],
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white ring-2 ring-white/10",
              sizeMap[size],
              hashColor(name),
            )}
          >
            {getInitials(name)}
          </div>
        )}
        {online !== undefined && (
          <span
            className={cn(
              "absolute bottom-0 right-0 rounded-full border-2 border-[#0a0a0f]",
              online ? "bg-green-500" : "bg-white/30",
              size === "xs" || size === "sm" ? "h-2 w-2" : "h-3 w-3",
            )}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
