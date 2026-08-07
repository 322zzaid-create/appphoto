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

  return (
    <>
      <Link href={`/wallpaper/${wallpaper.id}`}>
      <motion.div
        whileHover="hover"
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl",
          className,
        )}
      >
        <div
          className="relative w-full overflow-hidden rounded-xl bg-white/5"
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

          <motion.div
            initial={false}
            variants={{
              hover: { opacity: 1 },
            }}
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 opacity-0 transition-opacity"
          >
            <div className="flex justify-end gap-1.5">
              {wallpaper.isPremium && (
                <span className="flex items-center gap-1 rounded-full bg-yellow-500/90 px-2 py-0.5 text-[10px] font-bold text-black">
                  <Star className="h-2.5 w-2.5" fill="currentColor" />
                  PRO
                </span>
              )}
              {wallpaper.isLive && (
                <span className="flex items-center gap-1 rounded-full bg-purple-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
                  <Play className="h-2.5 w-2.5" fill="currentColor" />
                  LIVE
                </span>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white line-clamp-1">
                {wallpaper.title}
              </h3>
              {wallpaper.artist && (
                <p className="mt-0.5 text-xs text-white/60">by {wallpaper.artist}</p>
              )}

              <div className="mt-2 flex items-center gap-1.5">
                <button
                  onClick={handleLike}
                  className={cn(
                    "rounded-lg p-1.5 backdrop-blur-sm transition-colors",
                    isLiked
                      ? "bg-red-500/20 text-red-400"
                      : "bg-white/10 text-white/70 hover:text-white",
                  )}
                >
                  <Heart
                    className="h-3.5 w-3.5"
                    fill={isLiked ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleFavorite}
                  className={cn(
                    "rounded-lg p-1.5 backdrop-blur-sm transition-colors",
                    favorited
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-white/10 text-white/70 hover:text-white",
                  )}
                >
                  <Star
                    className="h-3.5 w-3.5"
                    fill={favorited ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={handleDownload}
                  className="rounded-lg bg-white/10 p-1.5 text-white/70 backdrop-blur-sm transition-colors hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>

                {(wallpaper.likes !== undefined || wallpaper.downloads !== undefined || wallpaper.avgRating !== undefined) && (
                  <div className="ml-auto flex items-center gap-2 text-[10px] text-white/40">
                    {wallpaper.avgRating !== undefined && wallpaper.avgRating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        {wallpaper.avgRating.toFixed(1)}
                      </span>
                    )}
                    {wallpaper.likes !== undefined && (
                      <span>{wallpaper.likes.toLocaleString()} likes</span>
                    )}
                    {wallpaper.downloads !== undefined && (
                      <span>{wallpaper.downloads.toLocaleString()} dl</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
