"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  glow?: boolean;
  glowColor?: string;
  variant?: "default" | "glass" | "wallpaper";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      hover = false,
      glow = false,
      glowColor = "purple",
      variant = "default",
      children,
      ...props
    },
    ref,
  ) => {
    const base = cn(
      "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl",
      variant === "glass" && "bg-white/[0.03] border-white/[0.08]",
      variant === "wallpaper" && "overflow-hidden border-white/[0.06]",
      className,
    );

    const glowMap: Record<string, string> = {
      purple: "hover:shadow-purple-500/20",
      blue: "hover:shadow-blue-500/20",
      pink: "hover:shadow-pink-500/20",
      green: "hover:shadow-green-500/20",
    };

    if (hover || glow) {
      return (
        <motion.div
          ref={ref}
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={cn(
            base,
            "transition-shadow duration-300",
            glow && glowMap[glowColor],
            glow && "hover:shadow-2xl",
          )}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={base} {...(props as React.ComponentPropsWithoutRef<"div">)}>
        {children as React.ReactNode}
      </div>
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pb-2", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 flex items-center", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
