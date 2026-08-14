"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Wallpaper } from "@/types";

export interface HomeFeed {
  featured: Wallpaper[];
  wallpaperOfTheDay: Wallpaper | null;
  pool: Wallpaper[];
}

export const HOME_POOL_SIZE = 60;

export type HomeFeedFilter = "all" | "desktop" | "phone" | "profile";

async function fetchHomeFeed(filter: HomeFeedFilter): Promise<HomeFeed> {
  const supabase = createClient();
  const isAll = filter === "all";

  let poolQuery = supabase
    .from("wallpapers")
    .select(
      "*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url)",
    )
    .eq("status", "published")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(HOME_POOL_SIZE);

  if (!isAll) poolQuery = poolQuery.eq("device_type", filter);

  const [featuredResult, wotdResult, poolResult] = await Promise.allSettled([
    supabase
      .from("wallpapers")
      .select(
        "*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url)",
      )
      .eq("is_featured", true)
      .eq("status", "published")
      .eq("visibility", "public")
      .order("featured_at", { ascending: false })
      .limit(12),
    supabase
      .from("wallpaper_of_the_day")
      .select(
        "wallpaper:wallpapers(*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url))",
      )
      .eq("date", new Date().toISOString().split("T")[0])
      .single(),
    poolQuery,
  ]);

  return {
    featured:
      featuredResult.status === "fulfilled"
        ? ((featuredResult.value.data ?? []) as Wallpaper[])
        : [],
    wallpaperOfTheDay:
      wotdResult.status === "fulfilled"
        ? ((wotdResult.value.data as { wallpaper?: Wallpaper } | null)?.wallpaper ?? null)
        : null,
    pool:
      poolResult.status === "fulfilled"
        ? ((poolResult.value.data ?? []) as Wallpaper[])
        : [],
  };
}

export function useHomeFeed(filter: HomeFeedFilter, initialData?: HomeFeed) {
  return useQuery({
    queryKey: ["home-feed", filter],
    queryFn: () => fetchHomeFeed(filter),
    initialData,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}
