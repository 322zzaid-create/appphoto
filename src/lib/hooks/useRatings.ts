'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

interface UseRatingsReturn {
  userRating: number | null
  avgRating: number
  ratingCount: number
  isLoading: boolean
  rate: (rating: number) => Promise<{ error?: string }>
  isPending: boolean
}

export function useRatings(wallpaperId: string, avgRating: number = 0, ratingCount: number = 0): UseRatingsReturn {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data: userRating, isLoading } = useQuery({
    queryKey: ['rating', wallpaperId, user?.id],
    queryFn: async (): Promise<number | null> => {
      if (!user) return null
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('wallpaper_id', wallpaperId)
        .eq('user_id', user.id)
        .maybeSingle()
      return data?.rating ?? null
    },
    enabled: !!user && !!wallpaperId,
    staleTime: 60 * 1000,
  })

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!user) return { error: 'Not authenticated' }

      const { error } = await supabase
        .from('ratings')
        .upsert({
          user_id: user.id,
          wallpaper_id: wallpaperId,
          rating,
        }, { onConflict: 'user_id,wallpaper_id' })

      if (error) return { error: error.message }
      return {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rating', wallpaperId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallpaper', wallpaperId] })
    },
  })

  return {
    userRating: userRating ?? null,
    avgRating,
    ratingCount,
    isLoading,
    rate: rateMutation.mutateAsync,
    isPending: rateMutation.isPending,
  }
}
