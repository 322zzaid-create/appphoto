"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useStudio } from "@/lib/hooks/useStudio";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WallpaperUpload } from "@/components/admin/wallpaper-upload";
import { StudioProfileSettings } from "@/components/studio/studio-profile-settings";
import {
  Sparkles,
  Upload,
  Image,
  Eye,
  Download,
  Heart,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { wallpaperService } from "@/lib/services/wallpaper.service";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import toast from "react-hot-toast";

export default function StudioPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { status, studioName, studioDescription, studioAvatarUrl, application, isLoading: studioLoading } = useStudio();  const [showUpload, setShowUpload] = useState(false);
  const [editingWp, setEditingWp] = useState<{ id: string; title: string; description: string; categories: { name: string; slug: string }[]; tags: { name: string; slug: string }[] } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editTags, setEditTags] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/studio");
    }
  }, [user, authLoading, router]);

  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: myWallpapers, isLoading: wallpapersLoading } = useQuery({
    queryKey: ["studio-my-wallpapers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("wallpapers")
        .select("id, title, description, categories, tags, thumbnail_url, preview_url, status, view_count, download_count, like_count, created_at")
        .eq("uploader_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && status === "approved",
  });

  const deleteMutation = useMutation({
    mutationFn: async (wallpaperId: string) => {
      if (!user) throw new Error("Not authenticated");
      await wallpaperService.deleteOwn(wallpaperId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-my-wallpapers", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["studio-stats", user?.id] });
      toast.success("Wallpaper deleted");
    },
    onError: () => {
      toast.error("Failed to delete wallpaper");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user || !editingWp) throw new Error("Not authenticated");
      await wallpaperService.editOwn(editingWp.id, user.id, {
        title: editTitle,
        description: editDescription,
        categories: editCategories.map((c) => ({ name: c, slug: c })),
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => ({ name: t, slug: t })),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-my-wallpapers", user?.id] });
      setEditingWp(null);
      toast.success("Wallpaper updated");
    },
    onError: () => {
      toast.error("Failed to update wallpaper");
    },
  });

  function openEdit(wp: { id: string; title: string; description?: string | null; categories?: unknown; tags?: unknown }) {
    setEditingWp({
      id: wp.id,
      title: wp.title,
      description: (wp as Record<string, unknown>).description as string ?? "",
      categories: Array.isArray(wp.categories) ? (wp.categories as { slug: string }[]).map((c) => ({ name: c.slug, slug: c.slug })) : [],
      tags: Array.isArray(wp.tags) ? (wp.tags as { name: string }[]).map((t) => ({ name: t.name, slug: t.name })) : [],
    });
    setEditTitle(wp.title);
    setEditDescription((wp as Record<string, unknown>).description as string ?? "");
    const cats = wp.categories;
    if (Array.isArray(cats)) {
      setEditCategories(cats.map((c: unknown) => {
        if (typeof c === "object" && c !== null) return (c as { slug: string }).slug;
        return String(c);
      }));
    } else {
      setEditCategories([]);
    }
    const tags = wp.tags;
    if (Array.isArray(tags)) {
      setEditTags(tags.map((t: unknown) => {
        if (typeof t === "object" && t !== null) return (t as { name: string }).name;
        return String(t);
      }).join(", "));
    } else {
      setEditTags("");
    }
  }

  const { data: stats } = useQuery({
    queryKey: ["studio-stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [uploads, totalViews, totalDownloads] = await Promise.all([
        supabase
          .from("wallpapers")
          .select("id", { count: "exact", head: true })
          .eq("uploader_id", user.id),
        supabase
          .from("wallpapers")
          .select("view_count")
          .eq("uploader_id", user.id),
        supabase
          .from("wallpapers")
          .select("download_count")
          .eq("uploader_id", user.id),
      ]);

      const totalViewsSum =
        totalViews.data?.reduce((sum, w) => sum + (w.view_count ?? 0), 0) ?? 0;
      const totalDownloadsSum =
        totalDownloads.data?.reduce((sum, w) => sum + (w.download_count ?? 0), 0) ?? 0;

      return {
        uploads: uploads.count ?? 0,
        views: totalViewsSum,
        downloads: totalDownloadsSum,
      };
    },
    enabled: !!user && status === "approved",
  });

  if (authLoading || studioLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (!user) return null;

  // Not applied yet
  if (status === "none") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <Sparkles className="h-9 w-9 text-purple-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">
          Open Your Studio
        </h2>
        <p className="mb-8 max-w-md text-center text-sm text-white/40">
          Start sharing your wallpapers with the world. Upload your work, build
          your audience, and earn money from your creativity.
        </p>
        <Link href="/studio/apply">
          <Button size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Apply for Studio
          </Button>
        </Link>
      </div>
    );
  }

  // Pending
  if (status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-500/10">
          <Clock className="h-9 w-9 text-yellow-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">
          Application Under Review
        </h2>
        <p className="mb-4 max-w-md text-center text-sm text-white/40">
          Your studio application is being reviewed by our team. We&apos;ll notify
          you once a decision is made.
        </p>
        <Badge color="yellow">
          <Clock className="mr-1 h-3 w-3" />
          Pending Review
        </Badge>
        {application?.admin_notes && (
          <div className="mt-6 max-w-md rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-white/30">Admin Note:</p>
            <p className="mt-1 text-sm text-white/60">{application.admin_notes}</p>
          </div>
        )}
      </div>
    );
  }

  // Rejected
  if (status === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10">
          <XCircle className="h-9 w-9 text-red-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white">
          Application Rejected
        </h2>
        <p className="mb-4 max-w-md text-center text-sm text-white/40">
          Your studio application was not approved at this time. You can re-apply
          after reviewing the feedback below.
        </p>
        <Badge color="red">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
        {application?.admin_notes && (
          <div className="mt-6 max-w-md rounded-xl border border-red-500/10 bg-red-500/5 p-4">
            <p className="text-xs text-red-400/60">Feedback:</p>
            <p className="mt-1 text-sm text-white/60">{application.admin_notes}</p>
          </div>
        )}
        <Link href="/studio/apply" className="mt-6">
          <Button>Re-apply</Button>
        </Link>
      </div>
    );
  }

  // Approved - Show studio dashboard
  return (
    <div>
      <PageHeader
        title={`Studio: ${studioName || user.username}`}
        description="Manage your studio and upload wallpapers"
        breadcrumbs={[
          { label: "Studio", href: "/studio" },
        ]}
        actions={
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="mr-2 h-4 w-4" />
            {showUpload ? "Close Upload" : "Upload Wallpaper"}
          </Button>
        }
      />

      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="glass-card p-4 text-center">
          <Image className="mx-auto mb-2 h-5 w-5 text-purple-400" />
          <p className="text-2xl font-bold text-white">{stats?.uploads ?? 0}</p>
          <p className="text-xs text-white/40">Uploads</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Eye className="mx-auto mb-2 h-5 w-5 text-blue-400" />
          <p className="text-2xl font-bold text-white">{stats?.views ?? 0}</p>
          <p className="text-xs text-white/40">Views</p>
        </div>
        <div className="glass-card p-4 text-center">
          <Download className="mx-auto mb-2 h-5 w-5 text-green-400" />
          <p className="text-2xl font-bold text-white">{stats?.downloads ?? 0}</p>
          <p className="text-xs text-white/40">Downloads</p>
        </div>
      </div>

      {showUpload && (
        <div className="glass-card mb-8 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Upload Wallpaper</h3>
          <WallpaperUpload
            onComplete={() => {
              setShowUpload(false);
            }}
          />
        </div>
      )}

      <div className="mb-8">
        <StudioProfileSettings
          user={user}
          studioName={studioName}
          studioDescription={studioDescription}
          studioAvatarUrl={studioAvatarUrl}
        />
      </div>

      <div className="glass-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Your Wallpapers</h3>
        {wallpapersLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        ) : !myWallpapers || myWallpapers.length === 0 ? (
          <p className="text-sm text-white/40">
            No wallpapers uploaded yet. Click &quot;Upload Wallpaper&quot; to get started.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {myWallpapers.map((wp) => (
              <div key={wp.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Link href={`/wallpaper/${wp.id}`}>
                  <div className="aspect-[3/4] w-full">
                    <img
                      src={wp.thumbnail_url || wp.preview_url || ""}
                      alt={wp.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-xs font-medium text-white line-clamp-1">{wp.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" /> {wp.view_count ?? 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Download className="h-2.5 w-2.5" /> {wp.download_count ?? 0}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" /> {wp.like_count ?? 0}
                    </span>
                  </div>
                </div>
                <div className="absolute right-2 top-2">
                  <Badge color={wp.status === "published" ? "green" : wp.status === "draft" ? "yellow" : "default"}>
                    {wp.status}
                  </Badge>
                </div>
                <div className="absolute left-2 top-2 flex gap-1 opacity-0 transition-all group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(wp)}
                    className="rounded-lg bg-black/60 p-1.5 text-white/50 hover:bg-blue-500/80 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this wallpaper?")) {
                        deleteMutation.mutate(wp.id);
                      }
                    }}
                    className="rounded-lg bg-black/60 p-1.5 text-white/50 hover:bg-red-500/80 hover:text-white"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!editingWp} onClose={() => setEditingWp(null)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-white">Edit Wallpaper</h3>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Wallpaper title"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Description <span className="text-white/30">(optional)</span></label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-white/80">Categories</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() =>
                    setEditCategories((prev) =>
                      prev.includes(cat.slug)
                        ? prev.filter((c) => c !== cat.slug)
                        : [...prev, cat.slug]
                    )
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    editCategories.includes(cat.slug)
                      ? "border-purple-500/50 bg-purple-500/20 text-purple-300"
                      : "border-white/10 bg-white/5 text-white/50 hover:border-white/20"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <Input
            label="Tags"
            value={editTags}
            onChange={(e) => setEditTags(e.target.value)}
            placeholder="nature, landscape, 4k (comma separated)"
          />
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditingWp(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={!editTitle.trim() || updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
