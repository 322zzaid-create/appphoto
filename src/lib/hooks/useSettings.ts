'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { APP_NAME, APP_DESCRIPTION } from '@/lib/constants'

interface AppSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  autoApproveUploads: boolean
}

export function useSettings() {
  const supabase = createClient()

  const { data, isLoading } = useQuery<AppSettings>({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('app_settings').select('key, value')
      const map: Record<string, unknown> = {}
      for (const row of data ?? []) {
        map[row.key] = row.value
      }
      return {
        siteName: String(map.site_name ?? APP_NAME),
        siteDescription: String(map.site_description ?? APP_DESCRIPTION),
        maintenanceMode: map.maintenance_mode === true,
        autoApproveUploads: map.auto_approve_uploads === true,
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  return {
    siteName: data?.siteName ?? APP_NAME,
    siteDescription: data?.siteDescription ?? APP_DESCRIPTION,
    maintenanceMode: data?.maintenanceMode ?? false,
    autoApproveUploads: data?.autoApproveUploads ?? true,
    isLoading,
  }
}
