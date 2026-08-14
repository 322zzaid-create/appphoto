"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { WallpaperCard } from "./wallpaper-card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Wallpaper {
  id: string;
  title: string;
  thumbnailUrl: string;
  imageUrl: string;
  artist?: string;
  dominantColor?: string;
  isPremium?: boolean;
  isLive?: boolean;
  likes?: number;
  downloads?: number;
  avgRating?: number;
  ratingCount?: number;
  width: number;
  height: number;
}

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onFavorite?: (id: string) => void;
  favoriteIds?: string[];
  className?: string;
  ad?: ReactNode;
  adIndex?: number;
}

export function WallpaperGrid({
  wallpapers,
  loading = false,
  onLoadMore,
  hasMore = false,
  onFavorite,
  favoriteIds = [],
  className,
  ad,
  adIndex = 8,
}: WallpaperGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, onLoadMore]);

  if (loading && wallpapers.length === 0) {
    return (
      <div
        className={cn(
          "columns-2 gap-2.5 sm:gap-4 md:columns-3 lg:columns-4 xl:columns-5",
          "[&>*]:mb-2.5 [&>*]:break-inside-avoid sm:[&>*]:mb-4",
          className,
        )}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  const renderCards = (from: number, to: number) => (
    <AnimatePresence mode="popLayout">
      {wallpapers.slice(from, to).map((wp, i) => (
        <motion.div
          key={wp.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, delay: i < 10 ? i * 0.03 : 0 }}
          layout
        >
          <WallpaperCard
            wallpaper={wp}
            isFavorited={favoriteIds.includes(wp.id)}
            onFavorite={onFavorite ? () => onFavorite(wp.id) : undefined}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );

  return (
    <div className={cn("space-y-6", className)}>
      <div className="columns-2 gap-2.5 sm:gap-4 md:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-2.5 [&>*]:break-inside-avoid sm:[&>*]:mb-4">
        {renderCards(0, Math.min(adIndex, wallpapers.length))}
        {ad && wallpapers.length > 0 && <div className="break-inside-avoid">{ad}</div>}
        {renderCards(Math.min(adIndex, wallpapers.length), wallpapers.length)}
      </div>

      {loading && wallpapers.length > 0 && (
        <div className="columns-2 gap-2.5 sm:gap-4 md:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-2.5 [&>*]:break-inside-avoid sm:[&>*]:mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="h-4" />}
    </div>
  );
}
