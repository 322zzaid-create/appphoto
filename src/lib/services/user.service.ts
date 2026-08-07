import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile, PaginatedResponse, Wallpaper } from '@/types'
import { ITEMS_PER_PAGE } from '@/lib/constants'

export const userService = {
  async getProfile(userId: string): Promise<Profile> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  async updateProfile(
    userId: string,
    updates: { full_name?: string; bio?: string; avatar_url?: string; website?: string }
  ): Promise<Profile> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getUploads(
    userId: string,
    page: number = 1
  ): Promise<PaginatedResponse<Wallpaper>> {
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

  async deleteAccount(userId: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error
  },

  async updateAvatar(userId: string, file: File): Promise<string> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)

    await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId)

    return urlData.publicUrl
  },
}

export const userAdminService = {
  async listUsers(
    page: number = 1,
    search?: string
  ): Promise<PaginatedResponse<Profile>> {
    const supabase = createAdminClient()
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`)
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

  async updateRole(userId: string, role: 'user' | 'admin' | 'artist'): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    if (error) throw error
  },

  async banUser(userId: string): Promise<void> {
    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error
  },

  async getUserStats(userId: string) {
    const supabase = createAdminClient()
    const { data: wallpapers, count: totalWallpapers } = await supabase
      .from('wallpapers')
      .select('id, view_count, download_count, like_count', { count: 'exact' })
      .eq('uploader_id', userId)

    const { count: totalDownloads } = await supabase
      .from('downloads')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    const { count: totalFavorites } = await supabase
      .from('favorites')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)

    return {
      totalWallpapers: totalWallpapers ?? 0,
      totalDownloads: totalDownloads ?? 0,
      totalFavorites: totalFavorites ?? 0,
      totalViews: wallpapers?.reduce((sum, w) => sum + (w.view_count ?? 0), 0) ?? 0,
    }
  },
}
