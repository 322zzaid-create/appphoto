"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui/avatar";
import { DownloadModal } from "@/components/wallpaper/download-modal";
import {
  Heart,
  Bookmark,
  Download,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import type { Post } from "@/types";

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}

interface PostCardProps {
  post: Post;
  isLiked: boolean;
  isSaved: boolean;
  isAuthenticated: boolean;
  onLike: (postId: string, wasLiked: boolean) => void;
  onSave: (postId: string, wasSaved: boolean) => void;
}

export function PostCard({
  post,
  isLiked,
  isSaved,
  isAuthenticated,
  onLike,
  onSave,
}: PostCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [liked, setLiked] = useState(isLiked);
  const [saved, setSaved] = useState(isSaved);
  const [downloadTarget, setDownloadTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const images = post.images ?? [];
  const studio = post.user;

  // Keep the optimistic local state in sync with the server state.
  const [prevLiked, setPrevLiked] = useState(isLiked);
  if (prevLiked !== isLiked) {
    setPrevLiked(isLiked);
    setLiked(isLiked);
  }
  const [prevSaved, setPrevSaved] = useState(isSaved);
  if (prevSaved !== isSaved) {
    setPrevSaved(isSaved);
    setSaved(isSaved);
  }

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.max(0, Math.min(index, images.length - 1));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };

  const handleLike = () => {
    if (!isAuthenticated) return;
    setLiked((v) => !v);
    onLike(post.id, liked);
  };

  const handleSave = () => {
    if (!isAuthenticated) return;
    setSaved((v) => !v);
    onSave(post.id, saved);
  };

  const likeDisplay =
    post.like_count + (liked === isLiked ? 0 : liked ? 1 : -1);
  const saveDisplay =
    post.save_count + (saved === isSaved ? 0 : saved ? 1 : -1);

  const studioName = studio?.studio_name || studio?.full_name || studio?.username;
  const studioAvatar = studio?.studio_avatar_url || studio?.avatar_url;
  const studioHref = studio?.username ? `/studio/${studio.username}` : "#";

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
      {/* Header: studio */}
      <div className="flex items-center gap-3 p-4">
        <Link href={studioHref} className="shrink-0">
          <Avatar
            src={studioAvatar}
            name={studioName || "Studio"}
            size="md"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={studioHref}
            className="block truncate text-sm font-semibold text-white transition-colors hover:text-purple-300"
          >
            {studioName || "Studio"}
          </Link>
          <p className="text-xs text-white/40">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <p className="whitespace-pre-wrap break-words px-4 pb-3 text-sm leading-relaxed text-white/80">
          {post.caption}
        </p>
      )}

      {/* Carousel */}
      <div className="relative">
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => scrollTo(i)}
                aria-label={`Image ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "w-5 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={() => scrollTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white/90 backdrop-blur-md transition-all hover:bg-black/70 disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollTo(activeIndex + 1)}
              disabled={activeIndex === images.length - 1}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white/90 backdrop-blur-md transition-all hover:bg-black/70 disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "flex snap-x snap-mandatory overflow-x-auto scroll-smooth",
            "scrollbar-none",
          )}
        >
          {images.map((img, i) => {
            const wallpaper = img.wallpaper;
            const title = wallpaper?.title || `Image ${i + 1}`;
            return (
              <div
                key={img.id}
                className="relative aspect-[4/5] w-full shrink-0 snap-center bg-black/40 sm:aspect-[16/11]"
              >
                <img
                  src={wallpaper?.preview_url || wallpaper?.thumbnail_url || ""}
                  alt={title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-3 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    <ImageIcon className="h-3 w-3" />
                    {i + 1}/{images.length}
                  </div>
                )}
                <button
                  onClick={() =>
                    setDownloadTarget({ id: wallpaper?.id ?? "", title })
                  }
                  aria-label={`Download ${title}`}
                  className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-black shadow-lg backdrop-blur-md transition-transform active:scale-95 hover:bg-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: like + save */}
      <div className="flex items-center gap-1 p-3">
        <button
          onClick={handleLike}
          aria-label="Like post"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all active:scale-95",
            liked
              ? "text-red-400"
              : "text-white/60 hover:bg-white/5 hover:text-white",
          )}
        >
          <Heart
            className={cn("h-[18px] w-[18px] transition-transform", liked && "scale-110")}
            fill={liked ? "currentColor" : "none"}
          />
          {likeDisplay.toLocaleString()}
        </button>
        <button
          onClick={handleSave}
          aria-label="Save post"
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all active:scale-95",
            saved
              ? "text-purple-400"
              : "text-white/60 hover:bg-white/5 hover:text-white",
          )}
        >
          <Bookmark
            className="h-[18px] w-[18px]"
            fill={saved ? "currentColor" : "none"}
          />
          {saveDisplay.toLocaleString()}
        </button>
      </div>

      {downloadTarget && (
        <DownloadModal
          isOpen={!!downloadTarget.id}
          onClose={() => setDownloadTarget(null)}
          wallpaperId={downloadTarget.id}
          wallpaperTitle={downloadTarget.title}
        />
      )}
    </article>
  );
}
