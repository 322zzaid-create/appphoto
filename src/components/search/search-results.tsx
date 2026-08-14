"use client";

import { cn } from "@/lib/utils/cn";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import type { Wallpaper } from "@/components/wallpaper/wallpaper-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

interface SearchResultsProps {
  query: string;
  results: Wallpaper[];
  totalCount?: number;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onFavorite?: (id: string) => void;
  favoriteIds?: string[];
  className?: string;
}

export function SearchResults({
  query,
  results,
  totalCount,
  loading,
  hasMore,
  onLoadMore,
  onFavorite,
  favoriteIds,
  className,
}: SearchResultsProps) {
  if (loading && results.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Searching...
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && results.length === 0 && query) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-20", className)}>
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <Search className="h-7 w-7 text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white">No results found</h3>
        <p className="mt-1 text-sm text-white/40">
          Try different keywords or adjust your filters
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {totalCount !== undefined && query && (
        <p className="text-sm text-white/40">
          {totalCount.toLocaleString()} results for &quot;{query}&quot;
        </p>
      )}

      <WallpaperGrid
        wallpapers={results}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        onFavorite={onFavorite}
        favoriteIds={favoriteIds}
      />
    </div>
  );
}
