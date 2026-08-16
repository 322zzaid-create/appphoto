'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import { postService } from '@/lib/services/post.service'
import type { Post } from '@/types'

export function useSavedPosts() {
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['saved-posts', user?.id],
    queryFn: async (): Promise<Post[]> => {
      if (!user) return []
      return postService.fetchSavedPosts(user.id)
    },
    enabled: !!user,
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

  const likePost = useMutation({
    mutationFn: async ({
      postId,
      like,
    }: {
      postId: string
      like: boolean
    }) => {
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
      queryClient.invalidateQueries({ queryKey: ['saved-posts', user?.id] })
    },
  })

  const removeSavedPost = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('post_saves')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-posts', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['post-saved-ids', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['posts-feed'] })
    },
  })

  return {
    posts,
    isLoading,
    likedPostIds,
    likePost,
    removeSavedPost,
  }
}
