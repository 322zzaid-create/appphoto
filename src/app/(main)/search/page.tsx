"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { useSearch } from "@/lib/hooks/useSearch";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { results, suggestions, history, isLoading, query, setQuery, search } =
    useSearch();

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
          onSearch={handleSearch}
          placeholder="Search wallpapers, categories, tags..."
          recentSearches={history.map((h) => h.query)}
          popularSearches={["nature", "anime", "dark", "abstract", "4k", "phone"]}
        />
      </div>

      <div className="mt-8">
        {results ? (
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
