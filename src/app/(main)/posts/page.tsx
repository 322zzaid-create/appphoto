"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { PageHeader } from "@/components/layout/page-header";
import { PostCard } from "@/components/posts/post-card";
import { usePosts } from "@/lib/hooks/usePosts";
import { useAuth } from "@/lib/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Newspaper } from "lucide-react";

export default function PostsPage() {
  const { user } = useAuth();
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

  return (
    <div>
      <PageHeader
        title="Posts"
        description="Latest posts from studios"
        breadcrumbs={[{ label: "Posts", href: "/posts" }]}
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
              Posts from studios will appear here.
            </p>
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
    </div>
  );
}
