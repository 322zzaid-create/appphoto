"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { WallpaperFilters } from "@/components/wallpaper/wallpaper-filters";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { useWallpapers } from "@/lib/hooks/useWallpapers";
import { useLikes } from "@/lib/hooks/useLikes";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import type { WallpaperFilters as Filters } from "@/types";

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toggleLike, likedIds } = useLikes();

  const [page, setPage] = useState(1);

  const filters: Filters = useMemo(() => ({
    search: searchParams.get("q") || undefined,
    categories: searchParams.get("categories")?.split(",").filter(Boolean),
    device_type: (searchParams.get("device") as Filters["device_type"]) || "all",
    sort_by: (searchParams.get("sort") as Filters["sort_by"]) || "newest",
  }), [searchParams]);

  const { data, isLoading } = useWallpapers(filters, page);

  const handleFiltersChange = useCallback(
    (newFilters: WallpaperFilters) => {
      const params = new URLSearchParams();
      if (searchParams.get("q")) params.set("q", searchParams.get("q")!);
      if (newFilters.category.length) params.set("categories", newFilters.category.join(","));
      if (newFilters.device && newFilters.device !== "all") params.set("device", newFilters.device);
      if (newFilters.sort && newFilters.sort !== "newest") params.set("sort", newFilters.sort);
      setPage(1);
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams]
  );

  const wallpapers = useMemo(
    () =>
      (data?.data ?? []).map((w) => ({
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
    [data]
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories?.length) count++;
    if (filters.device_type && filters.device_type !== "all") count++;
    return count;
  }, [filters]);

  return (
    <div>
      <PageHeader
        title="Explore Wallpapers"
        description="Discover wallpapers from our curated collection"
        breadcrumbs={[{ label: "Browse", href: "/browse" }]}
        actions={
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="flex h-6 items-center rounded-full bg-purple-500/20 px-2.5 text-xs font-bold text-purple-400">
                {activeFilterCount}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPage(1);
                router.push("/browse");
              }}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        }
      />

      <div className="flex gap-8">
        <aside className="hidden lg:block">
          <WallpaperFilters
            filters={{
              device: filters.device_type || "all",
              category: filters.categories || [],
              sort: filters.sort_by || "newest",
            }}
            onChange={handleFiltersChange}
          />
        </aside>

        <div className="flex-1">
          {isLoading && wallpapers.length === 0 ? (
            <WallpaperGrid wallpapers={[]} loading />
          ) : wallpapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
                <RefreshCw className="h-7 w-7 text-white/20" />
              </div>
              <h3 className="text-lg font-semibold text-white">No wallpapers found</h3>
              <p className="mt-1 text-sm text-white/40">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-white/40">
                {data?.count?.toLocaleString()} wallpapers found
              </p>
              <WallpaperGrid
                wallpapers={wallpapers}
                loading={isLoading}
                likedIds={likedIds}
                onLike={(id) => {
                  if (!user) {
                    toast.error("Please login to like");
                    return;
                  }
                  toggleLike(id);
                }}
              />

              {data && data.total_pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 text-sm text-white/50">
                    Page {page} of {data.total_pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                    disabled={page >= data.total_pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
