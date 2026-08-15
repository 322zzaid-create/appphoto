'use client'

import { useMemo } from 'react'
import {
  useQuery,
  useMutation,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { postService, POSTS_PAGE_SIZE } from '@/lib/services/post.service'

export function usePosts() {
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const feed = useInfiniteQuery({
    queryKey: ['posts-feed'],
    queryFn: ({ pageParam }) =>
      postService.fetchPosts({
        from: pageParam,
        to: pageParam + POSTS_PAGE_SIZE - 1,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0)
      return loaded < lastPage.count ? loaded : undefined
    },
    staleTime: 30 * 1000,
  })

  const { data: likedPostIds = [] } = useQuery({
    queryKey: ['post-liked-ids', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return []
      const { data } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
      return data?.map((r) => r.post_id) ?? []
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const { data: savedPostIds = [] } = useQuery({
    queryKey: ['post-saved-ids', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return []
      const { data } = await supabase
        .from('post_saves')
        .select('post_id')
        .eq('user_id', user.id)
      return data?.map((r) => r.post_id) ?? []
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const likePost = useMutation({
    mutationFn: async ({ postId, like }: { postId: string; like: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (like) {
        const { error } = await supabase
          .from('post_likes')
          .insert({ user_id: user.id, post_id: postId })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-liked-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['posts-feed'] })
    },
  })

  const savePost = useMutation({
    mutationFn: async ({ postId, save }: { postId: string; save: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (save) {
        const { error } = await supabase
          .from('post_saves')
          .insert({ user_id: user.id, post_id: postId })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('post_saves')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-saved-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['posts-feed'] })
    },
  })

  const posts = useMemo(
    () => feed.data?.pages.flatMap((page) => page.data) ?? [],
    [feed.data],
  )

  return {
    posts,
    ...feed,
    likedPostIds,
    savedPostIds,
    likePost,
    savePost,
  }
}
