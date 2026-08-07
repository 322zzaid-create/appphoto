"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Check } from "lucide-react";

export interface ColorOption {
  color: string;
  label?: string;
}

export interface ColorPickerProps {
  colors: ColorOption[];
  value?: string;
  onChange?: (color: string) => void;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

export const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ colors, value, onChange, size = "md", label, className }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)}>
        {label && (
          <label className="mb-2 block text-sm font-medium text-white/80">
            {label}
          </label>
        )}
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.color}
              title={c.label}
              onClick={() => onChange?.(c.color)}
              className={cn(
                "relative rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/30",
                sizeMap[size],
                value === c.color && "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0f]",
              )}
              style={{ backgroundColor: c.color }}
            >
              {value === c.color && (
                <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
