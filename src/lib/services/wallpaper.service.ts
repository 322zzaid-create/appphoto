import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type {
  Wallpaper,
  WallpaperFilters,
  PaginatedResponse,
  ApiResponse,
  WallpaperStats,
  Profile,
} from '@/types'

export const wallpaperService = {
  async getById(id: string): Promise<Wallpaper> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async getBySlug(slug: string): Promise<Wallpaper> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wallpapers')
      .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (error) throw error
    return data
  },

  async list(
    filters: WallpaperFilters,
    page: number = 1
  ): Promise<PaginatedResponse<Wallpaper>> {
    const supabase = createClient()
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('wallpapers')
      .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)', { count: 'exact' })
      .eq('status', 'published')

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.categories?.length) {
      const catFilters = filters.categories.map(slug => `categories::text.ilike.%\"slug\":\"${slug}\"%`)
      query = query.or(catFilters.join(','))
    }
    if (filters.tags?.length) {
      const tagFilters = filters.tags.map(slug => `tags::text.ilike.%\"slug\":\"${slug}\"%`)
      query = query.or(tagFilters.join(','))
    }
    if (filters.orientation && filters.orientation !== 'all') {
      query = query.eq('orientation', filters.orientation)
    }
    if (filters.device_type && filters.device_type !== 'all') {
      query = query.eq('device_type', filters.device_type)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.colors?.length) {
      query = query.overlaps('dominant_colors', filters.colors)
    }

    const sortBy = filters.sort_by ?? 'newest'
    if (sortBy === 'popular') query = query.order('view_count', { ascending: false })
    else if (sortBy === 'most_downloaded') query = query.order('download_count', { ascending: false })
    else if (sortBy === 'most_liked') query = query.order('like_count', { ascending: false })
    else query = query.order('created_at', { ascending: false })

    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      per_page: ITEMS_PER_PAGE,
      total_pages: Math.ceil((count ?? 0) / ITEMS_PER_PAGE),
    }
  },

  async getStats(id: string): Promise<WallpaperStats> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('wallpapers')
      .select('view_count, download_count, like_count, favorite_count, share_count')
      .eq('id', id)
      .single()
    if (error) throw error
    return {
      views: data.view_count,
      downloads: data.download_count,
      likes: data.like_count,
      favorites: data.favorite_count,
      shares: data.share_count,
    }
  },

  async incrementViews(id: string): Promise<void> {
    const supabase = createClient()
    await supabase.rpc('increment_wallpaper_views', { p_wallpaper_id: id })
  },

  async trackView(id: string, userId: string | null): Promise<void> {
    const supabase = createClient()
    await supabase.from('views').insert({
      wallpaper_id: id,
      user_id: userId,
    })
  },

  async incrementDownloads(id: string): Promise<void> {
    const supabase = createClient()
    await supabase.rpc('increment_wallpaper_downloads', { p_wallpaper_id: id })
  },

  async toggleLike(id: string, userId: string): Promise<boolean> {
    const supabase = createClient()
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('wallpaper_id', id)
      .eq('user_id', userId)
      .single()

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id)
      return false
    }

    await supabase.from('likes').insert({ wallpaper_id: id, user_id: userId })
    return true
  },

  async getByUploader(userId: string, page: number = 1): Promise<PaginatedResponse<Wallpaper>> {
    const supabase = createClient()
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count, error } = await supabase
      .from('wallpapers')
      .select('*', { count: 'exact' })
      .eq('uploader_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      per_page: ITEMS_PER_PAGE,
      total_pages: Math.ceil((count ?? 0) / ITEMS_PER_PAGE),
    }
  },

  async deleteOwn(id: string, userId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('wallpapers')
      .delete()
      .eq('id', id)
      .eq('uploader_id', userId)
    if (error) throw error
  },

  async editOwn(
    id: string,
    userId: string,
    updates: { title: string; description: string; categories: { name: string; slug: string }[]; tags?: { name: string; slug: string }[] }
  ): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('wallpapers')
      .update({
        title: updates.title,
        description: updates.description || null,
        categories: updates.categories,
        tags: updates.tags ?? undefined,
      })
      .eq('id', id)
      .eq('uploader_id', userId)
    if (error) throw error
  },
}

export const wallpaperAdminService = {
  async listAll(
    page: number = 1,
    status?: string
  ): Promise<PaginatedResponse<Wallpaper>> {
    const supabase = createAdminClient()
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('wallpapers')
      .select('*, uploader:profiles!wallpapers_uploader_id_fkey(*)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    query = query.range(from, to)

    const { data, count, error } = await query
    if (error) throw error

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      per_page: ITEMS_PER_PAGE,
      total_pages: Math.ceil((count ?? 0) / ITEMS_PER_PAGE),
    }
  },

  async updateStatus(
    id: string,
    status: 'draft' | 'published' | 'archived' | 'rejected'
  ): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('wallpapers')
      .update({ status, ...(status === 'published' ? { published_at: new Date().toISOString() } : {}) })
      .eq('id', id)
    if (error) throw error
  },

  async setFeatured(id: string, featured: boolean): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('wallpapers')
      .update({
        is_featured: featured,
        featured_at: featured ? new Date().toISOString() : null,
      })
      .eq('id', id)
    if (error) throw error
  },

  async delete(id: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.from('wallpapers').delete().eq('id', id)
    if (error) throw error
  },

  async bulkUpdateStatus(
    ids: string[],
    status: 'draft' | 'published' | 'archived' | 'rejected'
  ): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('wallpapers')
      .update({ status, ...(status === 'published' ? { published_at: new Date().toISOString() } : {}) })
      .in('id', ids)
    if (error) throw error
  },
}
