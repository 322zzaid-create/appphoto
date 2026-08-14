"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star, StarOff } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "@/lib/utils/toast";
import type { Wallpaper } from "@/types";

export default function AdminWallpapersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: wallpapers = [] } = useQuery({
    queryKey: ["admin-wallpapers", statusFilter],
    queryFn: async (): Promise<Wallpaper[]> => {
      let query = supabase
        .from("wallpapers")
        .select("*, uploader:profiles!wallpapers_uploader_id_fkey(id, username, full_name, avatar_url)")
        .order("created_at", { ascending: false });
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wallpapers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-wallpapers"] });
      toast.success("Wallpaper deleted");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("wallpapers")
        .update({ status, ...(status === "published" ? { published_at: new Date().toISOString() } : {}) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-wallpapers"] });
      toast.success("Status updated");
    },
  });

  const featuredMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from("wallpapers")
        .update({ is_featured: featured, featured_at: featured ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-wallpapers"] });
      toast.success("Featured status updated");
    },
  });

  const statusColors: Record<string, "green" | "yellow" | "red" | "default"> = {
    published: "green",
    draft: "default",
    archived: "red",
    rejected: "red",
  };

  const columns: Column<Wallpaper>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (wp) => (
        <div className="flex items-center gap-3">
          <img
            src={wp.thumbnail_url || wp.preview_url || ""}
            alt={wp.title}
            className="h-10 w-10 shrink-0 rounded-lg object-cover"
          />
          <span className="truncate font-medium text-white">{wp.title}</span>
        </div>
      ),
    },
    {
      key: "uploader",
      label: "Uploader",
      render: (wp) => (
        <span className="text-white/60">
          {wp.uploader?.full_name || wp.uploader?.username || "Unknown"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (wp) => (
        <Badge color={statusColors[wp.status] || "default"}>
          {wp.status}
        </Badge>
      ),
    },
    {
      key: "view_count",
      label: "Views",
      sortable: true,
      render: (wp) => <span className="text-white/50">{wp.view_count.toLocaleString()}</span>,
    },
    {
      key: "download_count",
      label: "Downloads",
      sortable: true,
      render: (wp) => <span className="text-white/50">{wp.download_count.toLocaleString()}</span>,
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (wp) => <span className="text-white/40 text-xs">{formatDate(wp.created_at)}</span>,
    },
    {
      key: "actions",
      label: "",
      render: (wp) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              featuredMutation.mutate({ id: wp.id, featured: !wp.is_featured })
            }
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-yellow-400"
            title={wp.is_featured ? "Unfeature" : "Feature"}
          >
            {wp.is_featured ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </button>
          <select
            value={wp.status}
            onChange={(e) =>
              statusMutation.mutate({ id: wp.id, status: e.target.value })
            }
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/70 focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => {
              if (confirm("Delete this wallpaper?")) {
                deleteMutation.mutate(wp.id);
              }
            }}
            className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Wallpapers"
        description="Manage all wallpapers"
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Wallpapers", href: "/admin/wallpapers" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={wallpapers}
        searchPlaceholder="Search wallpapers..."
      />
    </div>
  );
}
