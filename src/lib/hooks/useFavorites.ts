'use client'

import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { Favorite } from '@/types'

export function useFavorites() {
  const { user } = useAuth()
  const supabase = createClient()
  const queryClient = useQueryClient()

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<Favorite[]> => {
      if (!user) return []
      const { data, error } = await supabase
        .from('favorites')
        .select('*, wallpaper:wallpapers(*, uploader:profiles!wallpapers_uploader_id_fkey(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ['favoriteIds', user?.id],
    queryFn: async (): Promise<string[]> => {
      if (!user) return []
      const { data } = await supabase
        .from('favorites')
        .select('wallpaper_id')
        .eq('user_id', user.id)
      return data?.map((f) => f.wallpaper_id) ?? []
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const addFavorite = useMutation({
    mutationFn: async (wallpaperId: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('favorites').insert({
        user_id: user.id,
        wallpaper_id: wallpaperId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favoriteIds', user?.id] })
    },
  })

  const removeFavorite = useMutation({
    mutationFn: async (wallpaperId: string) => {
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('wallpaper_id', wallpaperId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['favoriteIds', user?.id] })
    },
  })

  const toggleFavorite = useCallback(
    (wallpaperId: string) => {
      if (favoriteIds.includes(wallpaperId)) {
        removeFavorite.mutate(wallpaperId)
      } else {
        addFavorite.mutate(wallpaperId)
      }
    },
    [favoriteIds, addFavorite, removeFavorite]
  )

  const isFavorited = useCallback(
    (wallpaperId: string) => favoriteIds.includes(wallpaperId),
    [favoriteIds]
  )

  return {
    favorites,
    favoriteIds,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
  }
}
