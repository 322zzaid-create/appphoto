"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, ImageIcon, Download, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const supabase = createClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [usersResult, wallpapersResult, downloadsResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("wallpapers").select("id", { count: "exact", head: true }),
        supabase
          .from("downloads")
          .select("created_at, quality")
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order("created_at", { ascending: true }),
      ]);

      const byDay: Record<string, number> = {};
      const byQuality: Record<string, number> = {};
      for (const dl of downloadsResult.data ?? []) {
        const day = dl.created_at.split("T")[0];
        byDay[day] = (byDay[day] ?? 0) + 1;
        byQuality[dl.quality] = (byQuality[dl.quality] ?? 0) + 1;
      }

      return {
        totalUsers: usersResult.count ?? 0,
        totalWallpapers: wallpapersResult.count ?? 0,
        totalDownloads: downloadsResult.data?.length ?? 0,
        downloadsByDay: byDay,
        downloadsByQuality: byQuality,
      };
    },
  });

  const { data: popularWallpapers } = useQuery({
    queryKey: ["admin-popular-wallpapers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallpapers")
        .select("id, title, view_count, download_count, like_count")
        .eq("status", "published")
        .order("download_count", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Platform performance metrics"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Analytics", href: "/admin/analytics" },
        ]}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<Users className="h-5 w-5 text-purple-400" />}
            value={formatNumber(stats?.totalUsers ?? 0)}
            label="Total Users"
          />
          <StatsCard
            icon={<ImageIcon className="h-5 w-5 text-blue-400" />}
            value={formatNumber(stats?.totalWallpapers ?? 0)}
            label="Total Wallpapers"
          />
          <StatsCard
            icon={<Download className="h-5 w-5 text-green-400" />}
            value={formatNumber(stats?.totalDownloads ?? 0)}
            label="Downloads (30d)"
          />
          <StatsCard
            icon={<TrendingUp className="h-5 w-5 text-orange-400" />}
            value={formatNumber(
              Object.values(stats?.downloadsByDay ?? {}).reduce((a, b) => a + b, 0)
            )}
            label="Total Events"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Downloads by Quality</h3>
          <div className="space-y-3">
            {Object.entries(stats?.downloadsByQuality ?? {}).map(([quality, count]) => (
              <div key={quality} className="flex items-center justify-between">
                <span className="text-sm text-white/60 capitalize">{quality}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                      style={{
                        width: `${Math.min(100, ((count as number) / Math.max(1, (stats?.totalDownloads ?? 1))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-white/50">
                    {formatNumber(count as number)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Popular Wallpapers</h3>
          <div className="space-y-2">
            {popularWallpapers?.map((wp, i) => (
              <div
                key={wp.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
              >
                <span className="w-6 text-center text-xs font-bold text-white/30">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{wp.title}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40">
                  <span>{wp.download_count} dl</span>
                  <span>{wp.view_count} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
