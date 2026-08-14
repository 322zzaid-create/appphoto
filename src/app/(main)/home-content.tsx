"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { FeaturedSection } from "@/components/wallpaper/featured-section";
import { BannerAd } from "@/components/ads/banner-ad";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { HomeFilterTabs, type HomeFilterId } from "@/components/layout/home-filter-tabs";
import { Button } from "@/components/ui/button";
import { useHomeFeed } from "@/lib/hooks/useHomeFeed";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSettings } from "@/lib/hooks/useSettings";
import { toast } from "@/lib/utils/toast";
import { ImageOff } from "lucide-react";
import type { Wallpaper } from "@/types";

interface HomeContentProps {
  featured: Wallpaper[];
  wallpaperOfTheDay: Wallpaper | null;
  latest: Wallpaper[];
}

const DISPLAY_COUNT = 24;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const rand = seededRandom(seed);
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function HomeContent({
  featured: initialFeatured,
  wallpaperOfTheDay: initialWotd,
  latest: initialLatest,
}: HomeContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { siteDescription } = useSettings();

  // Fresh random seed on every mount so the selection changes each app open,
  // and re-seeded on every pull-to-refresh. Must be a full 32-bit integer:
  // seededRandom() uses bitwise ops which truncate floats (Math.random() in
  // [0,1) would always truncate to 0 and never change).
  const [seed, setSeed] = useState(() => (Math.random() * 0xffffffff) >>> 0);
  const [filter, setFilter] = useState<HomeFilterId>("all");

  const initialData = useMemo(
    () => ({
      featured: initialFeatured,
      wallpaperOfTheDay: initialWotd,
      pool: initialLatest,
    }),
    [initialFeatured, initialWotd, initialLatest],
  );

  const { data, refetch, isLoading } = useHomeFeed(filter, initialData);

  const handleRefresh = useCallback(async () => {
    setSeed((Math.random() * 0xffffffff) >>> 0);
    try {
      await refetch({ cancelRefetch: true });
    } catch {
      // Keep current content if the refresh fails (offline, etc.)
    }
  }, [refetch]);

  const featured = useMemo(() => {
    return shuffleWithSeed(data?.featured ?? [], seed);
  }, [data?.featured, seed]);

  const wallpapers = useMemo(() => {
    const pool = data?.pool ?? [];
    if (pool.length === 0) return [];
    return shuffleWithSeed(pool, seed + 1).slice(0, Math.min(DISPLAY_COUNT, pool.length));
  }, [data?.pool, seed]);

  const featuredItems = featured.map((w) => ({
    id: w.id,
    title: w.title,
    imageUrl: w.preview_url || w.thumbnail_url || "",
    category: w.categories?.[0]?.name,
    isPremium: w.is_premium,
  }));

  const latestMapped = wallpapers.map((w) => ({
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
  }));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-10 sm:space-y-12">
        <section className="py-10 text-center sm:py-16">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
            <span className="gradient-text">Discover Amazing</span>
            <br />
            <span className="text-white">Wallpapers</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:mt-4 sm:text-base lg:text-lg">
            {siteDescription}
          </p>
        </section>

        {data?.wallpaperOfTheDay && (
          <section>
            <Link
              href={`/wallpaper/${data.wallpaperOfTheDay.id}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:rounded-3xl">
                <div className="aspect-[16/9] w-full sm:aspect-[21/9]">
                  <img
                    src={
                      data.wallpaperOfTheDay.preview_url ||
                      data.wallpaperOfTheDay.thumbnail_url ||
                      ""
                    }
                    alt={data.wallpaperOfTheDay.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                  <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-xs font-bold text-white">
                    Wallpaper of the Day
                  </span>
                  <h2 className="text-xl font-bold text-white sm:text-3xl">
                    {data.wallpaperOfTheDay.title}
                  </h2>
                  {data.wallpaperOfTheDay.uploader && (
                    <p className="mt-1 text-xs text-white/50 sm:text-sm">
                      by{" "}
                      {data.wallpaperOfTheDay.uploader.full_name ||
                        data.wallpaperOfTheDay.uploader.username}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </section>
        )}

        {featuredItems.length > 0 && (
          <FeaturedSection
            items={featuredItems}
            onItemClick={(item) => router.push(`/wallpaper/${item.id}`)}
          />
        )}

        <section className="space-y-5">
          <HomeFilterTabs active={filter} onChange={setFilter} />

          {wallpapers.length > 0 || (isLoading && !data) ? (
            <WallpaperGrid
              wallpapers={latestMapped}
              loading={isLoading && !data}
              favoriteIds={favoriteIds}
              onFavorite={(id) => {
                if (!user) {
                  toast.error("Please login to add favorites");
                  return;
                }
                toggleFavorite(id);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ImageOff className="mb-3 h-10 w-10 text-white/20" />
              <p className="text-white/50">
                {filter === "profile"
                  ? "Profile wallpapers coming soon."
                  : "No wallpapers in this category yet."}
              </p>
            </div>
          )}
        </section>

        <section className="py-6 text-center sm:py-8">
          <div className="glass-card mx-auto max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white">Explore More</h2>
            <p className="mt-2 text-sm text-white/50">
              Browse thousands of wallpapers across dozens of categories.
            </p>
            <Link href="/browse">
              <Button className="mt-4">Browse All Wallpapers</Button>
            </Link>
          </div>
        </section>

        <BannerAd adKey="183638a161eb743d6cabc0a5e0f8b8b4" className="py-2" />
      </div>
    </PullToRefresh>
  );
}
