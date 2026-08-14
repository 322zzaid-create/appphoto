import { createClient } from '@/lib/supabase/client'

export const wallpaperService = {
  async trackView(id: string, userId: string | null): Promise<void> {
    const supabase = createClient()
    await supabase.from('views').insert({
      wallpaper_id: id,
      user_id: userId,
    })
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
