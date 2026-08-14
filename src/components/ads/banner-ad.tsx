"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface BannerAdProps {
  adKey: string;
  width?: number;
  height?: number;
  onShown?: () => void;
  className?: string;
}

interface AtOptions {
  key: string;
  format: "iframe";
  height: number;
  width: number;
  params: Record<string, unknown>;
}

function isAdIframe(frame: HTMLIFrameElement, origin: string): boolean {
  const src = frame.getAttribute("src") || "";
  if (!src) return false;
  if (src.startsWith("about:") || src.startsWith("blob:") || src.startsWith("data:")) {
    return false;
  }
  if (src.startsWith(origin)) return false;
  return true;
}

/**
 * Renders a 300x250 iframe banner ad (highperformanceformat). The network's
 * invoke.js reads the global `atOptions`, injects an iframe and appends it to
 * the document (frequently straight into `body`, outside this container), so
 * the component watches for the iframe, captures it into the container and
 * reports `onShown` only when the ad really rendered.
 */
export function BannerAd({
  adKey,
  width = 300,
  height = 250,
  onShown,
  className,
}: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onShownRef = useRef(onShown);

  useEffect(() => {
    onShownRef.current = onShown;
  }, [onShown]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const origin = window.location.origin;
    let shown = false;
    let observer: MutationObserver | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    const capture = (frame: HTMLIFrameElement) => {
      if (shown) return;
      shown = true;
      if (frame.parentElement !== container) {
        try {
          container.appendChild(frame);
        } catch {
          /* ignore */
        }
      }
      onShownRef.current?.();
    };

    const findAdFrame = () => {
      const frames = Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe"));
      for (const frame of frames) {
        if (isAdIframe(frame, origin)) {
          capture(frame);
          return;
        }
      }
    };

    const win = window as unknown as { atOptions?: AtOptions };
    win.atOptions = {
      key: adKey,
      format: "iframe",
      height,
      width,
      params: {},
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
    container.appendChild(script);

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const frames: HTMLIFrameElement[] = node.matches("iframe")
            ? [node as HTMLIFrameElement]
            : Array.from(node.querySelectorAll<HTMLIFrameElement>("iframe"));
          for (const frame of frames) {
            if (isAdIframe(frame, origin)) {
              capture(frame);
              return;
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback scan in case the iframe's src is set asynchronously after it is
    // inserted into the DOM.
    timer = setInterval(findAdFrame, 500);

    return () => {
      shown = true;
      if (timer) clearInterval(timer);
      observer?.disconnect();
      script.remove();
    };
  }, [adKey, height, width]);

  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      <div
        ref={containerRef}
        className="flex h-[250px] w-[300px] items-center justify-center overflow-hidden rounded-xl bg-black/20"
      />
    </div>
  );
}
