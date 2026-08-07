"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLikes } from "@/lib/hooks/useLikes";
import { WallpaperGrid } from "@/components/wallpaper/wallpaper-grid";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Image as ImageIcon, Eye, Download, ArrowLeft, CalendarDays, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const TOP_RATED_LIMIT = 5;
const ALL_WORKS_LIMIT = 200;

interface StudioWallpaper {
  id: string;
  title: string;
  thumbnail_url: string | null;
  preview_url: string | null;
  is_premium: boolean;
  wallpaper_type: string;
  like_count: number;
  download_count: number;
  view_count: number;
  avg_rating: number | null;
  rating_count: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

function mapWorks(items: StudioWallpaper[]) {
  return items.map((w) => ({
    id: w.id,
    title: w.title,
    thumbnailUrl: w.thumbnail_url || w.preview_url || "",
    imageUrl: w.preview_url || w.thumbnail_url || "",
    dominantColor: undefined,
    isPremium: w.is_premium,
    isLive: w.wallpaper_type === "live",
    likes: w.like_count,
    downloads: w.download_count,
    avgRating: w.avg_rating ?? 0,
    ratingCount: w.rating_count ?? 0,
    width: w.width || 1080,
    height: w.height || 1920,
  }));
}

function StudioContent({ username }: { username: string }) {
  const supabase = createClient();
  const { user } = useAuth();
  const { toggleLike, likedIds } = useLikes();
  const [showAll, setShowAll] = useState(false);
  const worksSectionRef = useRef<HTMLDivElement>(null);

  const { data: studio, isLoading: studioLoading } = useQuery({
    queryKey: ["studio-public", username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .eq("studio_status", "approved")
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    },
  });

  const { data: topWorks, isLoading: topLoading } = useQuery({
    queryKey: ["studio-top", studio?.id],
    queryFn: async () => {
      if (!studio) return [];
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("uploader_id", studio.id)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("avg_rating", { ascending: false })
        .order("rating_count", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(TOP_RATED_LIMIT);
      if (error) throw error;
      return (data ?? []) as StudioWallpaper[];
    },
    enabled: !!studio,
  });

  const { data: stats } = useQuery({
    queryKey: ["studio-stats", studio?.id],
    queryFn: async () => {
      if (!studio) return { count: 0, views: 0, downloads: 0 };
      const { data, error } = await supabase
        .from("wallpapers")
        .select("view_count, download_count")
        .eq("uploader_id", studio.id)
        .eq("status", "published")
        .eq("visibility", "public");
      if (error) throw error;
      const items = (data ?? []) as { view_count: number | null; download_count: number | null }[];
      return {
        count: items.length,
        views: items.reduce((s, w) => s + (w.view_count ?? 0), 0),
        downloads: items.reduce((s, w) => s + (w.download_count ?? 0), 0),
      };
    },
    enabled: !!studio,
  });

  const { data: allWorks, isLoading: allLoading } = useQuery({
    queryKey: ["studio-all", studio?.id],
    queryFn: async () => {
      if (!studio) return [];
      const { data, error } = await supabase
        .from("wallpapers")
        .select("*")
        .eq("uploader_id", studio.id)
        .eq("status", "published")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(ALL_WORKS_LIMIT);
      if (error) throw error;
      return (data ?? []) as StudioWallpaper[];
    },
    enabled: !!studio && showAll,
  });

  useEffect(() => {
    if (studio?.studio_name) {
      document.title = `${studio.studio_name} | apex`;
    }
  }, [studio?.studio_name]);

  useEffect(() => {
    if (showAll && worksSectionRef.current) {
      worksSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAll]);

  if (studioLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-xl font-bold text-white">Studio not found</h2>
        <p className="mt-2 text-sm text-white/40">
          This studio may not exist or is not approved yet.
        </p>
        <Link
          href="/"
          className="mt-4 text-sm text-purple-400 transition-colors hover:text-purple-300"
        >
          Go back home
        </Link>
      </div>
    );
  }

  const totalCount = stats?.count ?? 0;
  const joinedDate = studio.approved_at
    ? new Date(studio.approved_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : new Date(studio.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });

  return (
    <div className="space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="h-36 w-full bg-gradient-to-br from-purple-600/40 via-blue-600/30 to-transparent" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="rounded-2xl ring-4 ring-[#0a0a0f]">
                <Avatar
                  src={studio.studio_avatar_url || studio.avatar_url}
                  name={studio.studio_name || studio.username}
                  size="xl"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {studio.studio_name || studio.username}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/40">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Studio since {joinedDate}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <ImageIcon className="mx-auto mb-1 h-4 w-4 text-purple-400" />
                <p className="text-lg font-bold text-white">{totalCount}</p>
                <p className="text-[10px] text-white/40">Wallpapers</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <Eye className="mx-auto mb-1 h-4 w-4 text-blue-400" />
                <p className="text-lg font-bold text-white">
                  {stats?.views.toLocaleString() ?? 0}
                </p>
                <p className="text-[10px] text-white/40">Views</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                <Download className="mx-auto mb-1 h-4 w-4 text-green-400" />
                <p className="text-lg font-bold text-white">
                  {stats?.downloads.toLocaleString() ?? 0}
                </p>
                <p className="text-[10px] text-white/40">Downloads</p>
              </div>
            </div>
          </div>

          {studio.studio_description && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/60">
              {studio.studio_description}
            </p>
          )}
        </div>
      </div>

      <section ref={worksSectionRef}>
        <h2 className="mb-4 text-xl font-bold text-white">
          {showAll ? "All Works" : "Top Rated"}
        </h2>

        {topLoading || (showAll && allLoading) ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
            ))}
          </div>
        ) : (showAll ? (allWorks ?? []) : (topWorks ?? [])).length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <p className="text-sm text-white/40">No wallpapers published yet.</p>
          </div>
        ) : (
          <>
            <WallpaperGrid
              wallpapers={mapWorks(showAll ? (allWorks ?? []) : (topWorks ?? []))}              likedIds={likedIds}
              onLike={(id) => {
                if (!user) {
                  toast.error("Please login to like");
                  return;
                }
                toggleLike(id);
              }}
            />

            {!showAll && totalCount > TOP_RATED_LIMIT && (
              <div className="mt-8 flex justify-center">
                <Button onClick={() => setShowAll(true)}>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  View All Works ({totalCount})
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function StudioPublicPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);

  return (
    <div>
      <StudioContent username={username} />
    </div>
  );
}
