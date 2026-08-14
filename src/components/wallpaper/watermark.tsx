"use client";

import { cn } from "@/lib/utils/cn";

interface WatermarkProps {
  className?: string;
}

const ROWS = 9;
const COLS = 5;

export function Watermark({ className }: WatermarkProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      <div className="absolute -inset-[15%] flex flex-col justify-between -rotate-[25deg]">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex items-center justify-between">
            {Array.from({ length: COLS }).map((_, col) => (
              <span
                key={col}
                translate="no"
                className="notranslate whitespace-nowrap text-xl font-black uppercase leading-none text-blue-500 sm:text-3xl md:text-4xl"
              >
                free
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
