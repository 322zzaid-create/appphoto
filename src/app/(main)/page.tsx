import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { HomeContent } from "./home-content";
import { Skeleton } from "@/components/ui/skeleton";
import type { Wallpaper, Category } from "@/types";

async function getInitialData() {
  const supabase = await createClient();

  const [featuredResult, wotdResult, categoriesResult, latestResult, categoryCountsResult] =
    await Promise.allSettled([
      supabase
        .from("wallpapers")
        .select("*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url)")
        .eq("is_featured", true)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("featured_at", { ascending: false })
        .limit(12),
      supabase
        .from("wallpaper_of_the_day")
        .select("wallpaper:wallpapers(*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url))")
        .eq("date", new Date().toISOString().split("T")[0])
        .single(),
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(12),
      supabase
        .from("wallpapers")
        .select("*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url)")
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(24),
      supabase.rpc("get_category_counts"),
    ]);

  const wotdData = wotdResult.status === "fulfilled" ? wotdResult.value.data : null;

  // Category counts come from a single lightweight SQL aggregate
  const countMap: Record<string, number> = {};
  const categoryCounts =
    categoryCountsResult.status === "fulfilled" ? categoryCountsResult.value.data ?? [] : [];
  for (const row of categoryCounts) {
    if (row && typeof row.slug === "string") {
      countMap[row.slug] = typeof row.count === "number" ? row.count : 0;
    }
  }

  const rawCategories = (categoriesResult.status === "fulfilled" ? (categoriesResult.value.data ?? []) : []) as Category[];
  const categoriesWithCounts = rawCategories.map(c => ({
    ...c,
    wallpaper_count: countMap[c.slug] ?? 0,
  }));

  return {
    featured: (featuredResult.status === "fulfilled" ? (featuredResult.value.data ?? []) : []) as Wallpaper[],
    wallpaperOfTheDay: (wotdData?.wallpaper ?? null) as Wallpaper | null,
    categories: categoriesWithCounts,
    latest: (latestResult.status === "fulfilled" ? (latestResult.value.data ?? []) : []) as Wallpaper[],
  };
}

function HomeSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-4 py-16 text-center">
        <Skeleton className="mx-auto h-12 w-96" />
        <Skeleton className="mx-auto h-6 w-[500px] max-w-full" />
        <Skeleton className="mx-auto h-12 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const data = await getInitialData();

  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent
        featured={data.featured}
        wallpaperOfTheDay={data.wallpaperOfTheDay}
        categories={data.categories}
        latest={data.latest}
      />
    </Suspense>
  );
}
