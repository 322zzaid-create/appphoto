"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  onLike?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onDownload?: (id: string) => void;
  likedIds?: string[];
  className?: string;
}

export function WallpaperGrid({
  wallpapers,
  loading = false,
  onLoadMore,
  hasMore = false,
  onLike,
  onFavorite,
  onDownload,
  likedIds = [],
  className,
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
          "grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
          className,
        )}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <AnimatePresence mode="popLayout">
          {wallpapers.map((wp, i) => (
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
                isLiked={likedIds.includes(wp.id)}
                onLike={onLike ? () => onLike(wp.id) : undefined}
                onFavorite={onFavorite ? () => onFavorite(wp.id) : undefined}
                onDownload={onDownload ? () => onDownload(wp.id) : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {loading && wallpapers.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      )}

      {hasMore && <div ref={loadMoreRef} className="h-4" />}
    </div>
  );
}
