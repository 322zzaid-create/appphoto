"use client";

import { useEffect, useRef } from "react";
import { MULTITAG_SCRIPT } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";

interface MultitagAdProps {
  className?: string;
}

export function MultitagAd({ className }: MultitagAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.dataset.adInjected === "true") return;

    container.dataset.adInjected = "true";
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = MULTITAG_SCRIPT;
    container.appendChild(script);
  }, []);

  return (
    <div className={cn("flex w-full items-start justify-center", className)}>
      <div
        ref={containerRef}
        className="flex min-h-[250px] min-w-[250px] items-center justify-center"
      />
    </div>
  );
}
