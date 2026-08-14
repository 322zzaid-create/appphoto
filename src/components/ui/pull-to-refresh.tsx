"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

const MAX_PULL = 110;
const DAMPING = 0.5;

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 70,
  disabled = false,
}: PullToRefreshProps) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const setPull = useCallback((value: number) => {
    const next = Math.max(0, Math.min(value, MAX_PULL));
    distanceRef.current = next;
    setDistance(next);
  }, []);

  const atTop = useCallback(() => {
    const el = document.scrollingElement || document.documentElement;
    return (el.scrollTop || document.body.scrollTop || 0) <= 0;
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    setPull(threshold);
    try {
      await onRefreshRef.current();
    } catch {
      // Keep current content if the refresh fails (offline, etc.)
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
      setPull(0);
    }
  }, [setPull, threshold]);

  const finishPull = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    if (refreshingRef.current) return;
    if (distanceRef.current >= threshold) {
      void triggerRefresh();
    } else {
      setPull(0);
    }
  }, [setPull, threshold, triggerRefresh]);

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshingRef.current) return;
      if (!atTop()) return;
      draggingRef.current = true;
      startYRef.current = e.touches[0].clientY;
      setIsDragging(true);
      setPull(0);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || refreshingRef.current) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) {
        setPull(0);
        return;
      }
      if (!atTop()) {
        draggingRef.current = false;
        setIsDragging(false);
        setPull(0);
        return;
      }
      setPull(delta * DAMPING);
      if (distanceRef.current > 2) {
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      finishPull();
    };

    document.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    const onScroll = () => {
      if (draggingRef.current && !atTop()) {
        draggingRef.current = false;
        setIsDragging(false);
        setPull(0);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
    };
  }, [disabled, atTop, setPull, finishPull]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (disabled || refreshingRef.current) return;
    if (!atTop()) return;
    draggingRef.current = true;
    startYRef.current = e.clientY;
    setIsDragging(true);
    setPull(0);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !draggingRef.current) return;
    if (refreshingRef.current) return;
    const delta = e.clientY - startYRef.current;
    if (delta <= 0 || !atTop()) {
      draggingRef.current = false;
      setIsDragging(false);
      setPull(0);
      return;
    }
    setPull(delta * DAMPING);
  };

  const handlePointerUp = () => {
    finishPull();
  };

  const indicatorVisible = distance > 0 || refreshing;

  return (
    <div
      className={cn("relative", className, isDragging && "select-none")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-50 flex justify-center"
        style={{
          transform: `translateY(${Math.max(0, distance - 52)}px)`,
          opacity: indicatorVisible ? Math.min(1, distance / 52) : 0,
          visibility: indicatorVisible ? "visible" : "hidden",
        }}
        aria-hidden={!indicatorVisible}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-soft backdrop-blur-md",
            !refreshing && distance >= threshold && "border-purple-400/40",
          )}
        >
          <RefreshCw
            className={cn("h-5 w-5 text-purple-400", refreshing && "animate-spin")}
            style={
              refreshing
                ? undefined
                : {
                    transform: `rotate(${distance * 4}deg) scale(${Math.min(1, 0.5 + distance / 70)})`,
                  }
            }
          />
        </div>
      </div>

      <div
        className="will-change-transform"
        style={{
          transform: `translateY(${distance}px)`,
          transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
