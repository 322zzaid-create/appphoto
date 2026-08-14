import { createClient } from '@/lib/supabase/client'

export const ratingService = {
  async getUserRating(wallpaperId: string, userId: string): Promise<number | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('wallpaper_id', wallpaperId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data?.rating ?? null
  },

  async rate(wallpaperId: string, userId: string, rating: number): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('ratings')
      .upsert({
        user_id: userId,
        wallpaper_id: wallpaperId,
        rating,
      }, { onConflict: 'user_id,wallpaper_id' })
    if (error) throw error
  },

  async deleteRating(wallpaperId: string, userId: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('wallpaper_id', wallpaperId)
      .eq('user_id', userId)
    if (error) throw error
  },

  async getWallpaperRatings(wallpaperId: string): Promise<{ avg: number; count: number }> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('ratings')
      .select('rating')
      .eq('wallpaper_id', wallpaperId)
    if (error) throw error
    if (!data || data.length === 0) return { avg: 0, count: 0 }
    const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
    return { avg, count: data.length }
  },
}
