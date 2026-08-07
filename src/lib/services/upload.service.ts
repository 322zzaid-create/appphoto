import { createClient } from '@/lib/supabase/client'

export interface UploadProgress {
  fileIndex: number
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error'
  error?: string
  url?: string
}

export interface UploadResult {
  success: boolean
  wallpaperId?: string
  error?: string
}

export const uploadService = {
  async uploadWallpaper(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void,
  ): Promise<{ url: string; error?: string }> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    onProgress?.(10)

    const { data, error } = await supabase.storage
      .from('wallpapers-preview')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      return { url: '', error: error.message }
    }

    onProgress?.(80)

    const { data: urlData } = supabase.storage
      .from('wallpapers-preview')
      .getPublicUrl(data.path)

    onProgress?.(100)
    return { url: urlData.publicUrl }
  },

  async uploadOriginal(
    file: File,
    userId: string,
  ): Promise<{ url: string; error?: string }> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('wallpapers-original')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) return { url: '', error: error.message }

    const { data: urlData } = supabase.storage
      .from('wallpapers-original')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl }
  },

  async uploadThumbnail(
    file: File,
    userId: string,
  ): Promise<{ url: string; error?: string }> {
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `thumb-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    const { data, error } = await supabase.storage
      .from('wallpapers-thumbnail')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) return { url: '', error: error.message }

    const { data: urlData } = supabase.storage
      .from('wallpapers-thumbnail')
      .getPublicUrl(data.path)

    return { url: urlData.publicUrl }
  },

  async createWallpaperRecord(data: {
    title: string
    description: string
    categories: string[]
    tags: string[]
    device_type: string
    preview_url: string
    thumbnail_url: string
    original_url: string
    file_size: number
    width: number
    height: number
    uploader_id: string
  }): Promise<UploadResult> {
    const supabase = createClient()

    const { data: wallpaper, error } = await supabase
      .from('wallpapers')
      .insert({
        title: data.title,
        description: data.description || null,
        status: 'published',
        visibility: 'public',
        preview_url: data.preview_url,
        thumbnail_url: data.thumbnail_url,
        original_url: data.original_url,
        file_size: data.file_size,
        width: data.width,
        height: data.height,
        device_type: data.device_type,
        wallpaper_type: 'static',
        mime_type: 'image/jpeg',
        uploader_id: data.uploader_id,
        categories: data.categories.map(c => ({ name: c, slug: c })),
        tags: data.tags.map(t => ({ name: t, slug: t })),
        published_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, wallpaperId: wallpaper.id }
  },

  getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        resolve({ width: 1080, height: 1920 })
      }
      img.src = URL.createObjectURL(file)
    })
  },
}
