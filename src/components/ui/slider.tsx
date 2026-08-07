"use client";

import { forwardRef, useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      min = 0,
      max = 100,
      step = 1,
      value = 50,
      onChange,
      showValue = false,
      label,
      minLabel,
      maxLabel,
      ...props
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(Number(e.target.value));
      },
      [onChange],
    );

    return (
      <div className={cn("w-full", className)}>
        {label && (
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-white/80">{label}</label>
            {showValue && (
              <span className="text-sm text-white/50">{value}</span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className="slider-input h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #3b82f6 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`,
            }}
            {...props}
          />
        </div>
        {(minLabel || maxLabel) && (
          <div className="mt-1 flex items-center justify-between">
            {minLabel && <span className="text-[10px] text-white/30">{minLabel}</span>}
            {maxLabel && <span className="text-[10px] text-white/30">{maxLabel}</span>}
          </div>
        )}
      </div>
    );
  },
);

Slider.displayName = "Slider";
