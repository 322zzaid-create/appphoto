"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallpaper, useSimilarWallpapers } from "@/lib/hooks/useWallpapers";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRatings } from "@/lib/hooks/useRatings";
import { useLikes } from "@/lib/hooks/useLikes";
import { wallpaperService } from "@/lib/services/wallpaper.service";
import { WallpaperDetail } from "@/components/wallpaper/wallpaper-detail";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Compass } from "lucide-react";
import { toast } from "@/lib/utils/toast";

export function WallpaperDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { toggleFavorite, isFavorited, favoriteIds } = useFavorites();
  const { toggleLike, isLiked } = useLikes();
  const { data: wallpaper, isLoading, refetch } = useWallpaper(id);
  const { data: similar, isLoading: similarLoading } = useSimilarWallpapers(wallpaper ?? null);
  const { userRating, rate } = useRatings(
    id,
    wallpaper?.avg_rating ?? 0,
    wallpaper?.rating_count ?? 0,
  );
  const viewTracked = useRef(false);

  const similarMapped = useMemo(
    () =>
      (similar ?? []).map((w) => ({
        id: w.id,
        title: w.title,
        thumbnailUrl: w.thumbnail_url || w.preview_url || "",
        imageUrl: w.preview_url || w.thumbnail_url || "",
        artist: w.uploader?.full_name || w.uploader?.username,
        dominantColor: w.dominant_colors?.[0] || undefined,
        isPremium: w.is_premium,
        likes: w.like_count,
        downloads: w.download_count,
        width: w.width || 1080,
        height: w.height || 1920,
      })),
    [similar],
  );

  useEffect(() => {
    if (isLoading || authLoading || !wallpaper || viewTracked.current) return;
    viewTracked.current = true;
    wallpaperService.trackView(id, user?.id ?? null).then(() => {
      refetch();
    }).catch(() => {});
  }, [isLoading, authLoading, wallpaper, id, user?.id, refetch]);

  useEffect(() => {
    if (wallpaper) {
      document.title = `${wallpaper.title} | apex`;
    }
  }, [wallpaper]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wallpaper) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-bold text-white">Wallpaper not found</h2>
        <Link href="/" className="mt-4 text-sm text-purple-400 hover:text-purple-300">
          Go back home
        </Link>
      </div>
    );
  }

  const detailWallpaper = {
    id: wallpaper.id,
    title: wallpaper.title,
    description: wallpaper.description || undefined,
    imageUrl: wallpaper.preview_url || wallpaper.thumbnail_url || "",
    originalUrl: wallpaper.original_url || undefined,
    artist: wallpaper.uploader
      ? {
          name: wallpaper.uploader.full_name || wallpaper.uploader.username,
          avatar: wallpaper.uploader.avatar_url || undefined,
          studioName:
            wallpaper.uploader.studio_status === "approved"
              ? wallpaper.uploader.studio_name ?? undefined
              : undefined,
          studioAvatar:
            wallpaper.uploader.studio_status === "approved"
              ? wallpaper.uploader.studio_avatar_url ?? undefined
              : undefined,
          studioUsername:
            wallpaper.uploader.studio_status === "approved"
              ? wallpaper.uploader.username
              : undefined,
        }
      : undefined,
    dominantColor: wallpaper.dominant_colors?.[0] || undefined,
    isPremium: wallpaper.is_premium,
    isLive: wallpaper.wallpaper_type === "live",
    likes: wallpaper.like_count,
    downloads: wallpaper.download_count,
    views: wallpaper.view_count,
    avgRating: wallpaper.avg_rating ?? 0,
    ratingCount: wallpaper.rating_count ?? 0,
    userRating,
    width: wallpaper.width || 1080,
    height: wallpaper.height || 1920,
    tags: wallpaper.tags?.map((t) => t.name) || [],
    categories:
      wallpaper.categories?.map((c) => ({ name: c.name, slug: c.slug })) || [],
    createdAt: wallpaper.created_at,
  };

  const similarSection =
    similarLoading || similarMapped.length > 0 ? (
      <div className="space-y-6">
        <WallpaperGrid
          wallpapers={similarMapped}
          loading={similarLoading}
          favoriteIds={favoriteIds}
          onFavorite={(sid) => {
            if (!user) {
              toast.error("Please login to save");
              return;
            }
            toggleFavorite(sid);
          }}
        />
        <div className="flex justify-center pt-2">
          <Link href="/browse">
            <Button>
              <Compass className="mr-2 h-4 w-4" />
              Browse More Wallpapers
            </Button>
          </Link>
        </div>
      </div>
    ) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            name: wallpaper.title,
            description: wallpaper.description || undefined,
            contentUrl: wallpaper.preview_url || wallpaper.thumbnail_url || undefined,
            uploadDate: wallpaper.created_at,
            keywords: detailWallpaper.tags.join(", ") || undefined,
            author: detailWallpaper.artist
              ? { "@type": "Person", name: detailWallpaper.artist.name }
              : undefined,
            width: detailWallpaper.width,
            height: detailWallpaper.height,
          }),
        }}
      />
      <WallpaperDetail
        wallpaper={detailWallpaper}
        similarWallpapers={similarSection}
        onDownload={() => {}}
        isLiked={isLiked(wallpaper.id)}
        onLike={() => {
          if (!user) {
            toast.error("Please login to like");
            return;
          }
          toggleLike(wallpaper.id);
          toast.success(isLiked(wallpaper.id) ? "Like removed" : "Liked!");
        }}
        isFavorited={isFavorited(wallpaper.id)}
        onFavorite={() => {
          if (!user) {
            toast.error("Please login to save");
            return;
          }
          const wasFavorited = isFavorited(wallpaper.id);
          toggleFavorite(wallpaper.id);
          toast.success(wasFavorited ? "Removed from saved" : "Added to saved");
        }}
        onRate={async (r) => {
          if (!user) {
            toast.error("Please login to rate");
            return;
          }
          await rate(r);
          toast.success(`Rated ${r} stars`);
        }}
        onShare={() => {
          if (navigator.share) {
            navigator.share({
              title: wallpaper.title,
              url: window.location.href,
            });
          }
        }}
        onBack={() => router.back()}
      />
    </>
  );
}
