"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils";

export default function DownloadsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/downloads");
    }
  }, [user, authLoading, router]);

  const { data: downloads, isLoading } = useQuery({
    queryKey: ["downloads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("downloads")
        .select("*, wallpaper:wallpapers(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  if (authLoading || !user) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  const qualityLabels: Record<string, string> = {
    low: "Standard",
    hd: "HD",
    original: "Original",
  };

  return (
    <div>
      <PageHeader
        title="Download History"
        description="Your recent wallpaper downloads"
        breadcrumbs={[{ label: "Downloads", href: "/downloads" }]}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : !downloads || downloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
            <Download className="h-7 w-7 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white">No downloads yet</h3>
          <p className="mt-1 text-sm text-white/40">
            Start downloading wallpapers to see them here.
          </p>
          <Button onClick={() => router.push("/browse")} className="mt-4">
            Browse Wallpapers
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {downloads.map((dl) => (
            <div
              key={dl.id}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-colors hover:bg-white/[0.05]"
            >
              {dl.wallpaper && (
                <img
                  src={dl.wallpaper.thumbnail_url || dl.wallpaper.preview_url || ""}
                  alt={dl.wallpaper.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {dl.wallpaper?.title || "Untitled"}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge color="default">{qualityLabels[dl.quality] || dl.quality}</Badge>
                  <span className="text-xs text-white/30">{formatDate(dl.created_at)}</span>
                  {dl.wallpaper?.hd_file_size && (
                    <span className="text-xs text-white/30">
                      {formatFileSize(dl.wallpaper.hd_file_size)}
                    </span>
                  )}
                </div>
              </div>
              <a href={`/wallpaper/${dl.wallpaper_id}`}>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
