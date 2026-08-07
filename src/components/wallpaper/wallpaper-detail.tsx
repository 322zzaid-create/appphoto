"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";
import { Watermark } from "./watermark";
import { DownloadModal } from "./download-modal";
import {
  Heart,
  Download,
  Share2,
  Star,
  Play,
  Tag,
  ArrowLeft,
} from "lucide-react";

interface WallpaperDetailProps {
  wallpaper: {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    originalUrl?: string;
    artist?: {
      name: string;
      avatar?: string;
      studioName?: string;
      studioAvatar?: string;
      studioUsername?: string;
    };
    dominantColor?: string;
    isPremium?: boolean;
    isLive?: boolean;
    likes?: number;
    downloads?: number;
    views?: number;
    avgRating?: number;
    ratingCount?: number;
    userRating?: number | null;
    width: number;
    height: number;
    tags?: string[];
    categories?: { name: string; slug: string }[];
    createdAt?: string;
  };
  similarWallpapers?: React.ReactNode;
  onDownload?: () => void;
  onLike?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onBack?: () => void;
  onRate?: (rating: number) => void;
  isFavorited?: boolean;
  isLiked?: boolean;
}

export function WallpaperDetail({
  wallpaper,
  similarWallpapers,
  onDownload,
  onLike,
  onFavorite,
  onShare,
  onBack,
  onRate,
  isFavorited,
  isLiked,
}: WallpaperDetailProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  return (
    <div>
      {onBack && (
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
          >
            <div
              className="relative w-full"
              style={{ aspectRatio: `${wallpaper.width}/${wallpaper.height}` }}
            >
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.title}
                className="h-full w-full object-contain"
              />
              <Watermark />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-white">
                  {wallpaper.title}
                </h1>
                <div className="flex shrink-0 items-center gap-1.5">
                  {wallpaper.isPremium && (
                    <Badge color="yellow">
                      <Star className="mr-1 h-3 w-3" fill="currentColor" />
                      Premium
                    </Badge>
                  )}
                  {wallpaper.isLive && (
                    <Badge color="purple">
                      <Play className="mr-1 h-3 w-3" fill="currentColor" />
                      Live
                    </Badge>
                  )}
                </div>
              </div>

              {wallpaper.artist && (
                <div className="mt-3 flex items-center gap-3">
                  {wallpaper.artist.studioUsername ? (
                    <Link
                      href={`/studio/${wallpaper.artist.studioUsername}`}
                      className="group flex items-center gap-3 rounded-xl transition-colors hover:bg-white/5"
                    >
                      <Avatar
                        src={wallpaper.artist.studioAvatar || wallpaper.artist.avatar}
                        name={wallpaper.artist.studioName || wallpaper.artist.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-white transition-colors group-hover:text-purple-300">
                          {wallpaper.artist.studioName || wallpaper.artist.name}
                        </p>
                        <p className="text-xs text-white/40">Studio</p>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <Avatar
                        src={wallpaper.artist.avatar}
                        name={wallpaper.artist.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {wallpaper.artist.name}
                        </p>
                        <p className="text-xs text-white/40">Artist</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {wallpaper.description && (
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  {wallpaper.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {wallpaper.likes !== undefined && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {wallpaper.likes.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">Likes</p>
                </div>
              )}
              {wallpaper.downloads !== undefined && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {wallpaper.downloads.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">Downloads</p>
                </div>
              )}
              {wallpaper.views !== undefined && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-lg font-bold text-white">
                    {wallpaper.views.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/40">Views</p>
                </div>
              )}
            </div>

            {/* Rating Section */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80">Rating</p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating
                      rating={wallpaper.avgRating || 0}
                      size="md"
                    />
                    <span className="text-sm text-white/40">
                      {wallpaper.avgRating?.toFixed(1) || "0.0"} (
                      {wallpaper.ratingCount || 0} reviews)
                    </span>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs text-white/30">Your rating</p>
                  <StarRating
                    rating={wallpaper.userRating || 0}
                    size="md"
                    interactive
                    onRate={(r) => onRate?.(r)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setShowDownloadModal(true)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                variant="secondary"
                onClick={() => onLike?.()}
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    isLiked && "fill-red-400 text-red-400",
                  )}
                />
              </Button>
              <Button variant="secondary" onClick={onFavorite}>
                <Star className={cn("h-4 w-4", isFavorited && "fill-yellow-400 text-yellow-400")} />
              </Button>
              <Button variant="secondary" onClick={onShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {wallpaper.tags && wallpaper.tags.length > 0 && (
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-white/70">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {wallpaper.tags.map((tag) => (
                    <Badge key={tag} color="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {wallpaper.categories && wallpaper.categories.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-medium text-white/70">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {wallpaper.categories.map((cat) => (
                    <Badge key={cat.slug} color="blue">
                      {cat.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-sm font-medium text-white/70">
                Resolution
              </h3>
              <p className="text-sm text-white/50">
                {wallpaper.width} x {wallpaper.height}
              </p>
            </div>
          </motion.div>
        </div>

        {similarWallpapers && (
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-white">
              Similar Wallpapers
            </h2>
            {similarWallpapers}
          </div>
        )}

        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          wallpaperId={wallpaper.id}
          wallpaperTitle={wallpaper.title}
        />
    </div>
  );
}
