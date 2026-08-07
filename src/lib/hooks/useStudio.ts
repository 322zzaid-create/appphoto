'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { StudioApplication, StudioStatus } from '@/types'

interface UseStudioReturn {
  status: StudioStatus
  studioName: string | null
  studioDescription: string | null
  studioAvatarUrl: string | null
  application: StudioApplication | null
  isLoading: boolean
  apply: (data: { studio_name: string; studio_description: string; reason: string }) => Promise<{ error?: string }>
  isPending: boolean
}

export function useStudio(): UseStudioReturn {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const supabase = createClient()

  const { data, isLoading } = useQuery({
    queryKey: ['studio', user?.id],
    queryFn: async (): Promise<{ status: StudioStatus; studioName: string | null; studioDescription: string | null; studioAvatarUrl: string | null; application: StudioApplication | null }> => {
      if (!user) return { status: 'none', studioName: null, studioDescription: null, studioAvatarUrl: null, application: null }

      const { data: profile } = await supabase
        .from('profiles')
        .select('studio_status, studio_name, studio_description, studio_avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      const { data: app } = await supabase
        .from('studio_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        status: profile?.studio_status || 'none',
        studioName: profile?.studio_name || null,
        studioDescription: profile?.studio_description || null,
        studioAvatarUrl: profile?.studio_avatar_url || null,
        application: app as StudioApplication | null,
      }
    },
    enabled: !!user,
    staleTime: 30 * 1000,
  })

  const applyMutation = useMutation({
    mutationFn: async (formData: { studio_name: string; studio_description: string; reason: string }) => {
      if (!user) return { error: 'Not authenticated' }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          studio_status: 'pending',
          studio_name: formData.studio_name,
          studio_description: formData.studio_description,
        })
        .eq('id', user.id)

      if (updateError) return { error: updateError.message }

      const { error } = await supabase
        .from('studio_applications')
        .insert({
          user_id: user.id,
          studio_name: formData.studio_name,
          studio_description: formData.studio_description,
          reason: formData.reason,
        })

      if (error) return { error: error.message }
      return {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studio', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
    },
  })

  return {
    status: data?.status || 'none',
    studioName: data?.studioName || null,
    studioDescription: data?.studioDescription || null,
    studioAvatarUrl: data?.studioAvatarUrl || null,
    application: data?.application || null,
    isLoading,
    apply: applyMutation.mutateAsync,
    isPending: applyMutation.isPending,
  }
}
