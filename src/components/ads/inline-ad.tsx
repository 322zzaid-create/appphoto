"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

const AD_KEY = "f82a8ba4719c3a9547cf60eabffe9d1f";
const SCRIPT_SRC = `https://pl30810035.effectivecpmnetwork.com/${AD_KEY}/invoke.js`;
const CONTAINER_ID = `container-${AD_KEY}`;

interface InlineAdProps {
  className?: string;
  boxClassName?: string;
}

/**
 * effectivecpmnetwork banner. Renders the network's container div inside a
 * card-styled box so it blends with the surrounding layout (image grids, lists
 * or section breaks). The invoke.js script is (re)injected each time the box
 * mounts so it refills the container after client-side page changes.
 */
export function InlineAd({ className, boxClassName }: InlineAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = SCRIPT_SRC;
    container.parentElement?.insertBefore(script, container);

    return () => {
      script.remove();
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]",
        className,
      )}
    >
      <div
        ref={containerRef}
        id={CONTAINER_ID}
        className={cn("relative flex w-full items-center justify-center", boxClassName)}
      />
    </div>
  );
}
