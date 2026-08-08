"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Upload, Heart, Eye, Download, Settings, Shield, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
    }
  }, [user, authLoading, router]);

  const supabase = createClient();

  const { data: stats } = useQuery({
    queryKey: ["profile-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [uploads, downloads, favorites] = await Promise.all([
        supabase.from("wallpapers").select("id", { count: "exact", head: true }).eq("uploader_id", user.id),
        supabase.from("downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return {
        uploads: uploads.count ?? 0,
        downloads: downloads.count ?? 0,
        favorites: favorites.count ?? 0,
      };
    },
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        breadcrumbs={[{ label: "Profile", href: "/profile" }]}
        actions={
          <Button variant="secondary" size="sm" onClick={() => router.push("/profile/settings")}>
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Settings
          </Button>
        }
      />

      <div className="glass-card mb-8 p-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={user.avatar_url}
            name={user.full_name || user.username}
            size="xl"
          />
          <div>
            <h2 className="text-xl font-bold text-white">
              {user.full_name || user.username}
            </h2>
            <p className="text-sm text-white/40">@{user.username}</p>
            {user.bio && (
              <p className="mt-1 text-sm text-white/60">{user.bio}</p>
            )}
            {user.role === "admin" && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-400">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>
          <div className="ml-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/studio")}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Studio
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-4 sm:grid-cols-3">
        <div className="glass-card p-4 text-center">
          <Upload className="mx-auto mb-2 h-5 w-5 text-purple-400" />
          <p className="text-2xl font-bold text-white">{stats?.uploads ?? 0}</p>
          <p className="text-xs text-white/40">Uploads</p>
        </div>
        <Link
          href="/downloads"
          className="glass-card p-4 text-center transition-colors hover:bg-white/10"
        >
          <Download className="mx-auto mb-2 h-5 w-5 text-blue-400" />
          <p className="text-2xl font-bold text-white">{stats?.downloads ?? 0}</p>
          <p className="text-xs text-white/40">Downloads</p>
        </Link>
        <Link
          href="/favorites"
          className="glass-card p-4 text-center transition-colors hover:bg-white/10"
        >
          <Heart className="mx-auto mb-2 h-5 w-5 text-red-400" />
          <p className="text-2xl font-bold text-white">{stats?.favorites ?? 0}</p>
          <p className="text-xs text-white/40">Favorites</p>
        </Link>
      </div>

      <Tabs
        tabs={[
          { id: "uploads", label: "Uploads", icon: <Upload className="h-4 w-4" /> },
          { id: "favorites", label: "Favorites", icon: <Heart className="h-4 w-4" /> },
          { id: "downloads", label: "Downloads", icon: <Download className="h-4 w-4" /> },
        ]}
        onChange={(id) => {
          if (id === "favorites") router.push("/favorites");
          if (id === "downloads") router.push("/downloads");
        }}
      />
    </div>
  );
}
