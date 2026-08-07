import { createClient } from './client'
import type { Wallpaper, StorageBucket } from '@/types'

export function getWallpaperUrl(path: string, bucket: StorageBucket): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function getSignedUrl(
  path: string,
  bucket: StorageBucket,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export function getWallpaperUrls(wallpaper: Wallpaper): {
  original: string
  thumbnail: string
  preview: string
  hd: string
} {
  const getPath = (url: string | null): string => url ?? ''

  return {
    original: getPath(wallpaper.original_url),
    thumbnail: getPath(wallpaper.thumbnail_url),
    preview: getPath(wallpaper.preview_url),
    hd: getPath(wallpaper.hd_url),
  }
}

export async function uploadWallpaper(
  file: File,
  userId: string,
  type: 'original'
): Promise<{ path: string; size: number }> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('wallpapers')
    .upload(fileName, file, {
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) throw error

  return {
    path: data.path,
    size: file.size,
  }
}

export async function deleteWallpaper(
  path: string,
  bucket: StorageBucket
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
