"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { useSearch } from "@/lib/hooks/useSearch";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/utils/toast";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { results, history, isLoading, query, setQuery, search } =
    useSearch();
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();

  const urlQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      search(urlQuery);
    }
  }, [urlQuery, search, setQuery]);

  const handleSearch = (q: string) => {
    search(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div>
      <PageHeader
        title="Search Wallpapers"
        breadcrumbs={[{ label: "Search", href: "/search" }]}
      />

      <div className="mx-auto max-w-2xl">
        <SearchBar
          key={urlQuery}
          initialQuery={urlQuery}
          onSearch={handleSearch}
          placeholder="Search wallpapers, categories, tags..."
          recentSearches={history.map((h) => h.query)}
          popularSearches={["nature", "anime", "dark", "abstract", "4k", "phone"]}
        />
      </div>

      <div className="mt-8">
        {isLoading && !results ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : results ? (
          <SearchResults
            query={results.query}
            results={results.wallpapers.map((w) => ({
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
            }))}
            totalCount={results.total}
            loading={isLoading}
            favoriteIds={favoriteIds}
            onFavorite={(id) => {
              if (!user) {
                toast.error("Please login to add favorites");
                return;
              }
              toggleFavorite(id);
            }}
          />
        ) : !query ? (
          <div className="space-y-8 py-8">
            {history.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-white/70">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => handleSearch(h.query)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {h.query}
                    </button>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="mb-3 text-sm font-semibold text-white/70">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {["nature", "anime", "dark", "abstract", "4k", "phone", "gaming", "space"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 w-full max-w-2xl mx-auto" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
