"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Heart, Download, Star, Play } from "lucide-react";
import Link from "next/link";
import { DownloadModal } from "./download-modal";
import type { Wallpaper } from "./wallpaper-grid";

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  onLike?: () => void;
  onFavorite?: () => void;
  onDownload?: () => void;
  isLiked?: boolean;
  className?: string;
}

export function WallpaperCard({
  wallpaper,
  onLike,
  onFavorite,
  onDownload,
  isLiked = false,
  className,
}: WallpaperCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const aspectRatio = wallpaper.height / wallpaper.width;
  const paddingPercent = (aspectRatio - 1) * 100;

  const handleLike = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onLike?.();
    },
    [onLike],
  );

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setFavorited(!favorited);
      onFavorite?.();
    },
    [favorited, onFavorite],
  );

  const handleDownload = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDownload(true);
      onDownload?.();
    },
    [onDownload],
  );

  const actionBtn = cn(
    "rounded-full p-1.5 backdrop-blur-md transition-colors",
    "bg-black/35 text-white/85 hover:bg-black/50 hover:text-white",
    "active:scale-90",
  );

  return (
    <>
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
            style={{ paddingBottom: `${Math.max(60, Math.min(200, paddingPercent + 100))}%` }}
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
                  favorited && "bg-purple-500/70 text-white",
                )}
              >
                <Star
                  className="h-3.5 w-3.5"
                  fill={favorited ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Bottom overlay: title + meta + actions (always visible on mobile) */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 pt-8">
              <div className="flex items-end justify-between gap-2">
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

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={handleLike}
                    aria-label="Like"
                    className={cn(
                      actionBtn,
                      isLiked && "bg-red-500/80 text-white",
                    )}
                  >
                    <Heart
                      className="h-3.5 w-3.5"
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={handleDownload}
                    aria-label="Download"
                    className={cn(
                      actionBtn,
                      "bg-purple-600/85 text-white hover:bg-purple-500",
                    )}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        wallpaperId={wallpaper.id}
        wallpaperTitle={wallpaper.title}
      />
    </>
  );
}
