"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Bookmark, Download, Shield, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { InlineAd } from "@/components/ads/inline-ad";

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
      const [downloads, favorites] = await Promise.all([
        supabase.from("downloads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      return {
        downloads: downloads.count ?? 0,
        favorites: favorites.count ?? 0,
      };
    },
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-24 w-24 animate-pulse rounded-full bg-white/5" />
        <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
        <div className="h-40 animate-pulse rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div>
      {/* Profile at the top, mirroring the studio layout */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 shrink-0">
          <Avatar
            src={user.avatar_url}
            name={user.full_name || user.username}
            size="xl"
          />
        </div>
        <h3 className="text-2xl font-bold text-white">
          {user.full_name || user.username}
        </h3>
        <p className="mt-1 text-sm text-white/40">@{user.username}</p>
        <div className="mt-3">
          {user.role === "admin" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400 ring-1 ring-purple-500/30">
              <Shield className="h-3 w-3" />
              Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-white/60 ring-1 ring-white/10">
              <User className="h-3 w-3 text-white/40" />
              User
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Link
          href="/favorites"
          className="glass-card p-4 text-center transition-colors hover:bg-white/10"
        >
          <Bookmark className="mx-auto mb-2 h-5 w-5 text-purple-400" />
          <p className="text-2xl font-bold text-white">{stats?.favorites ?? 0}</p>
          <p className="text-xs text-white/40">Saved</p>
        </Link>
        <Link
          href="/downloads"
          className="glass-card p-4 text-center transition-colors hover:bg-white/10"
        >
          <Download className="mx-auto mb-2 h-5 w-5 text-blue-400" />
          <p className="text-2xl font-bold text-white">{stats?.downloads ?? 0}</p>
          <p className="text-xs text-white/40">Downloads</p>
        </Link>
      </div>

      <InlineAd boxClassName="aspect-[6/5] max-w-[300px] mx-auto" />
    </div>
  );
}
