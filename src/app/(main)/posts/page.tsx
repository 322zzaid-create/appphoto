"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/posts/post-card";
import { PostComposer } from "@/components/posts/post-composer";
import { usePosts } from "@/lib/hooks/usePosts";
import { useAuth } from "@/lib/hooks/useAuth";
import { useStudio } from "@/lib/hooks/useStudio";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2, Newspaper } from "lucide-react";
import { toast } from "@/lib/utils/toast";

export default function PostsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { status: studioStatus } = useStudio();
  const [composerOpen, setComposerOpen] = useState(false);
  const {
    posts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    likedPostIds,
    savedPostIds,
    likePost,
    savePost,
  } = usePosts();

  const { ref: sentinelRef, inView } = useInView({
    rootMargin: "400px 0px",
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const openComposer = useCallback(() => {
    if (!user) {
      router.push("/login?redirect=/posts");
      return;
    }
    if (studioStatus !== "approved") {
      toast.error("Only approved studio creators can publish posts");
      return;
    }
    setComposerOpen(true);
  }, [user, studioStatus, router]);

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Latest posts from studios"
        breadcrumbs={[{ label: "Posts", href: "/posts" }]}
        actions={
          <Button
            onClick={openComposer}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            نشر بوست
          </Button>
        }
      />

      <div className="mx-auto max-w-2xl space-y-6">
        {isLoading && posts.length === 0 ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
              >
                <div className="flex items-center gap-3 p-4">
                  <Skeleton className="h-11 w-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="aspect-[4/5] w-full sm:aspect-[16/11]" />
                <div className="flex gap-2 p-3">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
              <Newspaper className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">No posts yet</h3>
            <p className="mt-1 max-w-sm text-sm text-white/40">
              Studios share their work here. Be the first to publish a post!
            </p>
            <Button
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40"
              onClick={openComposer}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              نشر بوست
            </Button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiked={likedPostIds.includes(post.id)}
                isSaved={savedPostIds.includes(post.id)}
                isAuthenticated={!!user}
                onLike={(postId, wasLiked) =>
                  likePost.mutate({ postId, like: !wasLiked })
                }
                onSave={(postId, wasSaved) =>
                  savePost.mutate({ postId, save: !wasSaved })
                }
              />
            ))}

            {hasNextPage && (
              <div
                ref={sentinelRef}
                className="flex h-16 items-center justify-center"
              >
                {isFetchingNextPage && (
                  <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                )}
              </div>
            )}

            {!hasNextPage && (
              <p className="py-4 text-center text-xs text-white/30">
                You&apos;re all caught up
              </p>
            )}
          </>
        )}
      </div>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
    </div>
  );
}
