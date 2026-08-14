"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Star, Play, Heart } from "lucide-react";
import Link from "next/link";
import type { Wallpaper } from "./wallpaper-grid";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onFavorite?: () => void;
  isFavorited?: boolean;
  className?: string;
}

export function WallpaperCard({
  wallpaper,
  onFavorite,
  isFavorited = false,
  className,
}: WallpaperCardProps) {
  const [loaded, setLoaded] = useState(false);

  const aspectRatio = `${wallpaper.width || 1080}/${wallpaper.height || 1920}`;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.();
  };

  const actionBtn = cn(
    "rounded-full p-1.5 backdrop-blur-md transition-colors",
    "bg-black/35 text-white/85 hover:bg-black/50 hover:text-white",
    "active:scale-90",
  );

  return (
    <Link href={`/wallpaper/${wallpaper.id}`} className="block h-full">
      <motion.div
        whileHover="hover"
        className={cn(
          "group relative h-full cursor-pointer overflow-hidden rounded-2xl",
          "shadow-soft ring-1 ring-white/[0.06]",
          className,
        )}
      >
        <div
          className="relative w-full overflow-hidden rounded-2xl bg-white/5"
          style={{ aspectRatio }}
        >
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]" />
          )}
          <img
            src={wallpaper.thumbnailUrl}
            alt={wallpaper.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-transform duration-500",
              loaded ? "opacity-100" : "opacity-0",
              "group-hover:scale-105",
            )}
          />

          {wallpaper.dominantColor && (
            <div
              className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-20"
              style={{
                boxShadow: `inset 0 0 40px ${wallpaper.dominantColor}`,
              }}
            />
          )}

          {/* Top row: badges + favorite (always visible, mobile friendly) */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-1 p-2">
            <div className="flex flex-wrap gap-1">
              {wallpaper.isPremium && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/95 px-2 py-0.5 text-[10px] font-bold text-black shadow-sm">
                  <Star className="h-2.5 w-2.5" fill="currentColor" />
                  PRO
                </span>
              )}
              {wallpaper.isLive && (
                <span className="flex items-center gap-1 rounded-full bg-purple-500/95 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  <Play className="h-2.5 w-2.5" fill="currentColor" />
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={handleFavorite}
              aria-label="Favorite"
              className={cn(
                actionBtn,
                isFavorited && "bg-purple-500/70 text-white",
              )}
            >
              <Star
                className="h-3.5 w-3.5"
                fill={isFavorited ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Bottom overlay: title + meta */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-8">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-white">
                {wallpaper.title}
              </h3>
              {wallpaper.artist && (
                <p className="mt-0.5 truncate text-xs text-white/60">
                  by {wallpaper.artist}
                </p>
              )}
              {(wallpaper.likes !== undefined ||
                wallpaper.downloads !== undefined ||
                wallpaper.avgRating !== undefined) && (
                <div className="mt-1 flex items-center gap-2 text-[10px] text-white/55">
                  {wallpaper.avgRating !== undefined && wallpaper.avgRating > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      {wallpaper.avgRating.toFixed(1)}
                    </span>
                  )}
                  {wallpaper.likes !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" />
                      {wallpaper.likes.toLocaleString()}
                    </span>
                  )}
                  {wallpaper.downloads !== undefined && (
                    <span>{wallpaper.downloads.toLocaleString()} dl</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
