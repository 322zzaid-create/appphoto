"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/page-header";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { InlineAd } from "@/components/ads/inline-ad";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toast } from "@/lib/utils/toast";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { favorites, isLoading, favoriteIds, toggleFavorite } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/favorites");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
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

  return (
    <div>
      <PageHeader
        title="Favorites"
        description="Your saved wallpapers"
        breadcrumbs={[{ label: "Favorites", href: "/favorites" }]}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : wallpapers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <Heart className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white">No favorites yet</h3>
          <p className="mt-1 text-sm text-white/40">
            Start exploring and save wallpapers you love.
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
              toast.error("Please login to add favorites");
              return;
            }
            toggleFavorite(id);
          }}
          ad={<InlineAd boxClassName="aspect-[3/4]" />}
        />
      )}
    </div>
  );
}
