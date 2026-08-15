"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useStudio } from "@/lib/hooks/useStudio";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { InlineAd } from "@/components/ads/inline-ad";
import { WallpaperUpload } from "@/components/admin/wallpaper-upload";
import { StudioProfileSettings } from "@/components/studio/studio-profile-settings";
import { PostComposer } from "@/components/posts/post-composer";
import {
  Sparkles,
  Upload,
  ImageIcon,
  Eye,
  Download,
  Heart,
  Clock,
  XCircle,
  Trash2,
  Pencil,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { wallpaperService } from "@/lib/services/wallpaper.service";
import { postService } from "@/lib/services/post.service";
import { Modal, ModalHeader, ModalContent, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import { toast } from "@/lib/utils/toast";
import type { Post } from "@/types";

export default function StudioPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { status, studioName, studioDescription, studioAvatarUrl, application, isLoading: studioLoading } = useStudio();  const [showUpload, setShowUpload] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileEditKey, setProfileEditKey] = useState(0);
  const [editingWp, setEditingWp] = useState<{ id: string; title: string; description: string; categories: { name: string; slug: string }[]; tags: { name: string; slug: string }[] } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [editTags, setEditTags] = useState("");
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [showAllWallpapers, setShowAllWallpapers] = useState(false);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [activeTab, setActiveTab] = useState<"wallpapers" | "posts">("wallpapers");
  const [addOpen, setAddOpen] = useState(false);

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

  const { data: myPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["studio-my-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      return postService.fetchMyPosts(user.id);
    },
    enabled: !!user && status === "approved",
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const result = await postService.deletePost(postId);
      if (!result.success) throw new Error(result.error || "Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-my-posts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
      toast.success("Post deleted");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async () => {
      if (!editingPost) throw new Error("No post selected");
      const result = await postService.updatePostCaption(editingPost.id, editCaption);
      if (!result.success) throw new Error(result.error || "Failed to update post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-my-posts", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["posts-feed"] });
      setEditingPost(null);
      toast.success("Post updated");
    },
    onError: () => {
      toast.error("Failed to update post");
    },
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

  const handleApply = () => {
    if (user) {
      router.push("/studio/apply");
    } else {
      router.push("/login?redirect=/studio/apply");
    }
  };

  if (authLoading || studioLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

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
        <Button size="lg" onClick={handleApply}>
          <Sparkles className="mr-2 h-4 w-4" />
          Apply for Studio
        </Button>
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
  if (!user) return null;

  return (
    <div>
      {/* Studio profile at the very top, without a surrounding box */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 shrink-0">
          <Avatar
            src={studioAvatarUrl}
            name={studioName || user.username}
            size="xl"
          />
        </div>
        <h3 className="text-2xl font-bold text-white">
          {studioName || user.username}
        </h3>
        <p className="mt-1 text-sm text-white/40">Studio Profile</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => {
            setShowProfileEdit(true);
            setProfileEditKey((k) => k + 1);
          }}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit Details
        </Button>
      </div>

      <StudioProfileSettings
        key={profileEditKey}
        user={user}
        studioName={studioName}
        studioDescription={studioDescription}
        studioAvatarUrl={studioAvatarUrl}
        open={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
      />

      {/* Stats squares */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <Link
          href={`/studio/${user.username}`}
          className="glass-card p-4 text-center transition-colors hover:bg-white/10"
        >
          <Download className="mx-auto mb-2 h-5 w-5 text-green-400" />
          <p className="text-2xl font-bold text-white">{stats?.downloads ?? 0}</p>
          <p className="text-xs text-white/40">Downloads</p>
        </Link>
        <div className="glass-card p-4 text-center">
          <Eye className="mx-auto mb-2 h-5 w-5 text-blue-400" />
          <p className="text-2xl font-bold text-white">{stats?.views ?? 0}</p>
          <p className="text-xs text-white/40">Views</p>
        </div>
        <Link
          href={`/studio/${user.username}`}
          className="glass-card p-4 text-center transition-colors hover:bg-white/10"
        >
          <ImageIcon className="mx-auto mb-2 h-5 w-5 text-purple-400" />
          <p className="text-2xl font-bold text-white">{stats?.uploads ?? 0}</p>
          <p className="text-xs text-white/40">Uploads</p>
        </Link>
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} size="lg">
        <ModalHeader>
          <h3 className="text-lg font-semibold text-white">Upload Wallpaper</h3>
        </ModalHeader>
        <ModalContent className="max-h-[80vh] overflow-y-auto">
          <WallpaperUpload
            key={uploadKey}
            onComplete={() => {
              setShowUpload(false);
            }}
          />
        </ModalContent>
      </Modal>

      {/* Panel: section tabs with the center add button */}
      <div className="glass-card mb-8 overflow-hidden">
        <div className="flex items-stretch border-b border-white/10">
          <button
            onClick={() => setActiveTab("wallpapers")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "wallpapers"
                ? "bg-white/5 text-white"
                : "text-white/40 hover:text-white/70",
            )}
          >
            Your Wallpapers
          </button>
          <div className="relative flex w-14 shrink-0 items-center justify-center">
            {status === "approved" && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                onClick={() => setAddOpen((v) => !v)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-white transition-all duration-300",
                  "bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30",
                  addOpen && "rotate-45",
                )}
                title={addOpen ? "Close" : "Add"}
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            )}
          </div>
          <button
            onClick={() => setActiveTab("posts")}
            className={cn(
              "flex-1 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === "posts"
                ? "bg-white/5 text-white"
                : "text-white/40 hover:text-white/70",
            )}
          >
            Your Posts
          </button>
        </div>

        <AnimatePresence>
          {addOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-b border-white/10"
            >
              <div className="flex items-center justify-center gap-2 p-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setAddOpen(false);
                    setUploadKey((k) => k + 1);
                    setShowUpload(true);
                  }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Wallpaper
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25"
                  onClick={() => {
                    setAddOpen(false);
                    setShowComposer(true);
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  نشر بوست
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-5">
          {activeTab === "wallpapers" ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-white/40">
                  {myWallpapers?.length ?? 0}{" "}
                  {myWallpapers?.length === 1 ? "wallpaper" : "wallpapers"}
                </p>
                {myWallpapers && myWallpapers.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllWallpapers((v) => !v)}
                  >
                    {showAllWallpapers ? "Show Less" : "View All"}
                    <ArrowRight
                      className={`ml-1.5 h-3.5 w-3.5 transition-transform ${showAllWallpapers ? "rotate-180" : ""}`}
                    />
                  </Button>
                )}
              </div>
              {wallpapersLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : !myWallpapers || myWallpapers.length === 0 ? (
                <p className="text-sm text-white/40">
                  No wallpapers uploaded yet. Tap the &quot;+&quot; button to upload.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {myWallpapers.slice(0, showAllWallpapers ? undefined : 2).map((wp) => (
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
                      <div className="absolute left-2 top-2 flex gap-1 md:opacity-0 md:transition-all md:group-hover:opacity-100">
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
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs text-white/40">
                  {myPosts?.length ?? 0} {myPosts?.length === 1 ? "post" : "posts"}
                </p>
                {myPosts && myPosts.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllPosts((v) => !v)}
                  >
                    {showAllPosts ? "Show Less" : "View All"}
                    <ArrowRight
                      className={`ml-1.5 h-3.5 w-3.5 transition-transform ${showAllPosts ? "rotate-180" : ""}`}
                    />
                  </Button>
                )}
              </div>
              {postsLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-white/5" />
                  ))}
                </div>
              ) : !myPosts || myPosts.length === 0 ? (
                <p className="text-sm text-white/40">
                  No posts yet. Tap the &quot;+&quot; button to publish your first post.
                </p>
              ) : (
                <div className="space-y-3">
                  {myPosts.slice(0, showAllPosts ? undefined : 2).map((post) => (
                    <div key={post.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <Link href={`/posts`} className="flex shrink-0 gap-1">
                        {(post.images ?? []).slice(0, 3).map((img) => (
                          <div
                            key={img.id}
                            className="h-12 w-12 overflow-hidden rounded-lg border border-white/10"
                          >
                            <img
                              src={img.wallpaper?.thumbnail_url || img.wallpaper?.preview_url || ""}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        {(post.images?.length ?? 0) > 3 && (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/40 text-xs font-semibold text-white">
                            +{(post.images?.length ?? 0) - 3}
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {post.caption || "No caption"}
                        </p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {(post.images?.length ?? 0)} images · {post.like_count ?? 0} likes · {post.save_count ?? 0} saves
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setEditCaption(post.caption ?? "");
                          }}
                          className="rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-blue-500/80 hover:text-white"
                          title="Edit post"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this post?")) {
                              deletePostMutation.mutate(post.id);
                            }
                          }}
                          className="rounded-lg bg-white/5 p-2 text-white/50 transition-colors hover:bg-red-500/80 hover:text-white"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="pt-2">
        <InlineAd boxClassName="aspect-[6/5] max-w-[300px] mx-auto" />
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

      <Modal open={!!editingPost} onClose={() => setEditingPost(null)}>
        <ModalHeader>
          <h3 className="text-lg font-semibold text-white">Edit Post</h3>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Caption</label>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              placeholder="Post caption"
              rows={4}
              className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 backdrop-blur-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 hover:border-white/20"
            />
          </div>
          {editingPost && (editingPost.images?.length ?? 0) > 0 && (
            <p className="text-xs text-white/40">
              {editingPost.images?.length} image(s) in this post. Wallpapers are managed from &quot;Your Wallpapers&quot;.
            </p>
          )}
        </ModalContent>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setEditingPost(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => updatePostMutation.mutate()}
            disabled={updatePostMutation.isPending}
          >
            {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </ModalFooter>
      </Modal>

      <PostComposer open={showComposer} onClose={() => setShowComposer(false)} />
    </div>
  );
}
