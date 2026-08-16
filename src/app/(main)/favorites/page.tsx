"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useSavedPosts } from "@/lib/hooks/useSavedPosts";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/page-header";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { PostCard } from "@/components/posts/post-card";
import { InlineAd } from "@/components/ads/inline-ad";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { Bookmark, Newspaper } from "lucide-react";
import { toast } from "@/lib/utils/toast";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { favorites, isLoading, favoriteIds, toggleFavorite } = useFavorites();
  const {
    posts: savedPosts,
    isLoading: postsLoading,
    likedPostIds,
    likePost,
    removeSavedPost,
  } = useSavedPosts();
  const [tab, setTab] = useState<"wallpapers" | "posts">("wallpapers");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/favorites");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
        <div className="h-12 animate-pulse rounded-2xl bg-white/5" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  const wallpapers = favorites
    .filter((f) => f.wallpaper)
    .map((f) => ({
      id: f.wallpaper!.id,
      title: f.wallpaper!.title,
      thumbnailUrl: f.wallpaper!.thumbnail_url || f.wallpaper!.preview_url || "",
      imageUrl: f.wallpaper!.preview_url || f.wallpaper!.thumbnail_url || "",
      artist: f.wallpaper!.uploader?.full_name || f.wallpaper!.uploader?.username,
      dominantColor: f.wallpaper!.dominant_colors?.[0] || undefined,
      isPremium: f.wallpaper!.is_premium,
      likes: f.wallpaper!.like_count,
      downloads: f.wallpaper!.download_count,
      width: f.wallpaper!.width || 1080,
      height: f.wallpaper!.height || 1920,
    }));

  const tabBtn = (active: boolean) =>
    cn(
      "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors",
      active
        ? "bg-gradient-to-br from-purple-500/25 to-blue-500/25 text-white ring-1 ring-white/10"
        : "text-white/45 hover:text-white/75",
    );

  return (
    <div>
      <PageHeader
        title="Saved"
        description="Your saved wallpapers and posts"
        breadcrumbs={[{ label: "Saved", href: "/favorites" }]}
      />

      <div className="mb-6 flex rounded-2xl border border-white/10 bg-white/5 p-1.5">
        <button onClick={() => setTab("wallpapers")} className={tabBtn(tab === "wallpapers")}>
          <Bookmark className="h-4 w-4" />
          Wallpapers
        </button>
        <button onClick={() => setTab("posts")} className={tabBtn(tab === "posts")}>
          <Newspaper className="h-4 w-4" />
          Posts
        </button>
      </div>

      {tab === "wallpapers" ? (
        isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : wallpapers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Bookmark className="h-7 w-7 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white">Nothing saved yet</h3>
            <p className="mt-1 text-sm text-white/40">
              Save wallpapers you love to find them here.
            </p>
            <Button onClick={() => router.push("/browse")} className="mt-4">
              Browse Wallpapers
            </Button>
          </div>
        ) : (
          <WallpaperGrid
            wallpapers={wallpapers}
            favoriteIds={favoriteIds}
            onFavorite={(id) => {
              if (!user) {
                toast.error("Please login to save");
                return;
              }
              const wasSaved = favoriteIds.includes(id);
              toggleFavorite(id);
              toast.success(wasSaved ? "Removed from saved" : "Added to saved");
            }}
            ad={<InlineAd boxClassName="aspect-[3/4]" />}
          />
        )
      ) : postsLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3 p-4">
                <div className="h-11 w-11 animate-pulse rounded-full bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
                  <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
                </div>
              </div>
              <div className="aspect-[4/5] w-full animate-pulse bg-white/5 sm:aspect-[16/11]" />
            </div>
          ))}
        </div>
      ) : savedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <Newspaper className="h-7 w-7 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">No saved posts yet</h3>
          <p className="mt-1 text-sm text-white/40">
            Save posts from studios to see them here.
          </p>
          <Button onClick={() => router.push("/posts")} className="mt-4">
            Explore Posts
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPostIds.includes(post.id)}
              isSaved
              isAuthenticated={!!user}
              onLike={(postId, wasLiked) =>
                likePost.mutate({ postId, like: !wasLiked })
              }
              onSave={(postId) => {
                removeSavedPost.mutate(postId);
                toast.success("Removed from saved");
              }}
            />
          ))}
        </div>
      )}

      <div className="pt-8">
        <InlineAd boxClassName="aspect-[6/5] max-w-[300px] mx-auto" />
      </div>
    </div>
  );
}
