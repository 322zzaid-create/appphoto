"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { StatsCard } from "@/components/admin/stats-card";
import { Users, ImageIcon, Download, Eye, Tag, DollarSign } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { AdminStats } from "@/types";

export default function AdminDashboardPage() {
  const supabase = createClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async (): Promise<AdminStats> => {
      const [
        { count: totalUsers },
        { count: totalWallpapers },
        { count: totalDownloads },
        { count: totalLikes },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("wallpapers").select("id", { count: "exact", head: true }),
        supabase.from("downloads").select("id", { count: "exact", head: true }),
        supabase.from("likes").select("id", { count: "exact", head: true }),
      ]);

      const { data: allWallpapers } = await supabase
        .from("wallpapers")
        .select("view_count");

      const totalViews = allWallpapers?.reduce((sum, w) => sum + (w.view_count ?? 0), 0) ?? 0;

      return {
        total_users: totalUsers ?? 0,
        total_wallpapers: totalWallpapers ?? 0,
        total_downloads: totalDownloads ?? 0,
        total_views: totalViews,
        total_likes: totalLikes ?? 0,
        total_revenue: 0,
        active_users_today: 0,
        new_users_this_week: 0,
        top_wallpapers: [],
        top_categories: [],
        recent_downloads: [],
      };
    },
    staleTime: 60 * 1000,
  });

  const { data: recentWallpapers, isLoading: recentLoading } = useQuery({
    queryKey: ["admin-recent-wallpapers"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wallpapers")
        .select("id, title, status, created_at, uploader:profiles!wallpapers_uploader_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">Overview of your platform</p>
      </div>

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
            value={formatNumber(stats?.total_users ?? 0)}
            label="Total Users"
          />
          <StatsCard
            icon={<ImageIcon className="h-5 w-5 text-blue-400" />}
            value={formatNumber(stats?.total_wallpapers ?? 0)}
            label="Total Wallpapers"
          />
          <StatsCard
            icon={<Download className="h-5 w-5 text-green-400" />}
            value={formatNumber(stats?.total_downloads ?? 0)}
            label="Total Downloads"
          />
          <StatsCard
            icon={<Eye className="h-5 w-5 text-orange-400" />}
            value={formatNumber(stats?.total_views ?? 0)}
            label="Total Views"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Recent Wallpapers</h2>
          {recentLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recentWallpapers?.map((wp) => (
                <div
                  key={wp.id}
                  className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{wp.title}</p>
                    <p className="text-xs text-white/30">
                      by {(wp.uploader as { full_name?: string })?.full_name || "Unknown"}
                    </p>
                  </div>
                  <span
                    className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      wp.status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : wp.status === "pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-white/10 text-white/40"
                    }`}
                  >
                    {wp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/wallpapers"
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ImageIcon className="h-4 w-4" />
              Manage Wallpapers
            </a>
            <a
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Tag className="h-4 w-4" />
              Manage Categories
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Users className="h-4 w-4" />
              Manage Users
            </a>
            <a
              href="/admin/ads"
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              <DollarSign className="h-4 w-4" />
              Ad Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
