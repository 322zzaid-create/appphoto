import { createAdminClient } from '@/lib/supabase/admin'
import type {
  AdminStats,
  Wallpaper,
  Profile,
  Category,
  Download,
} from '@/types'

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const supabase = createAdminClient()

    const [
      { count: totalUsers },
      { count: totalWallpapers },
      { count: totalDownloads },
      { count: totalLikes },
      { count: activeUsersToday },
      { count: newUsersThisWeek },
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('wallpapers').select('id', { count: 'exact', head: true }),
      supabase.from('downloads').select('id', { count: 'exact', head: true }),
      supabase.from('likes').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('updated_at', new Date().toISOString().split('T')[0]),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    const { data: topWallpapers } = await supabase
      .from('wallpapers')
      .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(10)

    const { data: topCategories } = await supabase
      .from('categories')
      .select('*')
      .order('wallpaper_count', { ascending: false })
      .limit(10)

    const { data: recentDownloads } = await supabase
      .from('downloads')
      .select('*, wallpaper:wallpapers(*)')
      .order('created_at', { ascending: false })
      .limit(20)

    return {
      total_users: totalUsers ?? 0,
      total_wallpapers: totalWallpapers ?? 0,
      total_downloads: totalDownloads ?? 0,
      total_views: 0,
      total_likes: totalLikes ?? 0,
      total_revenue: 0,
      active_users_today: activeUsersToday ?? 0,
      new_users_this_week: newUsersThisWeek ?? 0,
      top_wallpapers: (topWallpapers ?? []) as Wallpaper[],
      top_categories: (topCategories ?? []) as Category[],
      recent_downloads: (recentDownloads ?? []) as Download[],
    }
  },

  async getRecentWallpapers(limit: number = 20): Promise<Wallpaper[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as Wallpaper[]
  },

  async getRecentUsers(limit: number = 20): Promise<Profile[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data ?? []) as Profile[]
  },

  async getDownloadStats(days: number = 30) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('downloads')
      .select('created_at, quality')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (error) throw error

    const byDay: Record<string, number> = {}
    const byQuality: Record<string, number> = {}

    for (const download of data ?? []) {
      const day = download.created_at.split('T')[0]
      byDay[day] = (byDay[day] ?? 0) + 1
      byQuality[download.quality] = (byQuality[download.quality] ?? 0) + 1
    }

    return { byDay, byQuality, total: data?.length ?? 0 }
  },

  async getUserGrowthStats(days: number = 30) {
    const supabase = createAdminClient()
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    if (error) throw error

    const byDay: Record<string, number> = {}
    for (const user of data ?? []) {
      const day = user.created_at.split('T')[0]
      byDay[day] = (byDay[day] ?? 0) + 1
    }

    return { byDay, total: data?.length ?? 0 }
  },

  async getStorageUsage() {
    const supabase = createAdminClient()
    const { data, error } = await supabase.storage.listBuckets()
    if (error) throw error

    const usage: Record<string, number> = {}
    for (const bucket of data) {
      const { data: files } = await supabase.storage.from(bucket.name).list('', { limit: 1000 })
      const totalSize = files?.reduce((sum, file) => sum + (file.metadata?.size ?? 0), 0) ?? 0
      usage[bucket.name] = totalSize
    }

    return { buckets: data.map((b) => b.name), usage, total: Object.values(usage).reduce((a, b) => a + b, 0) }
  },
}
