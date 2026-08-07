"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeaturedSection } from "@/components/wallpaper/featured-section";
import { CategoryGrid } from "@/components/wallpaper/category-grid";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { MultitagAd } from "@/components/ads/multitag-ad";
import { Button } from "@/components/ui/button";
import { useLikes } from "@/lib/hooks/useLikes";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";
import type { Wallpaper, Category } from "@/types";

interface HomeContentProps {
  featured: Wallpaper[];
  wallpaperOfTheDay: Wallpaper | null;
  categories: Category[];
  latest: Wallpaper[];
}

export function HomeContent({
  featured,
  wallpaperOfTheDay,
  categories,
  latest,
}: HomeContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleLike, likedIds } = useLikes();

  const featuredItems = featured.map((w) => ({
    id: w.id,
    title: w.title,
    imageUrl: w.preview_url || w.thumbnail_url || "",
    category: w.categories?.[0]?.name,
    isPremium: w.is_premium,
  }));

  const categoryItems = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c.wallpaper_count,
    icon: c.icon ?? undefined,
  }));

  const latestMapped = latest.map((w) => ({
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
    <div className="space-y-10 sm:space-y-12">
      <section className="py-10 text-center sm:py-16">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-6xl">
          <span className="gradient-text">Discover Amazing</span>
          <br />
          <span className="text-white">Wallpapers</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:mt-4 sm:text-base lg:text-lg">
          Find the perfect wallpaper for your phone, tablet, or desktop. Thousands
          of high-quality wallpapers updated daily.
        </p>
      </section>

      {wallpaperOfTheDay && (
        <section>
          <Link href={`/wallpaper/${wallpaperOfTheDay.id}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:rounded-3xl">
              <div className="aspect-[16/9] w-full sm:aspect-[21/9]">
                <img
                  src={wallpaperOfTheDay.preview_url || wallpaperOfTheDay.thumbnail_url || ""}
                  alt={wallpaperOfTheDay.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-xs font-bold text-white">
                  Wallpaper of the Day
                </span>
                <h2 className="text-xl font-bold text-white sm:text-3xl">
                  {wallpaperOfTheDay.title}
                </h2>
                {wallpaperOfTheDay.uploader && (
                  <p className="mt-1 text-xs text-white/50 sm:text-sm">
                    by {wallpaperOfTheDay.uploader.full_name || wallpaperOfTheDay.uploader.username}
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

      <MultitagAd className="py-2" />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white sm:text-xl">Categories</h2>
          <Link
            href="/browse"
            className="text-sm text-purple-400 transition-colors hover:text-purple-300"
          >
            View All
          </Link>
        </div>
        <CategoryGrid categories={categoryItems} />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white sm:text-xl">Latest Wallpapers</h2>
          <Link
            href="/browse"
            className="text-sm text-purple-400 transition-colors hover:text-purple-300"
          >
            View All
          </Link>
        </div>
        <WallpaperGrid
          wallpapers={latestMapped}
          likedIds={likedIds}
          onLike={(id) => {
            if (!user) {
              toast.error("Please login to like");
              return;
            }
            toggleLike(id);
          }}
        />
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
    </div>
  );
}
