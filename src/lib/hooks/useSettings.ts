'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME } from '@/lib/constants'

export function useSettings() {
  const supabase = createClient()

  const { data: siteName } = useQuery({
    queryKey: ['settings-site-name'],
    queryFn: async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'site_name')
        .single()
      return (data?.value as string) ?? APP_NAME
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return { siteName: siteName ?? APP_NAME }
}
